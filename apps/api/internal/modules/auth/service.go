package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"net/mail"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

var (
	ErrSessionCookieMissing = errors.New("session cookie is required")
	ErrInvalidSession       = errors.New("session is invalid")
	ErrInvalidCredentials   = errors.New("email or password is invalid")
	ErrInvalidRole          = errors.New("role is invalid")
	ErrInvalidEmail         = errors.New("email is invalid")
	ErrPasswordTooShort     = errors.New("password must be at least 8 characters")
	ErrInvalidResetToken    = errors.New("password reset token is invalid")
)

type Role string

const (
	RoleContributor Role = "contributor"
	RolePartner     Role = "partner"
	RoleAdmin       Role = "admin"
)

type Actor struct {
	Email string `json:"email"`
	Role  Role   `json:"role"`
}

const SessionCookieName = "rede_colmeia_session"

type actorContextKey struct{}

type Service struct {
	repository Repository
	sessionTTL time.Duration
	resetTTL   time.Duration
	now        func() time.Time
}

func NewService(repository Repository) *Service {
	if repository == nil {
		repository = NewInMemoryRepository()
	}
	return &Service{
		repository: repository,
		sessionTTL: 24 * time.Hour,
		resetTTL:   30 * time.Minute,
		now:        time.Now,
	}
}

func (s *Service) SeedCredentials(ctx context.Context, rawCredentials string) error {
	for _, pair := range strings.Split(rawCredentials, ",") {
		trimmed := strings.TrimSpace(pair)
		if trimmed == "" {
			continue
		}
		parts := strings.SplitN(trimmed, ":", 3)
		if len(parts) != 3 {
			continue
		}
		role := Role(strings.TrimSpace(parts[0]))
		email := strings.TrimSpace(parts[1])
		password := strings.TrimSpace(parts[2])
		if role == "" || email == "" || password == "" {
			continue
		}
		if !isAllowedRole(role) {
			continue
		}
		if _, err := mail.ParseAddress(email); err != nil {
			continue
		}

		hashBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			return fmt.Errorf("hash credential for %s: %w", email, err)
		}
		if err := s.repository.UpsertCredential(
			ctx,
			StoredCredential{
				Email:        email,
				Role:         role,
				PasswordHash: string(hashBytes),
			},
		); err != nil {
			return fmt.Errorf("upsert credential for %s: %w", email, err)
		}
	}
	return nil
}

func (s *Service) Register(ctx context.Context, email string, password string, role Role) (Actor, error) {
	if role == "" {
		role = RoleContributor
	}
	if !isAllowedRole(role) {
		return Actor{}, ErrInvalidRole
	}
	email = strings.ToLower(strings.TrimSpace(email))
	if _, err := mail.ParseAddress(email); err != nil {
		return Actor{}, ErrInvalidEmail
	}
	if len(strings.TrimSpace(password)) < 8 {
		return Actor{}, ErrPasswordTooShort
	}

	hashBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return Actor{}, fmt.Errorf("hash password: %w", err)
	}
	if err := s.repository.CreateCredential(ctx, StoredCredential{
		Email:        email,
		Role:         role,
		PasswordHash: string(hashBytes),
	}); err != nil {
		if errors.Is(err, ErrCredentialAlreadyExists) {
			return Actor{}, err
		}
		return Actor{}, fmt.Errorf("store credential: %w", err)
	}
	_ = s.repository.InsertAuthEvent(ctx, AuthEvent{
		Type:  "register",
		Email: email,
	})
	return Actor{
		Email: email,
		Role:  role,
	}, nil
}

func (s *Service) Login(ctx context.Context, email string, password string) (string, Actor, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	credential, err := s.repository.FindCredentialByEmail(ctx, email)
	if err != nil {
		return "", Actor{}, ErrInvalidCredentials
	}
	if bcrypt.CompareHashAndPassword([]byte(credential.PasswordHash), []byte(password)) != nil {
		return "", Actor{}, ErrInvalidCredentials
	}

	sessionID := randomSessionID()
	actor := Actor{
		Email: credential.Email,
		Role:  credential.Role,
	}
	if err := s.repository.InsertSession(ctx, StoredSession{
		ID:        sessionID,
		Actor:     actor,
		ExpiresAt: s.now().Add(s.sessionTTL),
	}); err != nil {
		return "", Actor{}, err
	}
	_ = s.repository.InsertAuthEvent(ctx, AuthEvent{
		Type:      "login",
		Email:     actor.Email,
		SessionID: sessionID,
	})

	return sessionID, actor, nil
}

func (s *Service) Authenticate(request *http.Request) (Actor, error) {
	cookie, err := request.Cookie(SessionCookieName)
	if err != nil || cookie.Value == "" {
		return Actor{}, ErrSessionCookieMissing
	}

	stored, err := s.repository.FindSessionByID(request.Context(), cookie.Value)
	if err != nil {
		return Actor{}, ErrInvalidSession
	}

	if stored.RevokedAt != nil {
		return Actor{}, ErrInvalidSession
	}
	if s.now().After(stored.ExpiresAt) {
		_ = s.repository.RevokeSession(request.Context(), cookie.Value)
		return Actor{}, ErrInvalidSession
	}

	return stored.Actor, nil
}

func (s *Service) Logout(ctx context.Context, sessionID string) {
	if sessionID == "" {
		return
	}
	_ = s.repository.RevokeSession(ctx, sessionID)
	_ = s.repository.InsertAuthEvent(ctx, AuthEvent{
		Type:      "logout",
		SessionID: sessionID,
	})
}

func (s *Service) LogoutAll(ctx context.Context, actor Actor) error {
	if err := s.repository.RevokeSessionsByEmail(ctx, actor.Email); err != nil {
		return err
	}
	_ = s.repository.InsertAuthEvent(ctx, AuthEvent{
		Type:  "logout_all",
		Email: actor.Email,
	})
	return nil
}

func (s *Service) RotateSession(ctx context.Context, currentSessionID string, actor Actor) (string, error) {
	if currentSessionID == "" {
		return "", ErrInvalidSession
	}
	if err := s.repository.RevokeSession(ctx, currentSessionID); err != nil {
		return "", err
	}
	nextSessionID := randomSessionID()
	if err := s.repository.InsertSession(ctx, StoredSession{
		ID:        nextSessionID,
		Actor:     actor,
		ExpiresAt: s.now().Add(s.sessionTTL),
	}); err != nil {
		return "", err
	}
	_ = s.repository.InsertAuthEvent(ctx, AuthEvent{
		Type:      "session_rotate",
		Email:     actor.Email,
		SessionID: nextSessionID,
		Meta:      "previous=" + currentSessionID,
	})
	return nextSessionID, nil
}

func (s *Service) RequestPasswordReset(ctx context.Context, email string) (string, error) {
	normalized := strings.ToLower(strings.TrimSpace(email))
	credential, err := s.repository.FindCredentialByEmail(ctx, normalized)
	if err != nil {
		return "", nil
	}

	rawToken := randomSessionID()
	tokenHash := hashToken(rawToken)
	if err := s.repository.CreatePasswordResetToken(ctx, StoredPasswordResetToken{
		TokenHash: tokenHash,
		Email:     credential.Email,
		ExpiresAt: s.now().Add(s.resetTTL),
	}); err != nil {
		return "", err
	}

	_ = s.repository.InsertAuthEvent(ctx, AuthEvent{
		Type:  "password_reset_requested",
		Email: credential.Email,
	})
	return rawToken, nil
}

func (s *Service) ConfirmPasswordReset(ctx context.Context, token string, newPassword string) error {
	if len(strings.TrimSpace(newPassword)) < 8 {
		return ErrPasswordTooShort
	}

	tokenHash := hashToken(strings.TrimSpace(token))
	resetToken, err := s.repository.FindPasswordResetToken(ctx, tokenHash)
	if err != nil {
		if errors.Is(err, ErrPasswordResetNotFound) {
			return ErrInvalidResetToken
		}
		return err
	}
	if resetToken.UsedAt != nil || s.now().After(resetToken.ExpiresAt) {
		return ErrInvalidResetToken
	}

	hashBytes, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("hash new password: %w", err)
	}

	if err := s.repository.UpdateCredentialPassword(ctx, resetToken.Email, string(hashBytes)); err != nil {
		return err
	}
	if err := s.repository.ConsumePasswordResetToken(ctx, tokenHash, s.now()); err != nil {
		return err
	}
	if err := s.repository.RevokeSessionsByEmail(ctx, resetToken.Email); err != nil {
		return err
	}
	_ = s.repository.InsertAuthEvent(ctx, AuthEvent{
		Type:  "password_reset_confirmed",
		Email: resetToken.Email,
	})
	return nil
}

func (s *Service) SessionTTL() time.Duration {
	return s.sessionTTL
}

func WithActor(ctx context.Context, actor Actor) context.Context {
	return context.WithValue(ctx, actorContextKey{}, actor)
}

func ActorFromContext(ctx context.Context) (Actor, bool) {
	actor, ok := ctx.Value(actorContextKey{}).(Actor)
	return actor, ok
}

func randomSessionID() string {
	buffer := make([]byte, 24)
	if _, err := rand.Read(buffer); err != nil {
		return "session-id-fallback"
	}
	return hex.EncodeToString(buffer)
}

func hashToken(rawToken string) string {
	sum := sha256.Sum256([]byte(rawToken))
	return hex.EncodeToString(sum[:])
}

func (s *Service) HasRole(actor Actor, accepted ...Role) bool {
	for _, role := range accepted {
		if role == actor.Role {
			return true
		}
	}
	return false
}

func isAllowedRole(role Role) bool {
	switch role {
	case RoleContributor, RolePartner, RoleAdmin:
		return true
	default:
		return false
	}
}

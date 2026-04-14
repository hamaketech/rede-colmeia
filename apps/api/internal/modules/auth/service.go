package auth

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"net/http"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

var (
	ErrSessionCookieMissing = errors.New("session cookie is required")
	ErrInvalidSession       = errors.New("session is invalid")
	ErrInvalidCredentials   = errors.New("email or password is invalid")
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
	now        func() time.Time
}

func NewService(repository Repository) *Service {
	if repository == nil {
		repository = NewInMemoryRepository()
	}
	return &Service{
		repository: repository,
		sessionTTL: 24 * time.Hour,
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

		hashBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		if err := s.repository.UpsertCredential(
			ctx,
			StoredCredential{
				Email:        email,
				Role:         role,
				PasswordHash: string(hashBytes),
			},
		); err != nil {
			return err
		}
	}
	return nil
}

func (s *Service) Login(ctx context.Context, email string, password string) (string, Actor, error) {
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

func (s *Service) HasRole(actor Actor, accepted ...Role) bool {
	for _, role := range accepted {
		if role == actor.Role {
			return true
		}
	}
	return false
}

package auth

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"net/http"
	"strings"
	"sync"
	"time"
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

type credential struct {
	email    string
	password string
	role     Role
}

type session struct {
	actor     Actor
	expiresAt time.Time
}

type actorContextKey struct{}

type Service struct {
	credentials map[string]credential
	sessions    map[string]session
	sessionTTL  time.Duration
	mutex       sync.RWMutex
	now         func() time.Time
}

func NewService(rawCredentials string) *Service {
	credentials := map[string]credential{}
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
		credentials[email] = credential{
			email:    email,
			password: password,
			role:     role,
		}
	}

	return &Service{
		credentials: credentials,
		sessions:    map[string]session{},
		sessionTTL:  24 * time.Hour,
		now:         time.Now,
	}
}

func (s *Service) Login(email string, password string) (string, Actor, error) {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	record, ok := s.credentials[email]
	if !ok || record.password != password {
		return "", Actor{}, ErrInvalidCredentials
	}

	sessionID := randomSessionID()
	actor := Actor{
		Email: record.email,
		Role:  record.role,
	}
	s.sessions[sessionID] = session{
		actor:     actor,
		expiresAt: s.now().Add(s.sessionTTL),
	}
	return sessionID, actor, nil
}

func (s *Service) Authenticate(request *http.Request) (Actor, error) {
	cookie, err := request.Cookie(SessionCookieName)
	if err != nil || cookie.Value == "" {
		return Actor{}, ErrSessionCookieMissing
	}

	s.mutex.RLock()
	stored, ok := s.sessions[cookie.Value]
	s.mutex.RUnlock()
	if !ok {
		return Actor{}, ErrInvalidSession
	}

	if s.now().After(stored.expiresAt) {
		s.mutex.Lock()
		delete(s.sessions, cookie.Value)
		s.mutex.Unlock()
		return Actor{}, ErrInvalidSession
	}

	return stored.actor, nil
}

func (s *Service) Logout(sessionID string) {
	if sessionID == "" {
		return
	}
	s.mutex.Lock()
	delete(s.sessions, sessionID)
	s.mutex.Unlock()
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

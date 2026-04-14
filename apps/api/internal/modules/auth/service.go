package auth

import (
	"errors"
	"net/http"
	"strings"
)

var (
	ErrMissingAuthorization = errors.New("authorization header is required")
	ErrInvalidAuthorization = errors.New("authorization header must use bearer scheme")
	ErrInvalidToken         = errors.New("invalid token")
)

type Role string

const (
	RoleContributor Role = "contributor"
	RolePartner     Role = "partner"
	RoleAdmin       Role = "admin"
)

type Actor struct {
	Token string
	Role  Role
}

type Service struct {
	tokenRoles map[string]Role
}

func NewService(rawTokens string) *Service {
	tokenRoles := map[string]Role{}
	for _, pair := range strings.Split(rawTokens, ",") {
		trimmed := strings.TrimSpace(pair)
		if trimmed == "" {
			continue
		}
		parts := strings.SplitN(trimmed, ":", 2)
		if len(parts) != 2 {
			continue
		}
		role := Role(strings.TrimSpace(parts[0]))
		token := strings.TrimSpace(parts[1])
		if role == "" || token == "" {
			continue
		}
		tokenRoles[token] = role
	}
	return &Service{
		tokenRoles: tokenRoles,
	}
}

func (s *Service) Authenticate(request *http.Request) (Actor, error) {
	header := request.Header.Get("Authorization")
	if header == "" {
		return Actor{}, ErrMissingAuthorization
	}
	parts := strings.SplitN(header, " ", 2)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
		return Actor{}, ErrInvalidAuthorization
	}
	token := strings.TrimSpace(parts[1])
	role, ok := s.tokenRoles[token]
	if !ok {
		return Actor{}, ErrInvalidToken
	}
	return Actor{
		Token: token,
		Role:  role,
	}, nil
}

func (s *Service) HasRole(actor Actor, accepted ...Role) bool {
	for _, role := range accepted {
		if role == actor.Role {
			return true
		}
	}
	return false
}

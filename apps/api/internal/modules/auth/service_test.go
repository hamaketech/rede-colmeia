package auth

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestAuthenticateSuccess(t *testing.T) {
	service := NewService("admin:token-admin,contributor:token-contributor")
	request := httptest.NewRequest(http.MethodGet, "/api/v1/auth/whoami", nil)
	request.Header.Set("Authorization", "Bearer token-admin")

	actor, err := service.Authenticate(request)
	if err != nil {
		t.Fatalf("expected nil error, got %v", err)
	}

	if actor.Role != RoleAdmin {
		t.Fatalf("expected role %q, got %q", RoleAdmin, actor.Role)
	}
}

func TestAuthenticateMissingToken(t *testing.T) {
	service := NewService("admin:token-admin")
	request := httptest.NewRequest(http.MethodGet, "/api/v1/auth/whoami", nil)

	_, err := service.Authenticate(request)
	if err != ErrMissingAuthorization {
		t.Fatalf("expected error %v, got %v", ErrMissingAuthorization, err)
	}
}

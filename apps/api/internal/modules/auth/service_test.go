package auth

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestLoginAndAuthenticateSuccess(t *testing.T) {
	service := NewService(NewInMemoryRepository())
	if err := service.SeedCredentials(
		context.Background(),
		"admin:admin@redecolmeia.dev:admin-pass,contributor:alice@redecolmeia.dev:alice-pass",
	); err != nil {
		t.Fatalf("expected nil error while seeding credentials, got %v", err)
	}

	sessionID, _, err := service.Login(context.Background(), "admin@redecolmeia.dev", "admin-pass")
	if err != nil {
		t.Fatalf("expected nil error, got %v", err)
	}

	request := httptest.NewRequest(http.MethodGet, "/api/v1/auth/whoami", nil)
	request.AddCookie(&http.Cookie{
		Name:  SessionCookieName,
		Value: sessionID,
	})

	actor, err := service.Authenticate(request)
	if err != nil {
		t.Fatalf("expected nil error, got %v", err)
	}

	if actor.Email != "admin@redecolmeia.dev" {
		t.Fatalf("expected actor email %q, got %q", "admin@redecolmeia.dev", actor.Email)
	}
	if actor.Role != RoleAdmin {
		t.Fatalf("expected role %q, got %q", RoleAdmin, actor.Role)
	}
}

func TestLoginInvalidCredentials(t *testing.T) {
	service := NewService(NewInMemoryRepository())
	if err := service.SeedCredentials(context.Background(), "admin:admin@redecolmeia.dev:admin-pass"); err != nil {
		t.Fatalf("expected nil error while seeding credentials, got %v", err)
	}

	_, _, err := service.Login(context.Background(), "admin@redecolmeia.dev", "wrong-pass")
	if err != ErrInvalidCredentials {
		t.Fatalf("expected error %v, got %v", ErrInvalidCredentials, err)
	}
}

func TestAuthenticateMissingSessionCookie(t *testing.T) {
	service := NewService(NewInMemoryRepository())
	request := httptest.NewRequest(http.MethodGet, "/api/v1/auth/whoami", nil)

	_, err := service.Authenticate(request)
	if err != ErrSessionCookieMissing {
		t.Fatalf("expected error %v, got %v", ErrSessionCookieMissing, err)
	}
}

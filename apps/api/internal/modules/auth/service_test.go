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

func TestRegisterAndLoginFlow(t *testing.T) {
	service := NewService(NewInMemoryRepository())

	actor, err := service.Register(
		context.Background(),
		"new-user@redecolmeia.dev",
		"new-user-pass",
		RoleContributor,
	)
	if err != nil {
		t.Fatalf("expected nil error, got %v", err)
	}
	if actor.Role != RoleContributor {
		t.Fatalf("expected role %q, got %q", RoleContributor, actor.Role)
	}

	_, _, err = service.Login(context.Background(), "new-user@redecolmeia.dev", "new-user-pass")
	if err != nil {
		t.Fatalf("expected nil error, got %v", err)
	}
}

func TestRegisterDuplicateCredential(t *testing.T) {
	service := NewService(NewInMemoryRepository())
	_, err := service.Register(context.Background(), "dup@redecolmeia.dev", "dup-pass-01", RoleContributor)
	if err != nil {
		t.Fatalf("expected nil error on first register, got %v", err)
	}

	_, err = service.Register(context.Background(), "dup@redecolmeia.dev", "dup-pass-02", RoleContributor)
	if err != ErrCredentialAlreadyExists {
		t.Fatalf("expected error %v, got %v", ErrCredentialAlreadyExists, err)
	}
}

func TestLogoutAllRevokesEverySession(t *testing.T) {
	service := NewService(NewInMemoryRepository())
	if err := service.SeedCredentials(context.Background(), "admin:admin@redecolmeia.dev:admin-pass"); err != nil {
		t.Fatalf("expected nil error while seeding credentials, got %v", err)
	}

	firstSessionID, actor, err := service.Login(context.Background(), "admin@redecolmeia.dev", "admin-pass")
	if err != nil {
		t.Fatalf("expected nil error, got %v", err)
	}
	secondSessionID, _, err := service.Login(context.Background(), "admin@redecolmeia.dev", "admin-pass")
	if err != nil {
		t.Fatalf("expected nil error, got %v", err)
	}

	if err := service.LogoutAll(context.Background(), actor); err != nil {
		t.Fatalf("expected nil error, got %v", err)
	}

	for _, sessionID := range []string{firstSessionID, secondSessionID} {
		request := httptest.NewRequest(http.MethodGet, "/api/v1/auth/whoami", nil)
		request.AddCookie(&http.Cookie{Name: SessionCookieName, Value: sessionID})
		if _, authErr := service.Authenticate(request); authErr != ErrInvalidSession {
			t.Fatalf("expected error %v, got %v", ErrInvalidSession, authErr)
		}
	}
}

func TestPasswordResetFlow(t *testing.T) {
	service := NewService(NewInMemoryRepository())
	if err := service.SeedCredentials(context.Background(), "admin:admin@redecolmeia.dev:admin-pass"); err != nil {
		t.Fatalf("expected nil error while seeding credentials, got %v", err)
	}

	resetToken, err := service.RequestPasswordReset(context.Background(), "admin@redecolmeia.dev")
	if err != nil {
		t.Fatalf("expected nil error, got %v", err)
	}
	if resetToken == "" {
		t.Fatalf("expected reset token to be generated")
	}

	if err := service.ConfirmPasswordReset(context.Background(), resetToken, "new-admin-pass"); err != nil {
		t.Fatalf("expected nil error, got %v", err)
	}

	if _, _, err := service.Login(context.Background(), "admin@redecolmeia.dev", "new-admin-pass"); err != nil {
		t.Fatalf("expected nil error, got %v", err)
	}
}

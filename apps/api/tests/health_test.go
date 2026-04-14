package tests

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	apphttp "github.com/rede-colmeia/apps/api/internal/http"
	"github.com/rede-colmeia/apps/api/internal/modules/auth"
	"github.com/rede-colmeia/apps/api/internal/modules/users"
)

func TestHealthEndpoint(t *testing.T) {
	authService := auth.NewService(auth.NewInMemoryRepository())
	if err := authService.SeedCredentials(context.Background(), "contributor:test@redecolmeia.dev:test-pass"); err != nil {
		t.Fatalf("expected nil error while seeding credentials, got %v", err)
	}
	authHandler := auth.NewHandler(authService)
	handler := apphttp.NewRouter(
		users.NewHandler(users.NewService(users.NewInMemoryRepository())),
		authHandler,
		authService,
	)
	request := httptest.NewRequest(http.MethodGet, "/health", nil)
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, recorder.Code)
	}
}

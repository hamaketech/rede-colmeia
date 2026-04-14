package tests

import (
	"net/http"
	"net/http/httptest"
	"testing"

	apphttp "github.com/rede-colmeia/apps/api/internal/http"
	"github.com/rede-colmeia/apps/api/internal/modules/auth"
	"github.com/rede-colmeia/apps/api/internal/modules/users"
)

func TestUsersPingRequiresAuthorization(t *testing.T) {
	authService := auth.NewService("contributor:token-contributor,partner:token-partner")
	handler := apphttp.NewRouter(users.NewHandler(users.NewService(users.NewInMemoryRepository())), authService)
	request := httptest.NewRequest(http.MethodGet, "/api/v1/users/ping", nil)
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", http.StatusUnauthorized, recorder.Code)
	}
}

func TestUsersPingAllowsContributor(t *testing.T) {
	authService := auth.NewService("contributor:token-contributor,partner:token-partner")
	handler := apphttp.NewRouter(users.NewHandler(users.NewService(users.NewInMemoryRepository())), authService)
	request := httptest.NewRequest(http.MethodGet, "/api/v1/users/ping", nil)
	request.Header.Set("Authorization", "Bearer token-contributor")
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, recorder.Code)
	}
}

func TestUsersPingRejectsPartnerRole(t *testing.T) {
	authService := auth.NewService("contributor:token-contributor,partner:token-partner")
	handler := apphttp.NewRouter(users.NewHandler(users.NewService(users.NewInMemoryRepository())), authService)
	request := httptest.NewRequest(http.MethodGet, "/api/v1/users/ping", nil)
	request.Header.Set("Authorization", "Bearer token-partner")
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusForbidden {
		t.Fatalf("expected status %d, got %d", http.StatusForbidden, recorder.Code)
	}
}

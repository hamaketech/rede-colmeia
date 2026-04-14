package tests

import (
	"net/http"
	"net/http/httptest"
	"testing"

	apphttp "github.com/rede-colmeia/apps/api/internal/http"
	"github.com/rede-colmeia/apps/api/internal/modules/auth"
	"github.com/rede-colmeia/apps/api/internal/modules/users"
)

func TestHealthEndpoint(t *testing.T) {
	authService := auth.NewService("contributor:test-token")
	handler := apphttp.NewRouter(users.NewHandler(users.NewService(users.NewInMemoryRepository())), authService)
	request := httptest.NewRequest(http.MethodGet, "/health", nil)
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, recorder.Code)
	}
}

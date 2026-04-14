package tests

import (
	"bytes"
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	apphttp "github.com/rede-colmeia/apps/api/internal/http"
	"github.com/rede-colmeia/apps/api/internal/modules/auth"
	"github.com/rede-colmeia/apps/api/internal/modules/users"
)

func newAuthenticatedHandler() http.Handler {
	authService := auth.NewService(auth.NewInMemoryRepository())
	if err := authService.SeedCredentials(
		context.Background(),
		"contributor:contributor@redecolmeia.dev:contributor-pass,partner:partner@redecolmeia.dev:partner-pass",
	); err != nil {
		panic(err)
	}
	authHandler := auth.NewHandler(authService)
	return apphttp.NewRouter(
		users.NewHandler(users.NewService(users.NewInMemoryRepository())),
		authHandler,
		authService,
	)
}

func loginAndGetSessionCookie(t *testing.T, handler http.Handler, email string, password string) *http.Cookie {
	t.Helper()

	body := []byte(`{"email":"` + email + `","password":"` + password + `"}`)
	request := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewBuffer(body))
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, recorder.Code)
	}

	for _, cookie := range recorder.Result().Cookies() {
		if cookie.Name == auth.SessionCookieName {
			return cookie
		}
	}

	t.Fatalf("expected auth session cookie to be set")
	return nil
}

func TestUsersPingRequiresAuthorization(t *testing.T) {
	handler := newAuthenticatedHandler()
	request := httptest.NewRequest(http.MethodGet, "/api/v1/users/ping", nil)
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", http.StatusUnauthorized, recorder.Code)
	}
}

func TestUsersPingAllowsContributor(t *testing.T) {
	handler := newAuthenticatedHandler()
	sessionCookie := loginAndGetSessionCookie(
		t,
		handler,
		"contributor@redecolmeia.dev",
		"contributor-pass",
	)

	request := httptest.NewRequest(http.MethodGet, "/api/v1/users/ping", nil)
	request.AddCookie(sessionCookie)
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, recorder.Code)
	}
}

func TestUsersPingRejectsPartnerRole(t *testing.T) {
	handler := newAuthenticatedHandler()
	sessionCookie := loginAndGetSessionCookie(
		t,
		handler,
		"partner@redecolmeia.dev",
		"partner-pass",
	)

	request := httptest.NewRequest(http.MethodGet, "/api/v1/users/ping", nil)
	request.AddCookie(sessionCookie)
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusForbidden {
		t.Fatalf("expected status %d, got %d", http.StatusForbidden, recorder.Code)
	}
}

func TestWhoAmIReturnsSessionActor(t *testing.T) {
	handler := newAuthenticatedHandler()
	sessionCookie := loginAndGetSessionCookie(
		t,
		handler,
		"contributor@redecolmeia.dev",
		"contributor-pass",
	)

	request := httptest.NewRequest(http.MethodGet, "/api/v1/auth/whoami", nil)
	request.AddCookie(sessionCookie)
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, recorder.Code)
	}
}

func TestLogoutRevokesSession(t *testing.T) {
	handler := newAuthenticatedHandler()
	sessionCookie := loginAndGetSessionCookie(
		t,
		handler,
		"contributor@redecolmeia.dev",
		"contributor-pass",
	)

	logoutRequest := httptest.NewRequest(http.MethodPost, "/api/v1/auth/logout", nil)
	logoutRequest.AddCookie(sessionCookie)
	logoutRecorder := httptest.NewRecorder()
	handler.ServeHTTP(logoutRecorder, logoutRequest)

	if logoutRecorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, logoutRecorder.Code)
	}

	pingRequest := httptest.NewRequest(http.MethodGet, "/api/v1/users/ping", nil)
	pingRequest.AddCookie(sessionCookie)
	pingRecorder := httptest.NewRecorder()
	handler.ServeHTTP(pingRecorder, pingRequest)

	if pingRecorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", http.StatusUnauthorized, pingRecorder.Code)
	}
}

func TestRegisterAndLoginEndpointFlow(t *testing.T) {
	handler := newAuthenticatedHandler()

	registerBody := []byte(`{"email":"fresh@redecolmeia.dev","password":"fresh-pass-123","role":"contributor"}`)
	registerRequest := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewBuffer(registerBody))
	registerRecorder := httptest.NewRecorder()
	handler.ServeHTTP(registerRecorder, registerRequest)

	if registerRecorder.Code != http.StatusCreated {
		t.Fatalf("expected status %d, got %d", http.StatusCreated, registerRecorder.Code)
	}

	loginCookie := loginAndGetSessionCookie(t, handler, "fresh@redecolmeia.dev", "fresh-pass-123")
	whoAmIRequest := httptest.NewRequest(http.MethodGet, "/api/v1/auth/whoami", nil)
	whoAmIRequest.AddCookie(loginCookie)
	whoAmIRecorder := httptest.NewRecorder()
	handler.ServeHTTP(whoAmIRecorder, whoAmIRequest)

	if whoAmIRecorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, whoAmIRecorder.Code)
	}
}

func TestRegisterRejectsShortPassword(t *testing.T) {
	handler := newAuthenticatedHandler()

	registerBody := []byte(`{"email":"short@redecolmeia.dev","password":"test+00","role":"contributor"}`)
	registerRequest := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewBuffer(registerBody))
	registerRecorder := httptest.NewRecorder()
	handler.ServeHTTP(registerRecorder, registerRequest)

	if registerRecorder.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d", http.StatusBadRequest, registerRecorder.Code)
	}

	if !strings.Contains(registerRecorder.Body.String(), "password must be at least 8 characters") {
		t.Fatalf("expected password length error message, got %q", registerRecorder.Body.String())
	}
}

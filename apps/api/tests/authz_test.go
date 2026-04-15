package tests

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	apphttp "github.com/rede-colmeia/apps/api/internal/http"
	"github.com/rede-colmeia/apps/api/internal/modules/auth"
	"github.com/rede-colmeia/apps/api/internal/modules/ops"
	"github.com/rede-colmeia/apps/api/internal/modules/users"
	"github.com/rede-colmeia/apps/api/internal/modules/workflow"
)

func newAuthenticatedHandler() http.Handler {
	return newAuthenticatedHandlerWithResetExposure(true)
}

func newAuthenticatedHandlerWithResetExposure(exposeResetToken bool) http.Handler {
	authService := auth.NewService(auth.NewInMemoryRepository())
	if err := authService.SeedCredentials(
		context.Background(),
		"contributor:contributor@redecolmeia.dev:contributor-pass,partner:partner@redecolmeia.dev:partner-pass",
	); err != nil {
		panic(err)
	}
	authHandler := auth.NewHandler(authService, exposeResetToken)
	opsHandler := ops.NewHandler(ops.NewService(ops.NewInMemoryRepository()))
	workflowHandler := workflow.NewHandler(workflow.NewService(workflow.NewInMemoryRepository()))
	return apphttp.NewRouter(
		users.NewHandler(users.NewService(users.NewInMemoryRepository())),
		authHandler,
		opsHandler,
		workflowHandler,
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

func TestLogoutAllRevokesEverySession(t *testing.T) {
	handler := newAuthenticatedHandler()
	firstCookie := loginAndGetSessionCookie(t, handler, "contributor@redecolmeia.dev", "contributor-pass")
	secondCookie := loginAndGetSessionCookie(t, handler, "contributor@redecolmeia.dev", "contributor-pass")

	logoutAllRequest := httptest.NewRequest(http.MethodPost, "/api/v1/auth/logout-all", nil)
	logoutAllRequest.AddCookie(firstCookie)
	logoutAllRecorder := httptest.NewRecorder()
	handler.ServeHTTP(logoutAllRecorder, logoutAllRequest)
	if logoutAllRecorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, logoutAllRecorder.Code)
	}

	for _, cookie := range []*http.Cookie{firstCookie, secondCookie} {
		pingRequest := httptest.NewRequest(http.MethodGet, "/api/v1/users/ping", nil)
		pingRequest.AddCookie(cookie)
		pingRecorder := httptest.NewRecorder()
		handler.ServeHTTP(pingRecorder, pingRequest)
		if pingRecorder.Code != http.StatusUnauthorized {
			t.Fatalf("expected status %d, got %d", http.StatusUnauthorized, pingRecorder.Code)
		}
	}
}

func TestRotateSessionInvalidatesPreviousCookie(t *testing.T) {
	handler := newAuthenticatedHandler()
	sessionCookie := loginAndGetSessionCookie(t, handler, "contributor@redecolmeia.dev", "contributor-pass")

	rotateRequest := httptest.NewRequest(http.MethodPost, "/api/v1/auth/session/rotate", nil)
	rotateRequest.AddCookie(sessionCookie)
	rotateRecorder := httptest.NewRecorder()
	handler.ServeHTTP(rotateRecorder, rotateRequest)
	if rotateRecorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, rotateRecorder.Code)
	}

	var nextCookie *http.Cookie
	for _, cookie := range rotateRecorder.Result().Cookies() {
		if cookie.Name == auth.SessionCookieName {
			nextCookie = cookie
			break
		}
	}
	if nextCookie == nil {
		t.Fatalf("expected rotated cookie in response")
	}

	oldPingRequest := httptest.NewRequest(http.MethodGet, "/api/v1/users/ping", nil)
	oldPingRequest.AddCookie(sessionCookie)
	oldPingRecorder := httptest.NewRecorder()
	handler.ServeHTTP(oldPingRecorder, oldPingRequest)
	if oldPingRecorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", http.StatusUnauthorized, oldPingRecorder.Code)
	}

	newPingRequest := httptest.NewRequest(http.MethodGet, "/api/v1/users/ping", nil)
	newPingRequest.AddCookie(nextCookie)
	newPingRecorder := httptest.NewRecorder()
	handler.ServeHTTP(newPingRecorder, newPingRequest)
	if newPingRecorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, newPingRecorder.Code)
	}
}

func TestPasswordResetRequestAndConfirmFlow(t *testing.T) {
	handler := newAuthenticatedHandler()

	requestResetBody := []byte(`{"email":"contributor@redecolmeia.dev"}`)
	requestResetRequest := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/auth/password-reset/request",
		bytes.NewBuffer(requestResetBody),
	)
	requestResetRecorder := httptest.NewRecorder()
	handler.ServeHTTP(requestResetRecorder, requestResetRequest)
	if requestResetRecorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, requestResetRecorder.Code)
	}

	var resetPayload struct {
		OK   bool `json:"ok"`
		Data struct {
			ResetToken string `json:"resetToken"`
		} `json:"data"`
	}
	if err := json.NewDecoder(requestResetRecorder.Body).Decode(&resetPayload); err != nil {
		t.Fatalf("expected valid reset response payload, got %v", err)
	}
	if !resetPayload.OK || resetPayload.Data.ResetToken == "" {
		t.Fatalf("expected reset token in response payload")
	}

	confirmBody := []byte(`{"token":"` + resetPayload.Data.ResetToken + `","newPassword":"brand-new-pass"}`)
	confirmRequest := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/auth/password-reset/confirm",
		bytes.NewBuffer(confirmBody),
	)
	confirmRecorder := httptest.NewRecorder()
	handler.ServeHTTP(confirmRecorder, confirmRequest)
	if confirmRecorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, confirmRecorder.Code)
	}

	loginRequest := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/auth/login",
		bytes.NewBuffer([]byte(`{"email":"contributor@redecolmeia.dev","password":"brand-new-pass"}`)),
	)
	loginRecorder := httptest.NewRecorder()
	handler.ServeHTTP(loginRecorder, loginRequest)
	if loginRecorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, loginRecorder.Code)
	}
}

func TestSessionsEndpointListsActorSessions(t *testing.T) {
	handler := newAuthenticatedHandler()
	firstCookie := loginAndGetSessionCookie(t, handler, "contributor@redecolmeia.dev", "contributor-pass")
	_ = loginAndGetSessionCookie(t, handler, "contributor@redecolmeia.dev", "contributor-pass")

	sessionsRequest := httptest.NewRequest(http.MethodGet, "/api/v1/auth/sessions", nil)
	sessionsRequest.AddCookie(firstCookie)
	sessionsRecorder := httptest.NewRecorder()
	handler.ServeHTTP(sessionsRecorder, sessionsRequest)

	if sessionsRecorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, sessionsRecorder.Code)
	}

	var payload struct {
		OK   bool `json:"ok"`
		Data struct {
			Sessions []struct {
				ID        string `json:"id"`
				IsCurrent bool   `json:"isCurrent"`
			} `json:"sessions"`
		} `json:"data"`
	}
	if err := json.NewDecoder(sessionsRecorder.Body).Decode(&payload); err != nil {
		t.Fatalf("expected valid sessions payload, got %v", err)
	}
	if !payload.OK || len(payload.Data.Sessions) < 2 {
		t.Fatalf("expected at least two sessions, got %+v", payload.Data.Sessions)
	}
}

func TestRevokeSessionByIDInvalidatesOnlyTargetSession(t *testing.T) {
	handler := newAuthenticatedHandler()
	firstCookie := loginAndGetSessionCookie(t, handler, "contributor@redecolmeia.dev", "contributor-pass")
	secondCookie := loginAndGetSessionCookie(t, handler, "contributor@redecolmeia.dev", "contributor-pass")

	revokeRequest := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/auth/sessions/revoke",
		bytes.NewBuffer([]byte(`{"sessionId":"`+secondCookie.Value+`"}`)),
	)
	revokeRequest.AddCookie(firstCookie)
	revokeRecorder := httptest.NewRecorder()
	handler.ServeHTTP(revokeRecorder, revokeRequest)

	if revokeRecorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, revokeRecorder.Code)
	}

	validRequest := httptest.NewRequest(http.MethodGet, "/api/v1/auth/whoami", nil)
	validRequest.AddCookie(firstCookie)
	validRecorder := httptest.NewRecorder()
	handler.ServeHTTP(validRecorder, validRequest)
	if validRecorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, validRecorder.Code)
	}

	revokedRequest := httptest.NewRequest(http.MethodGet, "/api/v1/auth/whoami", nil)
	revokedRequest.AddCookie(secondCookie)
	revokedRecorder := httptest.NewRecorder()
	handler.ServeHTTP(revokedRecorder, revokedRequest)
	if revokedRecorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", http.StatusUnauthorized, revokedRecorder.Code)
	}
}

func TestSessionsEndpointHidesRevokedSessions(t *testing.T) {
	handler := newAuthenticatedHandler()
	firstCookie := loginAndGetSessionCookie(t, handler, "contributor@redecolmeia.dev", "contributor-pass")
	secondCookie := loginAndGetSessionCookie(t, handler, "contributor@redecolmeia.dev", "contributor-pass")

	revokeRequest := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/auth/sessions/revoke",
		bytes.NewBuffer([]byte(`{"sessionId":"`+secondCookie.Value+`"}`)),
	)
	revokeRequest.AddCookie(firstCookie)
	revokeRecorder := httptest.NewRecorder()
	handler.ServeHTTP(revokeRecorder, revokeRequest)
	if revokeRecorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, revokeRecorder.Code)
	}

	sessionsRequest := httptest.NewRequest(http.MethodGet, "/api/v1/auth/sessions", nil)
	sessionsRequest.AddCookie(firstCookie)
	sessionsRecorder := httptest.NewRecorder()
	handler.ServeHTTP(sessionsRecorder, sessionsRequest)
	if sessionsRecorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, sessionsRecorder.Code)
	}

	var payload struct {
		Data struct {
			Sessions []struct {
				ID string `json:"id"`
			} `json:"sessions"`
		} `json:"data"`
	}
	if err := json.NewDecoder(sessionsRecorder.Body).Decode(&payload); err != nil {
		t.Fatalf("expected valid payload, got %v", err)
	}
	if len(payload.Data.Sessions) != 1 {
		t.Fatalf("expected 1 active session, got %d", len(payload.Data.Sessions))
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

func TestPasswordResetRequestThrottlesRepeatedCalls(t *testing.T) {
	handler := newAuthenticatedHandler()

	requestBody := []byte(`{"email":"contributor@redecolmeia.dev"}`)
	firstRequest := httptest.NewRequest(http.MethodPost, "/api/v1/auth/password-reset/request", bytes.NewBuffer(requestBody))
	firstRecorder := httptest.NewRecorder()
	handler.ServeHTTP(firstRecorder, firstRequest)
	if firstRecorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, firstRecorder.Code)
	}

	secondRequest := httptest.NewRequest(http.MethodPost, "/api/v1/auth/password-reset/request", bytes.NewBuffer(requestBody))
	secondRecorder := httptest.NewRecorder()
	handler.ServeHTTP(secondRecorder, secondRequest)
	if secondRecorder.Code != http.StatusTooManyRequests {
		t.Fatalf("expected status %d, got %d", http.StatusTooManyRequests, secondRecorder.Code)
	}
}

func TestPasswordResetRequestDoesNotExposeTokenOutsideDev(t *testing.T) {
	handler := newAuthenticatedHandlerWithResetExposure(false)

	requestBody := []byte(`{"email":"contributor@redecolmeia.dev"}`)
	request := httptest.NewRequest(http.MethodPost, "/api/v1/auth/password-reset/request", bytes.NewBuffer(requestBody))
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, recorder.Code)
	}

	var payload map[string]any
	if err := json.NewDecoder(recorder.Body).Decode(&payload); err != nil {
		t.Fatalf("expected valid payload, got %v", err)
	}

	data, ok := payload["data"].(map[string]any)
	if !ok {
		t.Fatalf("expected data object, got %+v", payload["data"])
	}
	if _, hasToken := data["resetToken"]; hasToken {
		t.Fatalf("expected resetToken to be hidden when exposure is disabled")
	}
}

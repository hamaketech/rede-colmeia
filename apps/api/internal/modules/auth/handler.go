package auth

import (
	"encoding/json"
	"errors"
	"net/http"
)

type Handler struct {
	service          *Service
	exposeResetToken bool
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type registerRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     Role   `json:"role"`
}

type requestResetRequest struct {
	Email string `json:"email"`
}

type confirmResetRequest struct {
	Token       string `json:"token"`
	NewPassword string `json:"newPassword"`
}

type revokeSessionRequest struct {
	SessionID string `json:"sessionId"`
}

func NewHandler(service *Service, exposeResetToken bool) *Handler {
	return &Handler{
		service:          service,
		exposeResetToken: exposeResetToken,
	}
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var payload loginRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, "validation_error", "invalid login payload", nil)
		return
	}

	sessionID, actor, err := h.service.Login(r.Context(), payload.Email, payload.Password)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "unauthorized", "invalid credentials", nil)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     SessionCookieName,
		Value:    sessionID,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int(h.service.SessionTTL().Seconds()),
	})

	writeSuccess(w, http.StatusOK, map[string]any{
		"actor": actor,
	})
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var payload registerRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, "validation_error", "invalid register payload", nil)
		return
	}

	actor, err := h.service.Register(r.Context(), payload.Email, payload.Password, payload.Role)
	if err != nil {
		switch {
		case errors.Is(err, ErrCredentialAlreadyExists):
			writeError(w, http.StatusConflict, "validation_error", "credential already exists", nil)
		case errors.Is(err, ErrInvalidRole):
			writeError(
				w,
				http.StatusBadRequest,
				"validation_error",
				"role must be one of: contributor, partner, admin",
				map[string][]string{"role": {"contributor", "partner", "admin"}},
			)
		case errors.Is(err, ErrInvalidEmail):
			writeError(w, http.StatusBadRequest, "validation_error", "email is invalid", nil)
		case errors.Is(err, ErrPasswordTooShort):
			writeError(w, http.StatusBadRequest, "validation_error", "password must be at least 8 characters", nil)
		case errors.Is(err, ErrInvalidCredentials):
			writeError(w, http.StatusBadRequest, "validation_error", "invalid register payload", nil)
		default:
			writeError(w, http.StatusInternalServerError, "internal_error", "internal server error", nil)
		}
		return
	}

	writeSuccess(w, http.StatusCreated, map[string]any{
		"actor": actor,
	})
}

func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	cookie, err := r.Cookie(SessionCookieName)
	if err == nil {
		h.service.Logout(r.Context(), cookie.Value)
	}

	http.SetCookie(w, &http.Cookie{
		Name:     SessionCookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
	})

	writeSuccess(w, http.StatusOK, map[string]string{
		"message": "session revoked",
	})
}

func (h *Handler) WhoAmI(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	actor, ok := ActorFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized", "unauthorized", nil)
		return
	}

	writeSuccess(w, http.StatusOK, map[string]any{
		"actor": actor,
	})
}

func (h *Handler) LogoutAll(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	actor, ok := ActorFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized", "unauthorized", nil)
		return
	}

	if err := h.service.LogoutAll(r.Context(), actor); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "could not revoke sessions", nil)
		return
	}

	cookie, err := r.Cookie(SessionCookieName)
	if err == nil {
		h.service.Logout(r.Context(), cookie.Value)
	}
	http.SetCookie(w, &http.Cookie{
		Name:     SessionCookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
	})

	writeSuccess(w, http.StatusOK, map[string]string{
		"message": "all sessions revoked",
	})
}

func (h *Handler) RotateSession(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	actor, ok := ActorFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized", "unauthorized", nil)
		return
	}
	currentCookie, err := r.Cookie(SessionCookieName)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "unauthorized", "session cookie is required", nil)
		return
	}

	nextSessionID, err := h.service.RotateSession(r.Context(), currentCookie.Value, actor)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "unauthorized", "could not rotate session", nil)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     SessionCookieName,
		Value:    nextSessionID,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int(h.service.SessionTTL().Seconds()),
	})

	writeSuccess(w, http.StatusOK, map[string]string{
		"message": "session rotated",
	})
}

func (h *Handler) Sessions(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	actor, ok := ActorFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized", "unauthorized", nil)
		return
	}
	currentCookie, err := r.Cookie(SessionCookieName)
	currentSessionID := ""
	if err == nil {
		currentSessionID = currentCookie.Value
	}

	sessions, err := h.service.ListActorSessions(r.Context(), actor, currentSessionID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "could not list sessions", nil)
		return
	}

	writeSuccess(w, http.StatusOK, map[string]any{
		"sessions": sessions,
	})
}

func (h *Handler) RevokeSessionByID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	actor, ok := ActorFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized", "unauthorized", nil)
		return
	}

	var payload revokeSessionRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, "validation_error", "invalid revoke session payload", nil)
		return
	}
	if payload.SessionID == "" {
		writeError(w, http.StatusBadRequest, "validation_error", "sessionId is required", nil)
		return
	}

	err := h.service.RevokeActorSession(r.Context(), actor, payload.SessionID)
	if err != nil {
		switch {
		case errors.Is(err, ErrSessionNotFound):
			writeError(w, http.StatusNotFound, "not_found", "session not found", nil)
		case errors.Is(err, ErrSessionForbidden):
			writeError(w, http.StatusForbidden, "forbidden", "session does not belong to actor", nil)
		default:
			writeError(w, http.StatusInternalServerError, "internal_error", "could not revoke session", nil)
		}
		return
	}

	currentCookie, cookieErr := r.Cookie(SessionCookieName)
	if cookieErr == nil && currentCookie.Value == payload.SessionID {
		http.SetCookie(w, &http.Cookie{
			Name:     SessionCookieName,
			Value:    "",
			Path:     "/",
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
			MaxAge:   -1,
		})
	}

	writeSuccess(w, http.StatusOK, map[string]string{
		"message": "session revoked",
	})
}

func (h *Handler) RequestPasswordReset(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var payload requestResetRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, "validation_error", "invalid reset request payload", nil)
		return
	}

	resetToken, err := h.service.RequestPasswordReset(r.Context(), payload.Email)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "could not create reset token", nil)
		return
	}

	data := map[string]any{
		"message": "if account exists, reset instructions were generated",
	}
	if h.exposeResetToken && resetToken != "" {
		data["resetToken"] = resetToken
	}

	writeSuccess(w, http.StatusOK, data)
}

func (h *Handler) ConfirmPasswordReset(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var payload confirmResetRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, "validation_error", "invalid reset confirm payload", nil)
		return
	}

	err := h.service.ConfirmPasswordReset(r.Context(), payload.Token, payload.NewPassword)
	if err != nil {
		switch {
		case errors.Is(err, ErrPasswordTooShort):
			writeError(w, http.StatusBadRequest, "validation_error", "password must be at least 8 characters", nil)
		case errors.Is(err, ErrInvalidResetToken):
			writeError(w, http.StatusUnauthorized, "unauthorized", "password reset token is invalid", nil)
		default:
			writeError(w, http.StatusInternalServerError, "internal_error", "could not reset password", nil)
		}
		return
	}

	writeSuccess(w, http.StatusOK, map[string]string{
		"message": "password reset completed",
	})
}

func writeSuccess(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]any{
		"ok":   true,
		"data": payload,
	})
}

func writeError(w http.ResponseWriter, status int, code string, message string, details map[string][]string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	errorPayload := map[string]any{
		"code":    code,
		"message": message,
	}
	if requestID := w.Header().Get("X-Request-ID"); requestID != "" {
		errorPayload["requestId"] = requestID
	}
	if len(details) > 0 {
		errorPayload["details"] = details
	}

	_ = json.NewEncoder(w).Encode(map[string]any{
		"ok":    false,
		"error": errorPayload,
	})
}

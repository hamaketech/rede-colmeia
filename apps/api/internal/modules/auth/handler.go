package auth

import (
	"encoding/json"
	"errors"
	"net/http"
)

type Handler struct {
	service *Service
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

func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var payload loginRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid login payload", http.StatusBadRequest)
		return
	}

	sessionID, actor, err := h.service.Login(r.Context(), payload.Email, payload.Password)
	if err != nil {
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
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

	writeJSON(w, http.StatusOK, map[string]any{
		"status": "ok",
		"actor":  actor,
	})
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var payload registerRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid register payload", http.StatusBadRequest)
		return
	}

	actor, err := h.service.Register(r.Context(), payload.Email, payload.Password, payload.Role)
	if err != nil {
		switch {
		case errors.Is(err, ErrCredentialAlreadyExists):
			http.Error(w, "credential already exists", http.StatusConflict)
		case errors.Is(err, ErrInvalidRole):
			http.Error(w, "role must be one of: contributor, partner, admin", http.StatusBadRequest)
		case errors.Is(err, ErrInvalidEmail):
			http.Error(w, "email is invalid", http.StatusBadRequest)
		case errors.Is(err, ErrPasswordTooShort):
			http.Error(w, "password must be at least 8 characters", http.StatusBadRequest)
		case errors.Is(err, ErrInvalidCredentials):
			http.Error(w, "invalid register payload", http.StatusBadRequest)
		default:
			http.Error(w, "internal server error", http.StatusInternalServerError)
		}
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"status": "created",
		"actor":  actor,
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

	writeJSON(w, http.StatusOK, map[string]string{
		"status": "ok",
	})
}

func (h *Handler) WhoAmI(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	actor, ok := ActorFromContext(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"status": "ok",
		"actor":  actor,
	})
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

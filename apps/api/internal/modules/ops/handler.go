package ops

import (
	"encoding/json"
	"net/http"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

func (h *Handler) TransparencySummary(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	summary, err := h.service.TransparencySummary(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "could not load transparency summary")
		return
	}

	writeSuccess(w, http.StatusOK, map[string]any{
		"summary": summary,
	})
}

func (h *Handler) Indicators(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	indicators, err := h.service.Indicators(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "could not load operational indicators")
		return
	}

	writeSuccess(w, http.StatusOK, map[string]any{
		"indicators": indicators,
	})
}

func (h *Handler) SubscriptionsSummary(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	summary, err := h.service.SubscriptionsSummary(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "could not load contribution summary")
		return
	}

	writeSuccess(w, http.StatusOK, map[string]any{
		"summary": summary,
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

func writeError(w http.ResponseWriter, status int, code string, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]any{
		"ok": false,
		"error": map[string]any{
			"code":    code,
			"message": message,
		},
	})
}

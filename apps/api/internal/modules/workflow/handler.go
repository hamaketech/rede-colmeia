package workflow

import (
	"encoding/json"
	"net/http"
	"strconv"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) PartnersSummary(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	summary, err := h.service.PartnersSummary(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "could not load partner summary")
		return
	}
	writeSuccess(w, http.StatusOK, map[string]any{"summary": summary})
}

func (h *Handler) Partners(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	page, pageSize := readPagination(r)
	items, err := h.service.Partners(r.Context(), page, pageSize)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "could not load partners")
		return
	}
	writeSuccess(w, http.StatusOK, map[string]any{"items": items, "page": page, "pageSize": pageSize})
}

func (h *Handler) BeneficiariesSummary(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	summary, err := h.service.BeneficiariesSummary(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "could not load beneficiary summary")
		return
	}
	writeSuccess(w, http.StatusOK, map[string]any{"summary": summary})
}

func (h *Handler) Beneficiaries(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	page, pageSize := readPagination(r)
	items, err := h.service.Beneficiaries(r.Context(), page, pageSize)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "could not load beneficiaries")
		return
	}
	writeSuccess(w, http.StatusOK, map[string]any{"items": items, "page": page, "pageSize": pageSize})
}

func (h *Handler) DistributionsSummary(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	summary, err := h.service.DistributionsSummary(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "could not load distribution summary")
		return
	}
	writeSuccess(w, http.StatusOK, map[string]any{"summary": summary})
}

func (h *Handler) Distributions(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	page, pageSize := readPagination(r)
	items, err := h.service.Distributions(r.Context(), page, pageSize)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "could not load distributions")
		return
	}
	writeSuccess(w, http.StatusOK, map[string]any{"items": items, "page": page, "pageSize": pageSize})
}

func readPagination(r *http.Request) (int, int) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}
	return page, pageSize
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

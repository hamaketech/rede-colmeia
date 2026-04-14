package http

import (
	"encoding/json"
	"net/http"

	"github.com/rede-colmeia/apps/api/internal/middleware"
	"github.com/rede-colmeia/apps/api/internal/modules/auth"
)

func NewRouter(usersHandler http.Handler, authService *auth.Service) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{
			"status": "ok",
		})
	})

	requireOperator := middleware.RequireRoles(authService, auth.RoleContributor, auth.RoleAdmin)
	requireAnyAuthenticated := middleware.RequireRoles(
		authService,
		auth.RoleContributor,
		auth.RolePartner,
		auth.RoleAdmin,
	)

	mux.Handle("/api/v1/users/ping", requireOperator(usersHandler))
	mux.Handle("/api/v1/auth/whoami", requireAnyAuthenticated(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		actor, _ := authService.Authenticate(r)
		writeJSON(w, http.StatusOK, map[string]string{
			"status": "ok",
			"role":   string(actor.Role),
		})
	})))
	return mux
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

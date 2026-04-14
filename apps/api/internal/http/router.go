package http

import (
	"encoding/json"
	"net/http"

	"github.com/rede-colmeia/apps/api/internal/middleware"
	"github.com/rede-colmeia/apps/api/internal/modules/auth"
)

func NewRouter(usersHandler http.Handler, authHandler *auth.Handler, authService *auth.Service) http.Handler {
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

	mux.HandleFunc("/api/v1/auth/login", authHandler.Login)
	mux.HandleFunc("/api/v1/auth/register", authHandler.Register)
	mux.HandleFunc("/api/v1/auth/password-reset/request", authHandler.RequestPasswordReset)
	mux.HandleFunc("/api/v1/auth/password-reset/confirm", authHandler.ConfirmPasswordReset)
	mux.Handle("/api/v1/auth/logout", requireAnyAuthenticated(http.HandlerFunc(authHandler.Logout)))
	mux.Handle("/api/v1/auth/logout-all", requireAnyAuthenticated(http.HandlerFunc(authHandler.LogoutAll)))
	mux.Handle("/api/v1/auth/session/rotate", requireAnyAuthenticated(http.HandlerFunc(authHandler.RotateSession)))
	mux.Handle("/api/v1/auth/whoami", requireAnyAuthenticated(http.HandlerFunc(authHandler.WhoAmI)))
	mux.Handle("/api/v1/users/ping", requireOperator(usersHandler))
	return mux
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

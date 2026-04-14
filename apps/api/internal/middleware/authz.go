package middleware

import (
	"net/http"

	"github.com/rede-colmeia/apps/api/internal/modules/auth"
)

func RequireRoles(authService *auth.Service, accepted ...auth.Role) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if authService == nil {
				http.Error(w, "authentication is not configured", http.StatusUnauthorized)
				return
			}

			actor, err := authService.Authenticate(r)
			if err != nil {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}

			if !authService.HasRole(actor, accepted...) {
				http.Error(w, "forbidden", http.StatusForbidden)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

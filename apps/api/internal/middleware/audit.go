package middleware

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/rede-colmeia/apps/api/internal/modules/auth"
)

type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (r *statusRecorder) WriteHeader(status int) {
	r.status = status
	r.ResponseWriter.WriteHeader(status)
}

func WithAuditLogger(logger *log.Logger, authService *auth.Service, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		recorder := &statusRecorder{
			ResponseWriter: w,
			status:         http.StatusOK,
		}

		next.ServeHTTP(recorder, r)

		requestID := recorder.Header().Get(requestIDHeader)
		actorEmail := "anonymous"
		actorRole := "anonymous"
		if actor, ok := auth.ActorFromContext(r.Context()); ok {
			actorEmail = actor.Email
			actorRole = string(actor.Role)
		} else if authService != nil {
			if actor, err := authService.Authenticate(r); err == nil {
				actorEmail = actor.Email
				actorRole = string(actor.Role)
			}
		}

		logger.Printf(
			"audit method=%s path=%s status=%s request_id=%s actor_email=%s actor_role=%s duration_ms=%d",
			r.Method,
			r.URL.Path,
			strconv.Itoa(recorder.status),
			requestID,
			actorEmail,
			actorRole,
			time.Since(start).Milliseconds(),
		)
	})
}

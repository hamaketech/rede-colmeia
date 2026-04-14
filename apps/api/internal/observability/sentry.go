package observability

import "log"

// InitSentry is a placeholder integration point.
// It keeps startup contract stable while Sentry SDK is introduced later.
func InitSentry(dsn string) {
	if dsn == "" {
		return
	}
	log.Printf("[rede-colmeia-api] sentry configured")
}

package middleware

import (
	"bytes"
	"log"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestWithAuditLoggerWritesStructuredEntry(t *testing.T) {
	var logs bytes.Buffer
	logger := log.New(&logs, "", 0)

	handler := WithRequestID(
		WithAuditLogger(logger, nil, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusAccepted)
		})),
	)

	request := httptest.NewRequest(http.MethodGet, "/audit-test", nil)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	logOutput := logs.String()
	if !strings.Contains(logOutput, "audit method=GET path=/audit-test status=202") {
		t.Fatalf("expected audit log entry, got %q", logOutput)
	}
	if !strings.Contains(logOutput, "actor_email=anonymous") {
		t.Fatalf("expected anonymous actor in audit log, got %q", logOutput)
	}
}

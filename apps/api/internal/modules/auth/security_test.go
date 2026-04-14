package auth

import (
	"context"
	"net/http"
	"net/http/httptest"
	"sync/atomic"
	"testing"
)

func TestWebhookResetDeliveryRetriesOnServerFailure(t *testing.T) {
	var attempts int32
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		currentAttempt := atomic.AddInt32(&attempts, 1)
		if currentAttempt < 3 {
			w.WriteHeader(http.StatusBadGateway)
			return
		}
		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	delivery := NewWebhookResetDelivery(server.URL, "", nil)
	if err := delivery.SendPasswordReset(context.Background(), "ana@redecolmeia.dev", "token"); err != nil {
		t.Fatalf("expected nil error after retry, got %v", err)
	}
	if attempts != 3 {
		t.Fatalf("expected 3 attempts, got %d", attempts)
	}
}

func TestWebhookResetDeliveryDoesNotRetryOnClientFailure(t *testing.T) {
	var attempts int32
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		atomic.AddInt32(&attempts, 1)
		w.WriteHeader(http.StatusBadRequest)
	}))
	defer server.Close()

	delivery := NewWebhookResetDelivery(server.URL, "", nil)
	if err := delivery.SendPasswordReset(context.Background(), "ana@redecolmeia.dev", "token"); err == nil {
		t.Fatalf("expected error for client status")
	}
	if attempts != 1 {
		t.Fatalf("expected 1 attempt, got %d", attempts)
	}
}

package tests

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestTransparencySummaryEndpointReturnsEnvelope(t *testing.T) {
	handler := newAuthenticatedHandler()
	request := httptest.NewRequest(http.MethodGet, "/api/v1/ops/transparency/summary", nil)
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, recorder.Code)
	}

	var payload struct {
		OK   bool `json:"ok"`
		Data struct {
			Summary struct {
				Contributors int `json:"contributors"`
				Partners     int `json:"partners"`
			} `json:"summary"`
		} `json:"data"`
	}
	if err := json.NewDecoder(recorder.Body).Decode(&payload); err != nil {
		t.Fatalf("expected valid payload, got %v", err)
	}
	if !payload.OK {
		t.Fatalf("expected ok=true, got false")
	}
	if payload.Data.Summary.Contributors <= 0 {
		t.Fatalf("expected contributors > 0, got %d", payload.Data.Summary.Contributors)
	}
	if payload.Data.Summary.Partners <= 0 {
		t.Fatalf("expected partners > 0, got %d", payload.Data.Summary.Partners)
	}
}

func TestIndicatorsEndpointReturnsEnvelope(t *testing.T) {
	handler := newAuthenticatedHandler()
	request := httptest.NewRequest(http.MethodGet, "/api/v1/ops/indicators", nil)
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, recorder.Code)
	}

	var payload struct {
		OK   bool `json:"ok"`
		Data struct {
			Indicators struct {
				DeliveryCoverageRate int `json:"deliveryCoverageRate"`
				Pipeline             struct {
					Delivered int `json:"delivered"`
				} `json:"pipeline"`
			} `json:"indicators"`
		} `json:"data"`
	}
	if err := json.NewDecoder(recorder.Body).Decode(&payload); err != nil {
		t.Fatalf("expected valid payload, got %v", err)
	}
	if !payload.OK {
		t.Fatalf("expected ok=true, got false")
	}
	if payload.Data.Indicators.DeliveryCoverageRate < 0 {
		t.Fatalf("expected deliveryCoverageRate >= 0, got %d", payload.Data.Indicators.DeliveryCoverageRate)
	}
	if payload.Data.Indicators.Pipeline.Delivered < 0 {
		t.Fatalf("expected delivered >= 0, got %d", payload.Data.Indicators.Pipeline.Delivered)
	}
}

func TestSubscriptionsSummaryRequiresAuthentication(t *testing.T) {
	handler := newAuthenticatedHandler()
	request := httptest.NewRequest(http.MethodGet, "/api/v1/ops/subscriptions/summary", nil)
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", http.StatusUnauthorized, recorder.Code)
	}
}

func TestSubscriptionsSummaryReturnsForAuthenticatedActor(t *testing.T) {
	handler := newAuthenticatedHandler()
	sessionCookie := loginAndGetSessionCookie(
		t,
		handler,
		"contributor@redecolmeia.dev",
		"contributor-pass",
	)

	request := httptest.NewRequest(http.MethodGet, "/api/v1/ops/subscriptions/summary", nil)
	request.AddCookie(sessionCookie)
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, recorder.Code)
	}

	var payload struct {
		OK   bool `json:"ok"`
		Data struct {
			Summary struct {
				ActiveSubscriptions int `json:"activeSubscriptions"`
			} `json:"summary"`
		} `json:"data"`
	}
	if err := json.NewDecoder(recorder.Body).Decode(&payload); err != nil {
		t.Fatalf("expected valid payload, got %v", err)
	}
	if !payload.OK {
		t.Fatalf("expected ok=true, got false")
	}
	if payload.Data.Summary.ActiveSubscriptions <= 0 {
		t.Fatalf("expected activeSubscriptions > 0, got %d", payload.Data.Summary.ActiveSubscriptions)
	}
}

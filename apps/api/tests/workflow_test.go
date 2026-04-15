package tests

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestPartnersSummaryRequiresAuthentication(t *testing.T) {
	handler := newAuthenticatedHandler()
	request := httptest.NewRequest(http.MethodGet, "/api/v1/partners/summary", nil)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)
	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", http.StatusUnauthorized, recorder.Code)
	}
}

func TestPartnersSummaryReturnsEnvelopeWhenAuthenticated(t *testing.T) {
	handler := newAuthenticatedHandler()
	sessionCookie := loginAndGetSessionCookie(t, handler, "contributor@redecolmeia.dev", "contributor-pass")
	request := httptest.NewRequest(http.MethodGet, "/api/v1/partners/summary", nil)
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
				Active int `json:"active"`
			} `json:"summary"`
		} `json:"data"`
	}
	if err := json.NewDecoder(recorder.Body).Decode(&payload); err != nil {
		t.Fatalf("expected valid payload, got %v", err)
	}
	if !payload.OK {
		t.Fatalf("expected ok=true")
	}
	if payload.Data.Summary.Active < 0 {
		t.Fatalf("expected non-negative active summary")
	}
}

func TestBeneficiariesListReturnsItems(t *testing.T) {
	handler := newAuthenticatedHandler()
	sessionCookie := loginAndGetSessionCookie(t, handler, "contributor@redecolmeia.dev", "contributor-pass")
	request := httptest.NewRequest(http.MethodGet, "/api/v1/beneficiaries?page=1&pageSize=10", nil)
	request.AddCookie(sessionCookie)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)
	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, recorder.Code)
	}

	var payload struct {
		OK   bool `json:"ok"`
		Data struct {
			Items []map[string]any `json:"items"`
		} `json:"data"`
	}
	if err := json.NewDecoder(recorder.Body).Decode(&payload); err != nil {
		t.Fatalf("expected valid payload, got %v", err)
	}
	if !payload.OK {
		t.Fatalf("expected ok=true")
	}
	if len(payload.Data.Items) == 0 {
		t.Fatalf("expected at least one beneficiary item")
	}
}

func TestPartnersListAcceptsFilterAndSortQueryParams(t *testing.T) {
	handler := newAuthenticatedHandler()
	sessionCookie := loginAndGetSessionCookie(t, handler, "contributor@redecolmeia.dev", "contributor-pass")
	request := httptest.NewRequest(http.MethodGet, "/api/v1/partners?status=active&region=Norte&sort=name_asc&page=1&pageSize=10", nil)
	request.AddCookie(sessionCookie)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)
	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, recorder.Code)
	}

	var payload struct {
		OK   bool `json:"ok"`
		Data struct {
			Status string `json:"status"`
			Region string `json:"region"`
			Sort   string `json:"sort"`
			Items  []struct {
				Status string `json:"status"`
				Region string `json:"region"`
			} `json:"items"`
		} `json:"data"`
	}
	if err := json.NewDecoder(recorder.Body).Decode(&payload); err != nil {
		t.Fatalf("expected valid payload, got %v", err)
	}
	if !payload.OK {
		t.Fatalf("expected ok=true")
	}
	if payload.Data.Status != "active" || payload.Data.Region != "Norte" || payload.Data.Sort != "name_asc" {
		t.Fatalf("expected query echo to match filter/sort")
	}
}

func TestPartnersListSupportsPartialRegionSearch(t *testing.T) {
	handler := newAuthenticatedHandler()
	sessionCookie := loginAndGetSessionCookie(t, handler, "contributor@redecolmeia.dev", "contributor-pass")
	request := httptest.NewRequest(http.MethodGet, "/api/v1/partners?region=Su&page=1&pageSize=10", nil)
	request.AddCookie(sessionCookie)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)
	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, recorder.Code)
	}

	var payload struct {
		OK   bool `json:"ok"`
		Data struct {
			Items []struct {
				Region string `json:"region"`
			} `json:"items"`
		} `json:"data"`
	}
	if err := json.NewDecoder(recorder.Body).Decode(&payload); err != nil {
		t.Fatalf("expected valid payload, got %v", err)
	}
	if !payload.OK {
		t.Fatalf("expected ok=true")
	}
	if len(payload.Data.Items) == 0 {
		t.Fatalf("expected at least one item for partial region search")
	}
	for _, item := range payload.Data.Items {
		if item.Region != "Sul" {
			t.Fatalf("expected matched region Sul, got %q", item.Region)
		}
	}
}

func TestDistributionsSummaryReturnsConfirmedBasketsField(t *testing.T) {
	handler := newAuthenticatedHandler()
	sessionCookie := loginAndGetSessionCookie(t, handler, "contributor@redecolmeia.dev", "contributor-pass")
	request := httptest.NewRequest(http.MethodGet, "/api/v1/distributions/summary", nil)
	request.AddCookie(sessionCookie)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)
	if recorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, recorder.Code)
	}

	var payload struct {
		Data struct {
			Summary map[string]any `json:"summary"`
		} `json:"data"`
	}
	if err := json.NewDecoder(recorder.Body).Decode(&payload); err != nil {
		t.Fatalf("expected valid payload, got %v", err)
	}
	if _, ok := payload.Data.Summary["confirmedBaskets"]; !ok {
		t.Fatalf("expected confirmedBaskets field in summary")
	}
}

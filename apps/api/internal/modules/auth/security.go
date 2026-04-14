package auth

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type SensitiveEventType string

const (
	SensitiveEventLogin                  SensitiveEventType = "login"
	SensitiveEventLogoutAll              SensitiveEventType = "logout_all"
	SensitiveEventSessionRotate          SensitiveEventType = "session_rotate"
	SensitiveEventSessionRevoke          SensitiveEventType = "session_revoke"
	SensitiveEventPasswordResetRequested SensitiveEventType = "password_reset_requested"
	SensitiveEventPasswordResetConfirmed SensitiveEventType = "password_reset_confirmed"
)

type SensitiveEvent struct {
	Type      SensitiveEventType
	Email     string
	SessionID string
	At        time.Time
}

type SensitiveEventHook interface {
	OnSensitiveEvent(ctx context.Context, event SensitiveEvent)
}

type NoopSensitiveEventHook struct{}

func (NoopSensitiveEventHook) OnSensitiveEvent(_ context.Context, _ SensitiveEvent) {}

type PasswordResetDelivery interface {
	SendPasswordReset(ctx context.Context, email string, token string) error
}

type NoopPasswordResetDelivery struct{}

func (NoopPasswordResetDelivery) SendPasswordReset(_ context.Context, _ string, _ string) error {
	return nil
}

type deliveryLogger interface {
	Printf(format string, values ...any)
}

type webhookResetDelivery struct {
	endpoint string
	token    string
	client   *http.Client
	logger   deliveryLogger
}

func NewWebhookResetDelivery(endpoint string, token string, logger deliveryLogger) PasswordResetDelivery {
	if endpoint == "" {
		return NoopPasswordResetDelivery{}
	}
	return &webhookResetDelivery{
		endpoint: endpoint,
		token:    token,
		client:   &http.Client{Timeout: 5 * time.Second},
		logger:   logger,
	}
}

func (d *webhookResetDelivery) SendPasswordReset(ctx context.Context, email string, token string) error {
	body, err := json.Marshal(map[string]string{
		"email": email,
		"token": token,
	})
	if err != nil {
		return fmt.Errorf("marshal reset payload: %w", err)
	}

	request, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		d.endpoint,
		bytes.NewBuffer(body),
	)
	if err != nil {
		return fmt.Errorf("build reset delivery request: %w", err)
	}
	request.Header.Set("Content-Type", "application/json")
	if d.token != "" {
		request.Header.Set("Authorization", "Bearer "+d.token)
	}

	response, err := d.client.Do(request)
	if err != nil {
		return fmt.Errorf("send reset delivery request: %w", err)
	}
	defer response.Body.Close()

	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return fmt.Errorf("delivery provider status: %d", response.StatusCode)
	}
	if d.logger != nil {
		d.logger.Printf("password reset dispatched to provider for %s", email)
	}
	return nil
}

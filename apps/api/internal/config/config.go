package config

import "os"

type Config struct {
	Port                    string
	SentryDSN               string
	Environment             string
	CORSAllowList           string
	DatabaseURL             string
	DatabaseToken           string
	AuthConfig              string
	ResetDeliveryWebhookURL string
	ResetDeliveryToken      string
}

func Load() Config {
	authConfig := os.Getenv("AUTH_CREDENTIALS")
	if authConfig == "" {
		authConfig = os.Getenv("AUTH_TOKENS")
	}

	return Config{
		Port:                    getEnv("PORT", "8080"),
		SentryDSN:               os.Getenv("SENTRY_DSN"),
		Environment:             getEnv("APP_ENV", "dev"),
		CORSAllowList:           os.Getenv("CORS_ALLOW_ORIGINS"),
		DatabaseURL:             os.Getenv("DATABASE_URL"),
		DatabaseToken:           getEnv("DATABASE_AUTH_TOKEN", os.Getenv("TOKEN")),
		AuthConfig:              authConfig,
		ResetDeliveryWebhookURL: os.Getenv("RESET_DELIVERY_WEBHOOK_URL"),
		ResetDeliveryToken:      os.Getenv("RESET_DELIVERY_TOKEN"),
	}
}

func getEnv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}

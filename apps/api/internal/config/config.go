package config

import "os"

type Config struct {
	Port          string
	SentryDSN     string
	DatabaseURL   string
	DatabaseToken string
	AuthConfig    string
}

func Load() Config {
	authConfig := os.Getenv("AUTH_CREDENTIALS")
	if authConfig == "" {
		authConfig = os.Getenv("AUTH_TOKENS")
	}

	return Config{
		Port:          getEnv("PORT", "8080"),
		SentryDSN:     os.Getenv("SENTRY_DSN"),
		DatabaseURL:   os.Getenv("DATABASE_URL"),
		DatabaseToken: getEnv("DATABASE_AUTH_TOKEN", os.Getenv("TOKEN")),
		AuthConfig:    authConfig,
	}
}

func getEnv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}

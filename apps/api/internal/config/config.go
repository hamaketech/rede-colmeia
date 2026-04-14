package config

import "os"

type Config struct {
	Port      string
	SentryDSN string
}

func Load() Config {
	return Config{
		Port:      getEnv("PORT", "8080"),
		SentryDSN: os.Getenv("SENTRY_DSN"),
	}
}

func getEnv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}

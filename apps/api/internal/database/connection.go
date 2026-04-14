package database

import (
	"database/sql"
	"fmt"
	"net/url"
	"strings"

	_ "github.com/tursodatabase/libsql-client-go/libsql"
	_ "modernc.org/sqlite"
)

func Open(databaseURL string, databaseToken string) (*sql.DB, error) {
	if databaseURL == "" {
		return nil, nil
	}

	driver := "sqlite"
	dsn := databaseURL
	if strings.HasPrefix(databaseURL, "libsql://") {
		driver = "libsql"
		parsed, err := url.Parse(databaseURL)
		if err != nil {
			return nil, fmt.Errorf("parse libsql url: %w", err)
		}
		if databaseToken != "" && parsed.Query().Get("authToken") == "" {
			query := parsed.Query()
			query.Set("authToken", databaseToken)
			parsed.RawQuery = query.Encode()
		}
		dsn = parsed.String()
	}

	db, err := sql.Open(driver, dsn)
	if err != nil {
		return nil, fmt.Errorf("open database connection: %w", err)
	}

	if err := db.Ping(); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("ping database connection: %w", err)
	}

	return db, nil
}

package database

import (
	"database/sql"
	"fmt"

	_ "modernc.org/sqlite"
)

func Open(databaseURL string) (*sql.DB, error) {
	if databaseURL == "" {
		return nil, nil
	}

	db, err := sql.Open("sqlite", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("open sqlite connection: %w", err)
	}

	if err := db.Ping(); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("ping sqlite connection: %w", err)
	}

	return db, nil
}

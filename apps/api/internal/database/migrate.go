package database

import (
	"errors"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
)

// RunMigrations validates SQL migration files are discoverable.
// Database execution is wired in a future iteration with Turso integration.
func RunMigrations(migrationsDir string) error {
	entries, err := os.ReadDir(migrationsDir)
	if err != nil {
		if errors.Is(err, fs.ErrNotExist) {
			return nil
		}
		return err
	}

	files := make([]string, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		if filepath.Ext(entry.Name()) == ".sql" {
			files = append(files, entry.Name())
		}
	}
	sort.Strings(files)
	return nil
}

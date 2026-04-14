package users

import (
	"context"
	"testing"
)

func TestInMemoryRepositoryPing(t *testing.T) {
	repository := NewInMemoryRepository()
	if err := repository.Ping(context.Background()); err != nil {
		t.Fatalf("expected nil error, got %v", err)
	}
}

func TestSQLRepositoryPingWithNilDB(t *testing.T) {
	repository := NewSQLRepository(nil)
	if err := repository.Ping(context.Background()); err != nil {
		t.Fatalf("expected nil error, got %v", err)
	}
}

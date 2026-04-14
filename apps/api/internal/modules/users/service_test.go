package users

import (
	"context"
	"errors"
	"testing"
)

type fakeRepository struct {
	err error
}

func (f fakeRepository) Ping(context.Context) error {
	return f.err
}

func TestServicePing(t *testing.T) {
	t.Run("returns nil when repository succeeds", func(t *testing.T) {
		service := NewService(fakeRepository{})
		if err := service.Ping(context.Background()); err != nil {
			t.Fatalf("expected nil error, got %v", err)
		}
	})

	t.Run("returns repository error", func(t *testing.T) {
		expectedErr := errors.New("repo failed")
		service := NewService(fakeRepository{err: expectedErr})

		err := service.Ping(context.Background())
		if !errors.Is(err, expectedErr) {
			t.Fatalf("expected %v, got %v", expectedErr, err)
		}
	})

	t.Run("returns error when repository is nil", func(t *testing.T) {
		service := NewService(nil)
		err := service.Ping(context.Background())
		if !errors.Is(err, ErrRepositoryRequired) {
			t.Fatalf("expected %v, got %v", ErrRepositoryRequired, err)
		}
	})
}

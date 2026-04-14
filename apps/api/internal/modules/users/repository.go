package users

import "context"

type Repository interface {
	Ping(context.Context) error
}

type InMemoryRepository struct{}

func NewInMemoryRepository() *InMemoryRepository {
	return &InMemoryRepository{}
}

func (r *InMemoryRepository) Ping(_ context.Context) error {
	return nil
}

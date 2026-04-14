package users

import (
	"context"
	"database/sql"
)

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

type SQLRepository struct {
	db *sql.DB
}

func NewSQLRepository(db *sql.DB) *SQLRepository {
	return &SQLRepository{
		db: db,
	}
}

func (r *SQLRepository) Ping(ctx context.Context) error {
	if r.db == nil {
		return nil
	}
	return r.db.PingContext(ctx)
}

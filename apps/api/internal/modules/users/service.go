package users

import (
	"context"
	"errors"
)

var ErrRepositoryRequired = errors.New("users repository is required")

type Service struct {
	repository Repository
}

func NewService(repository Repository) *Service {
	return &Service{
		repository: repository,
	}
}

func (s *Service) Ping(ctx context.Context) error {
	if s.repository == nil {
		return ErrRepositoryRequired
	}
	return s.repository.Ping(ctx)
}

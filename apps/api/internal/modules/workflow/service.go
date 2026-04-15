package workflow

import "context"

type Service struct {
	repository Repository
}

func NewService(repository Repository) *Service {
	if repository == nil {
		repository = NewInMemoryRepository()
	}
	return &Service{repository: repository}
}

func (s *Service) EnsureSeedData(ctx context.Context) error {
	return s.repository.EnsureSeedData(ctx)
}

func (s *Service) PartnersSummary(ctx context.Context) (PartnerSummary, error) {
	return s.repository.GetPartnerSummary(ctx)
}

func (s *Service) Partners(ctx context.Context, page int, pageSize int) ([]PartnerView, error) {
	limit, offset := normalizePagination(page, pageSize)
	return s.repository.ListPartners(ctx, limit, offset)
}

func (s *Service) BeneficiariesSummary(ctx context.Context) (BeneficiarySummary, error) {
	return s.repository.GetBeneficiarySummary(ctx)
}

func (s *Service) Beneficiaries(ctx context.Context, page int, pageSize int) ([]BeneficiaryView, error) {
	limit, offset := normalizePagination(page, pageSize)
	return s.repository.ListBeneficiaries(ctx, limit, offset)
}

func (s *Service) DistributionsSummary(ctx context.Context) (DistributionSummary, error) {
	return s.repository.GetDistributionSummary(ctx)
}

func (s *Service) Distributions(ctx context.Context, page int, pageSize int) ([]DistributionView, error) {
	limit, offset := normalizePagination(page, pageSize)
	return s.repository.ListDistributions(ctx, limit, offset)
}

func normalizePagination(page int, pageSize int) (int, int) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}
	return pageSize, (page - 1) * pageSize
}

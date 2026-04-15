package workflow

import "context"

type ListQuery struct {
	Page     int    `json:"page"`
	PageSize int    `json:"pageSize"`
	Status   string `json:"status,omitempty"`
	Region   string `json:"region,omitempty"`
	Sort     string `json:"sort,omitempty"`
}

func (q ListQuery) normalize() ListQuery {
	if q.Page < 1 {
		q.Page = 1
	}
	if q.PageSize < 1 || q.PageSize > 100 {
		q.PageSize = 20
	}
	return q
}

func (q ListQuery) limitOffset() (int, int) {
	normalized := q.normalize()
	return normalized.PageSize, (normalized.Page - 1) * normalized.PageSize
}

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

func (s *Service) Partners(ctx context.Context, query ListQuery) ([]PartnerView, error) {
	return s.repository.ListPartners(ctx, query.normalize())
}

func (s *Service) BeneficiariesSummary(ctx context.Context) (BeneficiarySummary, error) {
	return s.repository.GetBeneficiarySummary(ctx)
}

func (s *Service) Beneficiaries(ctx context.Context, query ListQuery) ([]BeneficiaryView, error) {
	return s.repository.ListBeneficiaries(ctx, query.normalize())
}

func (s *Service) DistributionsSummary(ctx context.Context) (DistributionSummary, error) {
	return s.repository.GetDistributionSummary(ctx)
}

func (s *Service) Distributions(ctx context.Context, query ListQuery) ([]DistributionView, error) {
	return s.repository.ListDistributions(ctx, query.normalize())
}

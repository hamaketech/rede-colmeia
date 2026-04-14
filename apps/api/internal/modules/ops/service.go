package ops

import (
	"context"
	"time"
)

type TransparencySummary struct {
	Contributors     int       `json:"contributors"`
	Partners         int       `json:"partners"`
	FamiliesSupported int      `json:"familiesSupported"`
	TotalRaisedCents int       `json:"totalRaisedCents"`
	BasketsDelivered int       `json:"basketsDelivered"`
	RegionsServed    int       `json:"regionsServed"`
	LastUpdated      time.Time `json:"lastUpdated"`
}

type PipelineSnapshot struct {
	Queued      int `json:"queued"`
	Preparing   int `json:"preparing"`
	InDelivery  int `json:"inDelivery"`
	Delivered   int `json:"delivered"`
}

type OperationalIndicators struct {
	DeliveryCoverageRate      int              `json:"deliveryCoverageRate"`
	ContributorActivationRate int              `json:"contributorActivationRate"`
	AverageResponseHours      int              `json:"averageResponseHours"`
	Pipeline                  PipelineSnapshot `json:"pipeline"`
	LastUpdated               time.Time        `json:"lastUpdated"`
}

type ContributionSummary struct {
	ActiveSubscriptions      int `json:"activeSubscriptions"`
	TotalMonthlyCents        int `json:"totalMonthlyCents"`
	TotalCapturedCents       int `json:"totalCapturedCents"`
	EstimatedBasketsPerMonth int `json:"estimatedBasketsPerMonth"`
}

type Service struct {
	repository Repository
}

func NewService(repository Repository) *Service {
	if repository == nil {
		repository = NewInMemoryRepository()
	}
	return &Service{
		repository: repository,
	}
}

func (s *Service) EnsureSeedData(ctx context.Context) error {
	return s.repository.EnsureSeedData(ctx)
}

func (s *Service) TransparencySummary(ctx context.Context) (TransparencySummary, error) {
	stored, err := s.repository.GetTransparencySummary(ctx)
	if err != nil {
		return TransparencySummary{}, err
	}
	return TransparencySummary{
		Contributors:      stored.Contributors,
		Partners:          stored.Partners,
		FamiliesSupported: stored.Families,
		TotalRaisedCents:  stored.TotalRaisedCents,
		BasketsDelivered:  stored.BasketsDelivered,
		RegionsServed:     stored.RegionsServed,
		LastUpdated:       stored.LastUpdated,
	}, nil
}

func (s *Service) Indicators(ctx context.Context) (OperationalIndicators, error) {
	stored, err := s.repository.GetOperationalIndicators(ctx)
	if err != nil {
		return OperationalIndicators{}, err
	}
	return OperationalIndicators{
		DeliveryCoverageRate:      stored.DeliveryCoverageRate,
		ContributorActivationRate: stored.ContributorActivationRate,
		AverageResponseHours:      stored.AverageResponseHours,
		Pipeline: PipelineSnapshot{
			Queued:     stored.QueuedRequests,
			Preparing:  stored.PreparingBaskets,
			InDelivery: stored.InDelivery,
			Delivered:  stored.Delivered,
		},
		LastUpdated: stored.LastUpdated,
	}, nil
}

func (s *Service) SubscriptionsSummary(ctx context.Context) (ContributionSummary, error) {
	stored, err := s.repository.GetContributionSummary(ctx)
	if err != nil {
		return ContributionSummary{}, err
	}
	return ContributionSummary{
		ActiveSubscriptions:      stored.ActiveSubscriptions,
		TotalMonthlyCents:        stored.TotalMonthlyCents,
		TotalCapturedCents:       stored.TotalCapturedCents,
		EstimatedBasketsPerMonth: stored.EstimatedBasketsPerMonth,
	}, nil
}

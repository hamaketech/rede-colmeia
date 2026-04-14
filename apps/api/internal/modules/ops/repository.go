package ops

import (
	"context"
	"database/sql"
	"fmt"
	"math"
	"time"
)

const basketCostCents = 3500

type StoredTransparencySummary struct {
	Contributors     int
	Partners         int
	Families         int
	TotalRaisedCents int
	BasketsDelivered int
	RegionsServed    int
	LastUpdated      time.Time
}

type StoredIndicators struct {
	DeliveryCoverageRate      int
	ContributorActivationRate int
	AverageResponseHours      int
	QueuedRequests            int
	PreparingBaskets          int
	InDelivery                int
	Delivered                 int
	LastUpdated               time.Time
}

type StoredContributionSummary struct {
	ActiveSubscriptions      int
	TotalMonthlyCents        int
	TotalCapturedCents       int
	EstimatedBasketsPerMonth int
}

type Repository interface {
	EnsureSeedData(context.Context) error
	GetTransparencySummary(context.Context) (StoredTransparencySummary, error)
	GetOperationalIndicators(context.Context) (StoredIndicators, error)
	GetContributionSummary(context.Context) (StoredContributionSummary, error)
}

type InMemoryRepository struct{}

func NewInMemoryRepository() *InMemoryRepository {
	return &InMemoryRepository{}
}

func (r *InMemoryRepository) EnsureSeedData(_ context.Context) error {
	return nil
}

func (r *InMemoryRepository) GetTransparencySummary(_ context.Context) (StoredTransparencySummary, error) {
	return StoredTransparencySummary{
		Contributors:     248,
		Partners:         17,
		Families:         532,
		TotalRaisedCents: 1860000,
		BasketsDelivered: 133,
		RegionsServed:    6,
		LastUpdated:      time.Now().UTC(),
	}, nil
}

func (r *InMemoryRepository) GetOperationalIndicators(_ context.Context) (StoredIndicators, error) {
	return StoredIndicators{
		DeliveryCoverageRate:      86,
		ContributorActivationRate: 72,
		AverageResponseHours:      18,
		QueuedRequests:            21,
		PreparingBaskets:          14,
		InDelivery:                9,
		Delivered:                 37,
		LastUpdated:               time.Now().UTC(),
	}, nil
}

func (r *InMemoryRepository) GetContributionSummary(_ context.Context) (StoredContributionSummary, error) {
	return StoredContributionSummary{
		ActiveSubscriptions:      248,
		TotalMonthlyCents:        1860000,
		TotalCapturedCents:       7430000,
		EstimatedBasketsPerMonth: 531,
	}, nil
}

type SQLRepository struct {
	db *sql.DB
}

func NewSQLRepository(db *sql.DB) *SQLRepository {
	return &SQLRepository{db: db}
}

func (r *SQLRepository) EnsureSeedData(ctx context.Context) error {
	if r.db == nil {
		return nil
	}

	var subscriptionsCount int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM subscriptions`).Scan(&subscriptionsCount); err != nil {
		return fmt.Errorf("count subscriptions: %w", err)
	}
	if subscriptionsCount == 0 {
		if _, err := r.db.ExecContext(
			ctx,
			`INSERT OR IGNORE INTO users(id, email, name, role, created_at, updated_at)
			 VALUES
			 ('user-ana', 'ana@redecolmeia.dev', 'Ana', 'contributor', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
			 ('user-joao', 'joao@redecolmeia.dev', 'Joao', 'contributor', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
			 ('user-maria', 'maria@redecolmeia.dev', 'Maria', 'contributor', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
			 ('user-caio', 'caio@redecolmeia.dev', 'Caio', 'contributor', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
		); err != nil {
			return fmt.Errorf("seed users: %w", err)
		}
		if _, err := r.db.ExecContext(
			ctx,
			`INSERT INTO subscriptions(id, user_id, amount, status, started_at)
			 VALUES
			 ('sub-ana', 'user-ana', 9000, 'active', CURRENT_TIMESTAMP),
			 ('sub-joao', 'user-joao', 7000, 'active', CURRENT_TIMESTAMP),
			 ('sub-maria', 'user-maria', 6000, 'paused', CURRENT_TIMESTAMP),
			 ('sub-caio', 'user-caio', 12000, 'active', CURRENT_TIMESTAMP)`,
		); err != nil {
			return fmt.Errorf("seed subscriptions: %w", err)
		}
	}

	var transactionsCount int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM transactions`).Scan(&transactionsCount); err != nil {
		return fmt.Errorf("count transactions: %w", err)
	}
	if transactionsCount == 0 {
		if _, err := r.db.ExecContext(
			ctx,
			`INSERT INTO transactions(id, user_id, subscription_id, amount, status, provider, created_at)
			 VALUES
			 ('tx-1', 'user-ana', 'sub-ana', 9000, 'captured', 'seed', DATETIME('now', '-8 day')),
			 ('tx-2', 'user-joao', 'sub-joao', 7000, 'captured', 'seed', DATETIME('now', '-7 day')),
			 ('tx-3', 'user-caio', 'sub-caio', 12000, 'captured', 'seed', DATETIME('now', '-6 day')),
			 ('tx-4', 'user-maria', 'sub-maria', 6000, 'failed', 'seed', DATETIME('now', '-6 day')),
			 ('tx-5', 'user-ana', 'sub-ana', 9000, 'captured', 'seed', DATETIME('now', '-3 day'))`,
		); err != nil {
			return fmt.Errorf("seed transactions: %w", err)
		}
	}

	return nil
}

func (r *SQLRepository) GetTransparencySummary(ctx context.Context) (StoredTransparencySummary, error) {
	var contributors int
	if err := r.db.QueryRowContext(
		ctx,
		`SELECT COUNT(DISTINCT user_id) FROM subscriptions WHERE status = 'active'`,
	).Scan(&contributors); err != nil {
		return StoredTransparencySummary{}, fmt.Errorf("count contributors: %w", err)
	}

	var partners int
	if err := r.db.QueryRowContext(
		ctx,
		`SELECT COUNT(*) FROM auth_credentials WHERE role = 'partner'`,
	).Scan(&partners); err != nil {
		return StoredTransparencySummary{}, fmt.Errorf("count partners: %w", err)
	}

	var totalRaised sql.NullInt64
	if err := r.db.QueryRowContext(
		ctx,
		`SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE status = 'captured'`,
	).Scan(&totalRaised); err != nil {
		return StoredTransparencySummary{}, fmt.Errorf("sum raised: %w", err)
	}

	var delivered int
	if err := r.db.QueryRowContext(
		ctx,
		`SELECT delivered FROM ops_indicator_snapshots WHERE id = 1`,
	).Scan(&delivered); err != nil {
		return StoredTransparencySummary{}, fmt.Errorf("read delivered indicator: %w", err)
	}

	lastUpdated := time.Now().UTC()
	var transactionsLastUpdated sql.NullString
	if err := r.db.QueryRowContext(
		ctx,
		`SELECT MAX(created_at) FROM transactions`,
	).Scan(&transactionsLastUpdated); err == nil && transactionsLastUpdated.Valid {
		if parsed, parseErr := time.Parse("2006-01-02 15:04:05", transactionsLastUpdated.String); parseErr == nil {
			lastUpdated = parsed.UTC()
		}
	}

	regions := maxInt(1, int(math.Ceil(float64(partners)/3.0)))
	families := delivered * 4

	return StoredTransparencySummary{
		Contributors:     contributors,
		Partners:         partners,
		Families:         families,
		TotalRaisedCents: int(totalRaised.Int64),
		BasketsDelivered: delivered,
		RegionsServed:    regions,
		LastUpdated:      lastUpdated,
	}, nil
}

func (r *SQLRepository) GetOperationalIndicators(ctx context.Context) (StoredIndicators, error) {
	var queued int
	var preparing int
	var inDelivery int
	var delivered int
	var averageResponseHours int
	var updatedAtRaw string
	if err := r.db.QueryRowContext(
		ctx,
		`SELECT queued_requests, preparing_baskets, in_delivery, delivered, average_response_hours, updated_at
		 FROM ops_indicator_snapshots
		 WHERE id = 1`,
	).Scan(&queued, &preparing, &inDelivery, &delivered, &averageResponseHours, &updatedAtRaw); err != nil {
		return StoredIndicators{}, fmt.Errorf("read indicator snapshot: %w", err)
	}

	lastUpdated := time.Now().UTC()
	if parsed, parseErr := time.Parse("2006-01-02 15:04:05", updatedAtRaw); parseErr == nil {
		lastUpdated = parsed.UTC()
	}

	totalPipeline := maxInt(1, queued+preparing+inDelivery+delivered)
	deliveryCoverageRate := int(math.Round(float64(delivered) / float64(totalPipeline) * 100))

	var activeSubscriptions int
	if err := r.db.QueryRowContext(
		ctx,
		`SELECT COUNT(DISTINCT user_id) FROM subscriptions WHERE status = 'active'`,
	).Scan(&activeSubscriptions); err != nil {
		return StoredIndicators{}, fmt.Errorf("count active subscriptions: %w", err)
	}

	var activeContributorsCaptured int
	if err := r.db.QueryRowContext(
		ctx,
		`SELECT COUNT(DISTINCT s.user_id)
		 FROM subscriptions s
		 JOIN transactions t ON t.user_id = s.user_id
		 WHERE s.status = 'active' AND t.status = 'captured'`,
	).Scan(&activeContributorsCaptured); err != nil {
		return StoredIndicators{}, fmt.Errorf("count active captured contributors: %w", err)
	}

	contributorActivationRate := 0
	if activeSubscriptions > 0 {
		contributorActivationRate = int(math.Round(
			float64(activeContributorsCaptured) / float64(activeSubscriptions) * 100,
		))
	}

	return StoredIndicators{
		DeliveryCoverageRate:      deliveryCoverageRate,
		ContributorActivationRate: contributorActivationRate,
		AverageResponseHours:      averageResponseHours,
		QueuedRequests:            queued,
		PreparingBaskets:          preparing,
		InDelivery:                inDelivery,
		Delivered:                 delivered,
		LastUpdated:               lastUpdated,
	}, nil
}

func (r *SQLRepository) GetContributionSummary(ctx context.Context) (StoredContributionSummary, error) {
	var activeSubscriptions int
	var totalMonthly sql.NullInt64
	if err := r.db.QueryRowContext(
		ctx,
		`SELECT COUNT(*), COALESCE(SUM(amount), 0)
		 FROM subscriptions
		 WHERE status = 'active'`,
	).Scan(&activeSubscriptions, &totalMonthly); err != nil {
		return StoredContributionSummary{}, fmt.Errorf("read subscriptions summary: %w", err)
	}

	var totalCaptured sql.NullInt64
	if err := r.db.QueryRowContext(
		ctx,
		`SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE status = 'captured'`,
	).Scan(&totalCaptured); err != nil {
		return StoredContributionSummary{}, fmt.Errorf("read captured summary: %w", err)
	}

	estimatedBaskets := 0
	if totalMonthly.Int64 > 0 {
		estimatedBaskets = int(totalMonthly.Int64 / basketCostCents)
	}

	return StoredContributionSummary{
		ActiveSubscriptions:      activeSubscriptions,
		TotalMonthlyCents:        int(totalMonthly.Int64),
		TotalCapturedCents:       int(totalCaptured.Int64),
		EstimatedBasketsPerMonth: estimatedBaskets,
	}, nil
}

func maxInt(left int, right int) int {
	if left > right {
		return left
	}
	return right
}

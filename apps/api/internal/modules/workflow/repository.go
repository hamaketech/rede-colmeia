package workflow

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

type PartnerSummary struct {
	Active  int `json:"active"`
	Pending int `json:"pending"`
	Paused  int `json:"paused"`
	Regions int `json:"regions"`
}

type PartnerView struct {
	ID                     string `json:"id"`
	Name                   string `json:"name"`
	Region                 string `json:"region"`
	Status                 string `json:"status"`
	CapacityMonthlyBaskets int    `json:"capacityMonthlyBaskets"`
}

type BeneficiarySummary struct {
	QuickValidation   int `json:"quickValidation"`
	Validated         int `json:"validated"`
	FamilySize1To2    int `json:"familySize1To2"`
	FamilySize3To4    int `json:"familySize3To4"`
	FamilySize5OrMore int `json:"familySize5OrMore"`
}

type BeneficiaryView struct {
	ID              string     `json:"id"`
	Region          string     `json:"region"`
	ValidationLevel string     `json:"validationLevel"`
	LastDeliveryAt  *time.Time `json:"lastDeliveryAt,omitempty"`
}

type DistributionSummary struct {
	Planned          int `json:"planned"`
	InProgress       int `json:"inProgress"`
	Confirmed        int `json:"confirmed"`
	ConfirmedBaskets int `json:"confirmedBaskets"`
}

type DistributionView struct {
	ID          string     `json:"id"`
	PartnerID   string     `json:"partnerId"`
	Region      string     `json:"region"`
	Status      string     `json:"status"`
	Baskets     int        `json:"baskets"`
	ScheduledAt *time.Time `json:"scheduledAt,omitempty"`
	ConfirmedAt *time.Time `json:"confirmedAt,omitempty"`
}

type Repository interface {
	EnsureSeedData(context.Context) error
	GetPartnerSummary(context.Context) (PartnerSummary, error)
	ListPartners(context.Context, int, int) ([]PartnerView, error)
	GetBeneficiarySummary(context.Context) (BeneficiarySummary, error)
	ListBeneficiaries(context.Context, int, int) ([]BeneficiaryView, error)
	GetDistributionSummary(context.Context) (DistributionSummary, error)
	ListDistributions(context.Context, int, int) ([]DistributionView, error)
}

type InMemoryRepository struct{}

func NewInMemoryRepository() *InMemoryRepository {
	return &InMemoryRepository{}
}

func (r *InMemoryRepository) EnsureSeedData(_ context.Context) error { return nil }

func (r *InMemoryRepository) GetPartnerSummary(_ context.Context) (PartnerSummary, error) {
	return PartnerSummary{Active: 3, Pending: 1, Paused: 1, Regions: 2}, nil
}

func (r *InMemoryRepository) ListPartners(_ context.Context, _ int, _ int) ([]PartnerView, error) {
	return []PartnerView{
		{ID: "partner-1", Name: "Centro A", Region: "Norte", Status: "active", CapacityMonthlyBaskets: 120},
	}, nil
}

func (r *InMemoryRepository) GetBeneficiarySummary(_ context.Context) (BeneficiarySummary, error) {
	return BeneficiarySummary{QuickValidation: 12, Validated: 8, FamilySize1To2: 7, FamilySize3To4: 9, FamilySize5OrMore: 4}, nil
}

func (r *InMemoryRepository) ListBeneficiaries(_ context.Context, _ int, _ int) ([]BeneficiaryView, error) {
	return []BeneficiaryView{{ID: "benef-1", Region: "Norte", ValidationLevel: "quick"}}, nil
}

func (r *InMemoryRepository) GetDistributionSummary(_ context.Context) (DistributionSummary, error) {
	return DistributionSummary{Planned: 6, InProgress: 4, Confirmed: 10, ConfirmedBaskets: 220}, nil
}

func (r *InMemoryRepository) ListDistributions(_ context.Context, _ int, _ int) ([]DistributionView, error) {
	return []DistributionView{{ID: "dist-1", PartnerID: "partner-1", Region: "Norte", Status: "confirmed", Baskets: 22}}, nil
}

type SQLRepository struct {
	db *sql.DB
}

func NewSQLRepository(db *sql.DB) *SQLRepository { return &SQLRepository{db: db} }

func (r *SQLRepository) EnsureSeedData(ctx context.Context) error {
	if r.db == nil {
		return nil
	}

	var partnerCount int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM partners`).Scan(&partnerCount); err != nil {
		return fmt.Errorf("count partners: %w", err)
	}
	if partnerCount == 0 {
		if _, err := r.db.ExecContext(ctx, `INSERT INTO partners(id, name, region, contact_info, capacity, created_at) VALUES
			('partner-1', 'Centro Comunitario Norte', 'Norte', 'norte@redecolmeia.dev', 160, CURRENT_TIMESTAMP),
			('partner-2', 'Rede Sul Solidaria', 'Sul', 'sul@redecolmeia.dev', 120, CURRENT_TIMESTAMP),
			('partner-3', 'Base Leste', 'Leste', 'leste@redecolmeia.dev', 80, CURRENT_TIMESTAMP)`); err != nil {
			return fmt.Errorf("seed partners: %w", err)
		}
	}

	var beneficiaryCount int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM beneficiaries`).Scan(&beneficiaryCount); err != nil {
		return fmt.Errorf("count beneficiaries: %w", err)
	}
	if beneficiaryCount == 0 {
		if _, err := r.db.ExecContext(ctx, `INSERT INTO beneficiaries(id, name, document_id, region, household_size, status, created_at) VALUES
			('benef-1', 'Familia A', 'DOC-1', 'Norte', 2, 'quick', CURRENT_TIMESTAMP),
			('benef-2', 'Familia B', 'DOC-2', 'Norte', 5, 'validated', CURRENT_TIMESTAMP),
			('benef-3', 'Familia C', 'DOC-3', 'Sul', 4, 'validated', CURRENT_TIMESTAMP)`); err != nil {
			return fmt.Errorf("seed beneficiaries: %w", err)
		}
	}

	var distCount int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM distributions`).Scan(&distCount); err != nil {
		return fmt.Errorf("count distributions: %w", err)
	}
	if distCount == 0 {
		if _, err := r.db.ExecContext(ctx, `INSERT INTO distributions(id, partner_id, total_baskets, status, created_at) VALUES
			('dist-1', 'partner-1', 30, 'planned', DATETIME('now', '-2 day')),
			('dist-2', 'partner-2', 25, 'in_progress', DATETIME('now', '-1 day')),
			('dist-3', 'partner-1', 22, 'confirmed', DATETIME('now', '-3 day'))`); err != nil {
			return fmt.Errorf("seed distributions: %w", err)
		}
		if _, err := r.db.ExecContext(ctx, `INSERT INTO distribution_items(id, distribution_id, beneficiary_id, status) VALUES
			('di-1', 'dist-3', 'benef-1', 'confirmed'),
			('di-2', 'dist-3', 'benef-2', 'confirmed')`); err != nil {
			return fmt.Errorf("seed distribution_items: %w", err)
		}
	}
	return nil
}

func (r *SQLRepository) GetPartnerSummary(ctx context.Context) (PartnerSummary, error) {
	var active, pending, paused, regions int
	if err := r.db.QueryRowContext(ctx, `SELECT
		COALESCE(SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END), 0),
		COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0),
		COALESCE(SUM(CASE WHEN status = 'paused' THEN 1 ELSE 0 END), 0),
		COALESCE(COUNT(DISTINCT region), 0)
		FROM partners`).Scan(&active, &pending, &paused, &regions); err != nil {
		return PartnerSummary{}, fmt.Errorf("partner summary: %w", err)
	}
	return PartnerSummary{Active: active, Pending: pending, Paused: paused, Regions: regions}, nil
}

func (r *SQLRepository) ListPartners(ctx context.Context, limit int, offset int) ([]PartnerView, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT id, name, COALESCE(region, ''), COALESCE(status, 'active'), COALESCE(capacity, 0)
		FROM partners ORDER BY created_at DESC LIMIT ? OFFSET ?`, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("list partners: %w", err)
	}
	defer rows.Close()
	items := make([]PartnerView, 0, limit)
	for rows.Next() {
		var item PartnerView
		if err := rows.Scan(&item.ID, &item.Name, &item.Region, &item.Status, &item.CapacityMonthlyBaskets); err != nil {
			return nil, fmt.Errorf("scan partner row: %w", err)
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *SQLRepository) GetBeneficiarySummary(ctx context.Context) (BeneficiarySummary, error) {
	var quick, validated, f1to2, f3to4, f5plus int
	if err := r.db.QueryRowContext(ctx, `SELECT
		COALESCE(SUM(CASE WHEN status = 'validated' THEN 0 ELSE 1 END), 0),
		COALESCE(SUM(CASE WHEN status = 'validated' THEN 1 ELSE 0 END), 0),
		COALESCE(SUM(CASE WHEN household_size BETWEEN 1 AND 2 THEN 1 ELSE 0 END), 0),
		COALESCE(SUM(CASE WHEN household_size BETWEEN 3 AND 4 THEN 1 ELSE 0 END), 0),
		COALESCE(SUM(CASE WHEN household_size >= 5 THEN 1 ELSE 0 END), 0)
		FROM beneficiaries`).Scan(&quick, &validated, &f1to2, &f3to4, &f5plus); err != nil {
		return BeneficiarySummary{}, fmt.Errorf("beneficiary summary: %w", err)
	}
	return BeneficiarySummary{
		QuickValidation:   quick,
		Validated:         validated,
		FamilySize1To2:    f1to2,
		FamilySize3To4:    f3to4,
		FamilySize5OrMore: f5plus,
	}, nil
}

func (r *SQLRepository) ListBeneficiaries(ctx context.Context, limit int, offset int) ([]BeneficiaryView, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT
		b.id,
		COALESCE(b.region, ''),
		COALESCE(b.status, 'quick'),
		(
			SELECT MAX(d.created_at)
			FROM distribution_items di
			JOIN distributions d ON d.id = di.distribution_id
			WHERE di.beneficiary_id = b.id
		) as last_delivery_at
		FROM beneficiaries b
		ORDER BY b.created_at DESC
		LIMIT ? OFFSET ?`, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("list beneficiaries: %w", err)
	}
	defer rows.Close()
	items := make([]BeneficiaryView, 0, limit)
	for rows.Next() {
		var item BeneficiaryView
		var lastDeliveryRaw sql.NullString
		if err := rows.Scan(&item.ID, &item.Region, &item.ValidationLevel, &lastDeliveryRaw); err != nil {
			return nil, fmt.Errorf("scan beneficiary row: %w", err)
		}
		if lastDeliveryRaw.Valid {
			if parsed, parseErr := time.Parse("2006-01-02 15:04:05", lastDeliveryRaw.String); parseErr == nil {
				parsedUTC := parsed.UTC()
				item.LastDeliveryAt = &parsedUTC
			}
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *SQLRepository) GetDistributionSummary(ctx context.Context) (DistributionSummary, error) {
	var planned, inProgress, confirmed, confirmedBaskets int
	if err := r.db.QueryRowContext(ctx, `SELECT
		COALESCE(SUM(CASE WHEN status = 'planned' THEN 1 ELSE 0 END), 0),
		COALESCE(SUM(CASE WHEN status IN ('in_progress', 'in-progress') THEN 1 ELSE 0 END), 0),
		COALESCE(SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END), 0),
		COALESCE(SUM(CASE WHEN status = 'confirmed' THEN total_baskets ELSE 0 END), 0)
		FROM distributions`).Scan(&planned, &inProgress, &confirmed, &confirmedBaskets); err != nil {
		return DistributionSummary{}, fmt.Errorf("distribution summary: %w", err)
	}
	return DistributionSummary{Planned: planned, InProgress: inProgress, Confirmed: confirmed, ConfirmedBaskets: confirmedBaskets}, nil
}

func (r *SQLRepository) ListDistributions(ctx context.Context, limit int, offset int) ([]DistributionView, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT
		d.id,
		COALESCE(d.partner_id, ''),
		COALESCE(p.region, ''),
		COALESCE(d.status, 'planned'),
		COALESCE(d.total_baskets, 0),
		d.created_at
		FROM distributions d
		LEFT JOIN partners p ON p.id = d.partner_id
		ORDER BY d.created_at DESC
		LIMIT ? OFFSET ?`, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("list distributions: %w", err)
	}
	defer rows.Close()
	items := make([]DistributionView, 0, limit)
	for rows.Next() {
		var item DistributionView
		var createdRaw sql.NullString
		if err := rows.Scan(&item.ID, &item.PartnerID, &item.Region, &item.Status, &item.Baskets, &createdRaw); err != nil {
			return nil, fmt.Errorf("scan distribution row: %w", err)
		}
		if createdRaw.Valid {
			if parsed, parseErr := time.Parse("2006-01-02 15:04:05", createdRaw.String); parseErr == nil {
				utc := parsed.UTC()
				item.ScheduledAt = &utc
				if item.Status == "confirmed" {
					item.ConfirmedAt = &utc
				}
			}
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

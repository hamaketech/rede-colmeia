package auth

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"
)

var (
	ErrCredentialNotFound      = errors.New("credential not found")
	ErrCredentialAlreadyExists = errors.New("credential already exists")
	ErrSessionNotFound         = errors.New("session not found")
)

type StoredCredential struct {
	Email        string
	Role         Role
	PasswordHash string
}

type StoredSession struct {
	ID        string
	Actor     Actor
	ExpiresAt time.Time
	RevokedAt *time.Time
}

type Repository interface {
	UpsertCredential(context.Context, StoredCredential) error
	CreateCredential(context.Context, StoredCredential) error
	FindCredentialByEmail(context.Context, string) (StoredCredential, error)
	InsertSession(context.Context, StoredSession) error
	FindSessionByID(context.Context, string) (StoredSession, error)
	RevokeSession(context.Context, string) error
	RevokeExpiredSessions(context.Context, time.Time) error
}

type InMemoryRepository struct {
	credentials map[string]StoredCredential
	sessions    map[string]StoredSession
	mutex       sync.RWMutex
}

func NewInMemoryRepository() *InMemoryRepository {
	return &InMemoryRepository{
		credentials: map[string]StoredCredential{},
		sessions:    map[string]StoredSession{},
	}
}

func (r *InMemoryRepository) UpsertCredential(_ context.Context, credential StoredCredential) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	r.credentials[credential.Email] = credential
	return nil
}

func (r *InMemoryRepository) FindCredentialByEmail(_ context.Context, email string) (StoredCredential, error) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()
	credential, ok := r.credentials[email]
	if !ok {
		return StoredCredential{}, ErrCredentialNotFound
	}
	return credential, nil
}

func (r *InMemoryRepository) CreateCredential(_ context.Context, credential StoredCredential) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	if _, exists := r.credentials[credential.Email]; exists {
		return ErrCredentialAlreadyExists
	}
	r.credentials[credential.Email] = credential
	return nil
}

func (r *InMemoryRepository) InsertSession(_ context.Context, session StoredSession) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	r.sessions[session.ID] = session
	return nil
}

func (r *InMemoryRepository) FindSessionByID(_ context.Context, sessionID string) (StoredSession, error) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()
	session, ok := r.sessions[sessionID]
	if !ok {
		return StoredSession{}, ErrSessionNotFound
	}
	return session, nil
}

func (r *InMemoryRepository) RevokeSession(_ context.Context, sessionID string) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	session, ok := r.sessions[sessionID]
	if !ok {
		return nil
	}
	now := time.Now().UTC()
	session.RevokedAt = &now
	r.sessions[sessionID] = session
	return nil
}

func (r *InMemoryRepository) RevokeExpiredSessions(_ context.Context, now time.Time) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	for sessionID, session := range r.sessions {
		if now.After(session.ExpiresAt) && session.RevokedAt == nil {
			revokedAt := now.UTC()
			session.RevokedAt = &revokedAt
			r.sessions[sessionID] = session
		}
	}
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

func (r *SQLRepository) UpsertCredential(ctx context.Context, credential StoredCredential) error {
	_, err := r.db.ExecContext(
		ctx,
		`INSERT INTO auth_credentials(email, role, password_hash, created_at, updated_at)
		 VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		 ON CONFLICT(email) DO UPDATE SET
		   role = excluded.role,
		   password_hash = excluded.password_hash,
		   updated_at = CURRENT_TIMESTAMP`,
		credential.Email,
		string(credential.Role),
		credential.PasswordHash,
	)
	if err != nil {
		return fmt.Errorf("upsert credential: %w", err)
	}
	return nil
}

func (r *SQLRepository) FindCredentialByEmail(ctx context.Context, email string) (StoredCredential, error) {
	var role string
	var passwordHash string
	err := r.db.QueryRowContext(
		ctx,
		`SELECT role, password_hash FROM auth_credentials WHERE email = ?`,
		email,
	).Scan(&role, &passwordHash)
	if errors.Is(err, sql.ErrNoRows) {
		return StoredCredential{}, ErrCredentialNotFound
	}
	if err != nil {
		return StoredCredential{}, fmt.Errorf("find credential by email: %w", err)
	}
	return StoredCredential{
		Email:        email,
		Role:         Role(role),
		PasswordHash: passwordHash,
	}, nil
}

func (r *SQLRepository) CreateCredential(ctx context.Context, credential StoredCredential) error {
	_, err := r.db.ExecContext(
		ctx,
		`INSERT INTO auth_credentials(email, role, password_hash, created_at, updated_at)
		 VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
		credential.Email,
		string(credential.Role),
		credential.PasswordHash,
	)
	if err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "unique") {
			return ErrCredentialAlreadyExists
		}
		return fmt.Errorf("create credential: %w", err)
	}
	return nil
}

func (r *SQLRepository) InsertSession(ctx context.Context, session StoredSession) error {
	_, err := r.db.ExecContext(
		ctx,
		`INSERT INTO auth_sessions(id, email, role, expires_at, created_at)
		 VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
		session.ID,
		session.Actor.Email,
		string(session.Actor.Role),
		session.ExpiresAt.UTC().Format(time.RFC3339),
	)
	if err != nil {
		return fmt.Errorf("insert session: %w", err)
	}
	return nil
}

func (r *SQLRepository) FindSessionByID(ctx context.Context, sessionID string) (StoredSession, error) {
	var email string
	var role string
	var expiresAtRaw any
	var revokedAtRaw any
	err := r.db.QueryRowContext(
		ctx,
		`SELECT email, role, expires_at, revoked_at
		 FROM auth_sessions
		 WHERE id = ?`,
		sessionID,
	).Scan(&email, &role, &expiresAtRaw, &revokedAtRaw)
	if errors.Is(err, sql.ErrNoRows) {
		return StoredSession{}, ErrSessionNotFound
	}
	if err != nil {
		return StoredSession{}, fmt.Errorf("find session by id: %w", err)
	}
	expiresAt, err := parseTimeValue(expiresAtRaw)
	if err != nil {
		return StoredSession{}, fmt.Errorf("parse session expires_at: %w", err)
	}

	var revokedAt *time.Time
	if revokedAtRaw != nil {
		parsedRevokedAt, parseErr := parseTimeValue(revokedAtRaw)
		if parseErr != nil {
			return StoredSession{}, fmt.Errorf("parse session revoked_at: %w", parseErr)
		}
		revokedAt = &parsedRevokedAt
	}

	return StoredSession{
		ID: sessionID,
		Actor: Actor{
			Email: email,
			Role:  Role(role),
		},
		ExpiresAt: expiresAt.UTC(),
		RevokedAt: revokedAt,
	}, nil
}

func (r *SQLRepository) RevokeSession(ctx context.Context, sessionID string) error {
	_, err := r.db.ExecContext(
		ctx,
		`UPDATE auth_sessions
		 SET revoked_at = COALESCE(revoked_at, ?)
		 WHERE id = ?`,
		time.Now().UTC().Format(time.RFC3339),
		sessionID,
	)
	if err != nil {
		return fmt.Errorf("revoke session: %w", err)
	}
	return nil
}

func (r *SQLRepository) RevokeExpiredSessions(ctx context.Context, now time.Time) error {
	_, err := r.db.ExecContext(
		ctx,
		`UPDATE auth_sessions
		 SET revoked_at = COALESCE(revoked_at, ?)
		 WHERE revoked_at IS NULL AND expires_at <= ?`,
		now.UTC().Format(time.RFC3339),
		now.UTC().Format(time.RFC3339),
	)
	if err != nil {
		return fmt.Errorf("revoke expired sessions: %w", err)
	}
	return nil
}

func parseTimeValue(value any) (time.Time, error) {
	switch typed := value.(type) {
	case time.Time:
		return typed.UTC(), nil
	case string:
		return time.Parse(time.RFC3339, typed)
	case []byte:
		return time.Parse(time.RFC3339, string(typed))
	default:
		return time.Time{}, fmt.Errorf("unsupported time value type %T", value)
	}
}

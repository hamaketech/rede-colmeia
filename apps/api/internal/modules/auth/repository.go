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
	ErrPasswordResetNotFound   = errors.New("password reset token not found")
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

type StoredPasswordResetToken struct {
	TokenHash string
	Email     string
	ExpiresAt time.Time
	UsedAt    *time.Time
}

type AuthEvent struct {
	Type      string
	Email     string
	SessionID string
	Meta      string
}

type Repository interface {
	UpsertCredential(context.Context, StoredCredential) error
	CreateCredential(context.Context, StoredCredential) error
	FindCredentialByEmail(context.Context, string) (StoredCredential, error)
	UpdateCredentialPassword(context.Context, string, string) error
	InsertSession(context.Context, StoredSession) error
	FindSessionByID(context.Context, string) (StoredSession, error)
	ListSessionsByEmail(context.Context, string) ([]StoredSession, error)
	RevokeSession(context.Context, string) error
	RevokeSessionsByEmail(context.Context, string) error
	RevokeExpiredSessions(context.Context, time.Time) error
	CreatePasswordResetToken(context.Context, StoredPasswordResetToken) error
	FindPasswordResetToken(context.Context, string) (StoredPasswordResetToken, error)
	ConsumePasswordResetToken(context.Context, string, time.Time) error
	ReadResetThrottle(context.Context, string) (time.Time, bool, error)
	UpsertResetThrottle(context.Context, string, time.Time) error
	InsertAuthEvent(context.Context, AuthEvent) error
}

type InMemoryRepository struct {
	credentials map[string]StoredCredential
	sessions    map[string]StoredSession
	resetTokens map[string]StoredPasswordResetToken
	throttles  map[string]time.Time
	events      []AuthEvent
	mutex       sync.RWMutex
}

func NewInMemoryRepository() *InMemoryRepository {
	return &InMemoryRepository{
		credentials: map[string]StoredCredential{},
		sessions:    map[string]StoredSession{},
		resetTokens: map[string]StoredPasswordResetToken{},
		throttles:   map[string]time.Time{},
		events:      []AuthEvent{},
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

func (r *InMemoryRepository) UpdateCredentialPassword(_ context.Context, email string, passwordHash string) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	credential, ok := r.credentials[email]
	if !ok {
		return ErrCredentialNotFound
	}
	credential.PasswordHash = passwordHash
	r.credentials[email] = credential
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

func (r *InMemoryRepository) ListSessionsByEmail(_ context.Context, email string) ([]StoredSession, error) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	sessions := make([]StoredSession, 0)
	for _, session := range r.sessions {
		if session.Actor.Email != email {
			continue
		}
		sessions = append(sessions, session)
	}
	return sessions, nil
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

func (r *InMemoryRepository) RevokeSessionsByEmail(_ context.Context, email string) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	now := time.Now().UTC()
	for sessionID, session := range r.sessions {
		if session.Actor.Email != email || session.RevokedAt != nil {
			continue
		}
		revokedAt := now
		session.RevokedAt = &revokedAt
		r.sessions[sessionID] = session
	}
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

func (r *InMemoryRepository) CreatePasswordResetToken(_ context.Context, token StoredPasswordResetToken) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	r.resetTokens[token.TokenHash] = token
	return nil
}

func (r *InMemoryRepository) FindPasswordResetToken(_ context.Context, tokenHash string) (StoredPasswordResetToken, error) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()
	token, ok := r.resetTokens[tokenHash]
	if !ok {
		return StoredPasswordResetToken{}, ErrPasswordResetNotFound
	}
	return token, nil
}

func (r *InMemoryRepository) ConsumePasswordResetToken(_ context.Context, tokenHash string, usedAt time.Time) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	token, ok := r.resetTokens[tokenHash]
	if !ok {
		return ErrPasswordResetNotFound
	}
	marked := usedAt.UTC()
	token.UsedAt = &marked
	r.resetTokens[tokenHash] = token
	return nil
}

func (r *InMemoryRepository) ReadResetThrottle(_ context.Context, email string) (time.Time, bool, error) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()
	lastRequestAt, ok := r.throttles[email]
	return lastRequestAt, ok, nil
}

func (r *InMemoryRepository) UpsertResetThrottle(_ context.Context, email string, requestedAt time.Time) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	r.throttles[email] = requestedAt.UTC()
	return nil
}

func (r *InMemoryRepository) InsertAuthEvent(_ context.Context, event AuthEvent) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	r.events = append(r.events, event)
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

func (r *SQLRepository) UpdateCredentialPassword(ctx context.Context, email string, passwordHash string) error {
	result, err := r.db.ExecContext(
		ctx,
		`UPDATE auth_credentials
		 SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
		 WHERE email = ?`,
		passwordHash,
		email,
	)
	if err != nil {
		return fmt.Errorf("update credential password: %w", err)
	}
	affectedRows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("read rows affected for credential update: %w", err)
	}
	if affectedRows == 0 {
		return ErrCredentialNotFound
	}
	return nil
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

func (r *SQLRepository) ListSessionsByEmail(ctx context.Context, email string) ([]StoredSession, error) {
	rows, err := r.db.QueryContext(
		ctx,
		`SELECT id, role, expires_at, revoked_at
		 FROM auth_sessions
		 WHERE email = ?
		 ORDER BY created_at DESC`,
		email,
	)
	if err != nil {
		return nil, fmt.Errorf("list sessions by email: %w", err)
	}
	defer rows.Close()

	sessions := make([]StoredSession, 0)
	for rows.Next() {
		var sessionID string
		var role string
		var expiresAtRaw any
		var revokedAtRaw any
		if err := rows.Scan(&sessionID, &role, &expiresAtRaw, &revokedAtRaw); err != nil {
			return nil, fmt.Errorf("scan session row: %w", err)
		}
		expiresAt, err := parseTimeValue(expiresAtRaw)
		if err != nil {
			return nil, fmt.Errorf("parse session expires_at: %w", err)
		}

		var revokedAt *time.Time
		if revokedAtRaw != nil {
			parsedRevokedAt, parseErr := parseTimeValue(revokedAtRaw)
			if parseErr != nil {
				return nil, fmt.Errorf("parse session revoked_at: %w", parseErr)
			}
			revokedAt = &parsedRevokedAt
		}

		sessions = append(sessions, StoredSession{
			ID: sessionID,
			Actor: Actor{
				Email: email,
				Role:  Role(role),
			},
			ExpiresAt: expiresAt.UTC(),
			RevokedAt: revokedAt,
		})
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate session rows: %w", err)
	}

	return sessions, nil
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

func (r *SQLRepository) RevokeSessionsByEmail(ctx context.Context, email string) error {
	_, err := r.db.ExecContext(
		ctx,
		`UPDATE auth_sessions
		 SET revoked_at = COALESCE(revoked_at, ?)
		 WHERE email = ?`,
		time.Now().UTC().Format(time.RFC3339),
		email,
	)
	if err != nil {
		return fmt.Errorf("revoke sessions by email: %w", err)
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

func (r *SQLRepository) CreatePasswordResetToken(ctx context.Context, token StoredPasswordResetToken) error {
	_, err := r.db.ExecContext(
		ctx,
		`INSERT INTO auth_password_reset_tokens(token_hash, email, expires_at, created_at)
		 VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
		token.TokenHash,
		token.Email,
		token.ExpiresAt.UTC().Format(time.RFC3339),
	)
	if err != nil {
		return fmt.Errorf("create password reset token: %w", err)
	}
	return nil
}

func (r *SQLRepository) FindPasswordResetToken(ctx context.Context, tokenHash string) (StoredPasswordResetToken, error) {
	var email string
	var expiresAtRaw any
	var usedAtRaw any
	err := r.db.QueryRowContext(
		ctx,
		`SELECT email, expires_at, used_at
		 FROM auth_password_reset_tokens
		 WHERE token_hash = ?`,
		tokenHash,
	).Scan(&email, &expiresAtRaw, &usedAtRaw)
	if errors.Is(err, sql.ErrNoRows) {
		return StoredPasswordResetToken{}, ErrPasswordResetNotFound
	}
	if err != nil {
		return StoredPasswordResetToken{}, fmt.Errorf("find password reset token: %w", err)
	}
	expiresAt, err := parseTimeValue(expiresAtRaw)
	if err != nil {
		return StoredPasswordResetToken{}, fmt.Errorf("parse reset token expires_at: %w", err)
	}
	var usedAt *time.Time
	if usedAtRaw != nil {
		parsedUsedAt, parseErr := parseTimeValue(usedAtRaw)
		if parseErr != nil {
			return StoredPasswordResetToken{}, fmt.Errorf("parse reset token used_at: %w", parseErr)
		}
		usedAt = &parsedUsedAt
	}

	return StoredPasswordResetToken{
		TokenHash: tokenHash,
		Email:     email,
		ExpiresAt: expiresAt,
		UsedAt:    usedAt,
	}, nil
}

func (r *SQLRepository) ConsumePasswordResetToken(ctx context.Context, tokenHash string, usedAt time.Time) error {
	result, err := r.db.ExecContext(
		ctx,
		`UPDATE auth_password_reset_tokens
		 SET used_at = COALESCE(used_at, ?)
		 WHERE token_hash = ?`,
		usedAt.UTC().Format(time.RFC3339),
		tokenHash,
	)
	if err != nil {
		return fmt.Errorf("consume password reset token: %w", err)
	}
	affectedRows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("read rows affected for reset token consume: %w", err)
	}
	if affectedRows == 0 {
		return ErrPasswordResetNotFound
	}
	return nil
}

func (r *SQLRepository) ReadResetThrottle(ctx context.Context, email string) (time.Time, bool, error) {
	var requestedAtRaw any
	err := r.db.QueryRowContext(
		ctx,
		`SELECT last_requested_at FROM auth_reset_throttles WHERE email = ?`,
		email,
	).Scan(&requestedAtRaw)
	if errors.Is(err, sql.ErrNoRows) {
		return time.Time{}, false, nil
	}
	if err != nil {
		return time.Time{}, false, fmt.Errorf("read reset throttle: %w", err)
	}
	requestedAt, err := parseTimeValue(requestedAtRaw)
	if err != nil {
		return time.Time{}, false, fmt.Errorf("parse reset throttle timestamp: %w", err)
	}
	return requestedAt.UTC(), true, nil
}

func (r *SQLRepository) UpsertResetThrottle(ctx context.Context, email string, requestedAt time.Time) error {
	_, err := r.db.ExecContext(
		ctx,
		`INSERT INTO auth_reset_throttles(email, last_requested_at, updated_at)
		 VALUES (?, ?, CURRENT_TIMESTAMP)
		 ON CONFLICT(email) DO UPDATE SET
		   last_requested_at = excluded.last_requested_at,
		   updated_at = CURRENT_TIMESTAMP`,
		email,
		requestedAt.UTC().Format(time.RFC3339),
	)
	if err != nil {
		return fmt.Errorf("upsert reset throttle: %w", err)
	}
	return nil
}

func (r *SQLRepository) InsertAuthEvent(ctx context.Context, event AuthEvent) error {
	_, err := r.db.ExecContext(
		ctx,
		`INSERT INTO auth_events(type, email, session_id, meta, created_at)
		 VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
		event.Type,
		event.Email,
		event.SessionID,
		event.Meta,
	)
	if err != nil {
		return fmt.Errorf("insert auth event: %w", err)
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

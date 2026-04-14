package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/rede-colmeia/apps/api/internal/config"
	"github.com/rede-colmeia/apps/api/internal/database"
	apphttp "github.com/rede-colmeia/apps/api/internal/http"
	"github.com/rede-colmeia/apps/api/internal/middleware"
	"github.com/rede-colmeia/apps/api/internal/modules/auth"
	"github.com/rede-colmeia/apps/api/internal/modules/users"
	"github.com/rede-colmeia/apps/api/internal/observability"
)

func main() {
	cfg := config.Load()
	logger := observability.NewLogger()
	observability.InitSentry(cfg.SentryDSN)

	db, err := database.Open(cfg.DatabaseURL, cfg.DatabaseToken)
	if err != nil {
		logger.Fatalf("database setup failed: %v", err)
	}
	if db != nil {
		defer db.Close()
	}

	if err := database.RunMigrations(db, "migrations"); err != nil {
		logger.Fatalf("migration setup failed: %v", err)
	}

	var usersRepo users.Repository
	if db != nil {
		usersRepo = users.NewSQLRepository(db)
		logger.Printf("users repository adapter: database")
	} else {
		usersRepo = users.NewInMemoryRepository()
		logger.Printf("users repository adapter: in-memory fallback")
	}

	var authRepo auth.Repository
	if db != nil {
		authRepo = auth.NewSQLRepository(db)
		logger.Printf("auth repository adapter: database")
	} else {
		authRepo = auth.NewInMemoryRepository()
		logger.Printf("auth repository adapter: in-memory fallback")
	}

	authService := auth.NewService(authRepo)
	if err := authService.SeedCredentials(context.Background(), cfg.AuthConfig); err != nil {
		logger.Fatalf("seed auth credentials failed: %v", err)
	}
	authHandler := auth.NewHandler(authService)
	usersService := users.NewService(usersRepo)
	usersHandler := users.NewHandler(usersService)

	router := apphttp.NewRouter(usersHandler, authHandler, authService)
	handler := middleware.WithRecovery(
		logger,
		middleware.WithRequestID(middleware.WithAuditLogger(logger, authService, router)),
	)

	server := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		logger.Printf("api server listening on :%s", cfg.Port)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("server failed: %v", err)
		}
	}()

	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, syscall.SIGINT, syscall.SIGTERM)
	<-shutdown

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("failed to shutdown server: %v", err)
	}
}

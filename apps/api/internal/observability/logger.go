package observability

import (
	"log"
	"os"
)

func NewLogger() *log.Logger {
	return log.New(os.Stdout, "[rede-colmeia-api] ", log.LstdFlags|log.LUTC)
}

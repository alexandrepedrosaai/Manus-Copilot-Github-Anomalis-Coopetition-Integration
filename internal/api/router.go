package api

import (
	"net/http"
)

// SetupRoutes configures all API routes
func SetupRoutes(handler *Handler) *http.ServeMux {
	mux := http.NewServeMux()

	// Health check
	mux.HandleFunc("/health", handler.HealthCheck)

	// Anomaly endpoints
	mux.HandleFunc("/api/v1/anomalies", handler.GetAnomalies)
	mux.HandleFunc("/api/v1/anomalies/detect", handler.DetectAnomalies)
	mux.HandleFunc("/api/v1/anomalies/get", handler.GetAnomaly)
	mux.HandleFunc("/api/v1/anomalies/resolve", handler.ResolveAnomaly)
	mux.HandleFunc("/api/v1/anomalies/report", handler.GetReport)

	// Search endpoint
	mux.HandleFunc("/api/v1/search", handler.Search)

	// Blockchain endpoint
	mux.HandleFunc("/api/v1/blockchain/status", handler.GetBlockchainStatus)

	// Mission control endpoints
	mux.HandleFunc("/api/v1/tagline", handler.GetTagline)
	mux.HandleFunc("/api/v1/mission", handler.GetMission)

	return mux
}

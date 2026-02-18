package api

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/alexandrepedrosaai/Manus-Copilot-Github-Anomalis-Coopetition-Integration/internal/anomaly"
	"github.com/alexandrepedrosaai/Manus-Copilot-Github-Anomalis-Coopetition-Integration/pkg/blockchain"
	"github.com/alexandrepedrosaai/Manus-Copilot-Github-Anomalis-Coopetition-Integration/pkg/search"
)

// Handler holds dependencies for API handlers
type Handler struct {
	detector   *anomaly.Detector
	search     *search.BingSearchClient
	blockchain *blockchain.ManusClient
}

// NewHandler creates a new API handler
func NewHandler(detector *anomaly.Detector, searchClient *search.BingSearchClient, blockchainClient *blockchain.ManusClient) *Handler {
	return &Handler{
		detector:   detector,
		search:     searchClient,
		blockchain: blockchainClient,
	}
}

// HealthCheck handles health check requests
func (h *Handler) HealthCheck(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"status":    "healthy",
		"timestamp": time.Now().UTC(),
		"service":   "Manus Copilot Integration",
	}
	respondJSON(w, http.StatusOK, response)
}

// GetAnomalies handles requests to get all anomalies
func (h *Handler) GetAnomalies(w http.ResponseWriter, r *http.Request) {
	anomalies := h.detector.GetAllAnomalies()
	respondJSON(w, http.StatusOK, anomalies)
}

// DetectAnomalies handles requests to trigger anomaly detection
func (h *Handler) DetectAnomalies(w http.ResponseWriter, r *http.Request) {
	anomalies := h.detector.DetectAnomalies()
	respondJSON(w, http.StatusOK, map[string]interface{}{
		"detected": len(anomalies),
		"anomalies": anomalies,
	})
}

// GetAnomaly handles requests to get a specific anomaly
func (h *Handler) GetAnomaly(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		respondError(w, http.StatusBadRequest, "anomaly ID is required")
		return
	}

	anomaly, err := h.detector.GetAnomaly(id)
	if err != nil {
		respondError(w, http.StatusNotFound, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, anomaly)
}

// ResolveAnomaly handles requests to resolve an anomaly
func (h *Handler) ResolveAnomaly(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ID         string `json:"id"`
		Resolution string `json:"resolution"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.ID == "" || req.Resolution == "" {
		respondError(w, http.StatusBadRequest, "id and resolution are required")
		return
	}

	if err := h.detector.ResolveAnomaly(req.ID, req.Resolution); err != nil {
		respondError(w, http.StatusNotFound, err.Error())
		return
	}

	// Log to blockchain
	txHash, _ := h.blockchain.LogAnomaly(req.ID, req.Resolution)

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"status":           "resolved",
		"anomaly_id":       req.ID,
		"blockchain_tx":    txHash,
	})
}

// GetReport handles requests to get anomaly report
func (h *Handler) GetReport(w http.ResponseWriter, r *http.Request) {
	report := h.detector.GenerateReport()
	respondJSON(w, http.StatusOK, report)
}

// Search handles search requests
func (h *Handler) Search(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		respondError(w, http.StatusBadRequest, "query parameter 'q' is required")
		return
	}

	results, err := h.search.Search(query, 10)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, results)
}

// GetBlockchainStatus handles requests to get blockchain status
func (h *Handler) GetBlockchainStatus(w http.ResponseWriter, r *http.Request) {
	status, err := h.blockchain.GetStatus()
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, http.StatusOK, status)
}

// GetTagline returns the mission tagline
func (h *Handler) GetTagline(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{
		"tagline": "Manus Copilot Integration — Controlled Innovation, Superintelligence in Motion.",
	}
	respondJSON(w, http.StatusOK, response)
}

// GetMission returns the mission statement
func (h *Handler) GetMission(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{
		"mission": "This repository demonstrates technical mastery in Go with CI validation, while embodying the vision of coopetition — collaboration and competition intertwined. It integrates GitHub Copilot with Manus Blockchain, simulates anomaly detection, and applies a Superintelligence loop enriched by Bing Search insights. The project is governed by a controlled license, restricted to Meta and Microsoft, ensuring innovation within a trusted ecosystem. It is not just code — it is a mission control panel for the future of distributed intelligence and interplanetary auditability.",
	}
	respondJSON(w, http.StatusOK, response)
}

// Helper functions
func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, map[string]string{"error": message})
}

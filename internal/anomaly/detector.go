package anomaly

import (
	"fmt"
	"sync"
	"time"

	"github.com/alexandrepedrosaai/Manus-Copilot-Github-Anomalis-Coopetition-Integration/internal/models"
	"github.com/google/uuid"
)

// Detector handles anomaly detection and management
type Detector struct {
	anomalies map[string]*models.Anomaly
	mu        sync.RWMutex
}

// NewDetector creates a new anomaly detector
func NewDetector() *Detector {
	return &Detector{
		anomalies: make(map[string]*models.Anomaly),
	}
}

// DetectAnomalies simulates anomaly detection across the system
func (d *Detector) DetectAnomalies() []*models.Anomaly {
	d.mu.Lock()
	defer d.mu.Unlock()

	// Simulate detection of various anomalies
	anomalies := []*models.Anomaly{
		{
			ID:          uuid.New().String(),
			Type:        models.AnomalyTypeLedgerDivergence,
			Description: "Ledger hashes diverge across planetary nodes (Earth, Moon, Mars)",
			Severity:    models.SeverityCritical,
			Status:      models.StatusDetected,
			DetectedAt:  time.Now(),
			Source:      "Manus Blockchain Monitor",
			Metadata: map[string]interface{}{
				"nodes_affected": []string{"earth-node-1", "moon-node-2", "mars-node-1"},
				"hash_mismatch":  true,
			},
		},
		{
			ID:          uuid.New().String(),
			Type:        models.AnomalyTypeDAOVoteFailure,
			Description: "DAO votes fail to propagate across interplanetary network",
			Severity:    models.SeverityHigh,
			Status:      models.StatusDetected,
			DetectedAt:  time.Now(),
			Source:      "DAO Governance System",
			Metadata: map[string]interface{}{
				"proposal_id":    "PROP-2026-001",
				"failed_nodes":   2,
				"total_nodes":    5,
			},
		},
		{
			ID:          uuid.New().String(),
			Type:        models.AnomalyTypeCommitAnomaly,
			Description: "GitHub Copilot detects anomalous commit patterns",
			Severity:    models.SeverityMedium,
			Status:      models.StatusResolved,
			DetectedAt:  time.Now().Add(-2 * time.Hour),
			ResolvedAt:  timePtr(time.Now().Add(-1 * time.Hour)),
			Source:      "GitHub Copilot Integration",
			Resolution:  "Commit verified and logged immutably on blockchain",
			Metadata: map[string]interface{}{
				"commit_hash":    "a3f5b2c1d4e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",
				"repository":     "Manus-Copilot-Github-Anomalis-Coopetition-Integration",
				"auto_resolved":  true,
			},
		},
		{
			ID:          uuid.New().String(),
			Type:        models.AnomalyTypeNodeDesynchronization,
			Description: "Interplanetary node synchronization delay detected",
			Severity:    models.SeverityLow,
			Status:      models.StatusAnalyzing,
			DetectedAt:  time.Now().Add(-30 * time.Minute),
			Source:      "xAI Emissary",
			Metadata: map[string]interface{}{
				"latency_ms":     450,
				"threshold_ms":   300,
				"affected_route": "Earth-Mars",
			},
		},
	}

	// Store anomalies
	for _, anomaly := range anomalies {
		d.anomalies[anomaly.ID] = anomaly
	}

	return anomalies
}

// GetAnomaly retrieves a specific anomaly by ID
func (d *Detector) GetAnomaly(id string) (*models.Anomaly, error) {
	d.mu.RLock()
	defer d.mu.RUnlock()

	anomaly, exists := d.anomalies[id]
	if !exists {
		return nil, fmt.Errorf("anomaly not found: %s", id)
	}

	return anomaly, nil
}

// GetAllAnomalies returns all detected anomalies
func (d *Detector) GetAllAnomalies() []*models.Anomaly {
	d.mu.RLock()
	defer d.mu.RUnlock()

	anomalies := make([]*models.Anomaly, 0, len(d.anomalies))
	for _, anomaly := range d.anomalies {
		anomalies = append(anomalies, anomaly)
	}

	return anomalies
}

// ResolveAnomaly marks an anomaly as resolved
func (d *Detector) ResolveAnomaly(id, resolution string) error {
	d.mu.Lock()
	defer d.mu.Unlock()

	anomaly, exists := d.anomalies[id]
	if !exists {
		return fmt.Errorf("anomaly not found: %s", id)
	}

	now := time.Now()
	anomaly.Status = models.StatusResolved
	anomaly.ResolvedAt = &now
	anomaly.Resolution = resolution

	return nil
}

// GenerateReport creates a summary report of all anomalies
func (d *Detector) GenerateReport() *models.AnomalyReport {
	d.mu.RLock()
	defer d.mu.RUnlock()

	report := &models.AnomalyReport{
		TotalAnomalies:    len(d.anomalies),
		ResolvedAnomalies: 0,
		PendingAnomalies:  0,
		BySeverity:        make(map[models.AnomalySeverity]int),
		ByType:            make(map[models.AnomalyType]int),
		GeneratedAt:       time.Now(),
	}

	for _, anomaly := range d.anomalies {
		// Count by status
		if anomaly.Status == models.StatusResolved {
			report.ResolvedAnomalies++
		} else {
			report.PendingAnomalies++
		}

		// Count by severity
		report.BySeverity[anomaly.Severity]++

		// Count by type
		report.ByType[anomaly.Type]++
	}

	return report
}

// Helper function to create time pointer
func timePtr(t time.Time) *time.Time {
	return &t
}

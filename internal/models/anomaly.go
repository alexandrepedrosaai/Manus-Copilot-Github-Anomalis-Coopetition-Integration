package models

import "time"

// AnomalyType represents the type of anomaly detected
type AnomalyType string

const (
	AnomalyTypeLedgerDivergence    AnomalyType = "ledger_divergence"
	AnomalyTypeDAOVoteFailure      AnomalyType = "dao_vote_failure"
	AnomalyTypeCommitAnomaly       AnomalyType = "commit_anomaly"
	AnomalyTypeNodeDesynchronization AnomalyType = "node_desync"
	AnomalyTypeUnknown             AnomalyType = "unknown"
)

// AnomalySeverity represents the severity level of an anomaly
type AnomalySeverity string

const (
	SeverityCritical AnomalySeverity = "critical"
	SeverityHigh     AnomalySeverity = "high"
	SeverityMedium   AnomalySeverity = "medium"
	SeverityLow      AnomalySeverity = "low"
)

// AnomalyStatus represents the current status of an anomaly
type AnomalyStatus string

const (
	StatusDetected   AnomalyStatus = "detected"
	StatusAnalyzing  AnomalyStatus = "analyzing"
	StatusResolved   AnomalyStatus = "resolved"
	StatusIgnored    AnomalyStatus = "ignored"
)

// Anomaly represents a detected anomaly in the system
type Anomaly struct {
	ID          string          `json:"id"`
	Type        AnomalyType     `json:"type"`
	Description string          `json:"description"`
	Severity    AnomalySeverity `json:"severity"`
	Status      AnomalyStatus   `json:"status"`
	DetectedAt  time.Time       `json:"detected_at"`
	ResolvedAt  *time.Time      `json:"resolved_at,omitempty"`
	Metadata    map[string]interface{} `json:"metadata,omitempty"`
	Source      string          `json:"source"`
	Resolution  string          `json:"resolution,omitempty"`
}

// AnomalyReport represents a summary report of anomalies
type AnomalyReport struct {
	TotalAnomalies    int                       `json:"total_anomalies"`
	ResolvedAnomalies int                       `json:"resolved_anomalies"`
	PendingAnomalies  int                       `json:"pending_anomalies"`
	BySeverity        map[AnomalySeverity]int   `json:"by_severity"`
	ByType            map[AnomalyType]int       `json:"by_type"`
	GeneratedAt       time.Time                 `json:"generated_at"`
}

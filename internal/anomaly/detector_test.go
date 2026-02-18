package anomaly

import (
	"testing"

	"github.com/alexandrepedrosaai/Manus-Copilot-Github-Anomalis-Coopetition-Integration/internal/models"
)

func TestNewDetector(t *testing.T) {
	detector := NewDetector()
	if detector == nil {
		t.Fatal("NewDetector returned nil")
	}

	if detector.anomalies == nil {
		t.Fatal("anomalies map not initialized")
	}
}

func TestDetectAnomalies(t *testing.T) {
	detector := NewDetector()
	anomalies := detector.DetectAnomalies()

	if len(anomalies) == 0 {
		t.Error("Expected anomalies to be detected, got none")
	}

	// Verify all anomalies have required fields
	for _, anomaly := range anomalies {
		if anomaly.ID == "" {
			t.Error("Anomaly missing ID")
		}
		if anomaly.Type == "" {
			t.Error("Anomaly missing Type")
		}
		if anomaly.Description == "" {
			t.Error("Anomaly missing Description")
		}
		if anomaly.Source == "" {
			t.Error("Anomaly missing Source")
		}
	}
}

func TestGetAnomaly(t *testing.T) {
	detector := NewDetector()
	anomalies := detector.DetectAnomalies()

	if len(anomalies) == 0 {
		t.Fatal("No anomalies detected")
	}

	// Test getting existing anomaly
	firstAnomaly := anomalies[0]
	retrieved, err := detector.GetAnomaly(firstAnomaly.ID)
	if err != nil {
		t.Fatalf("Failed to get anomaly: %v", err)
	}

	if retrieved.ID != firstAnomaly.ID {
		t.Errorf("Expected ID %s, got %s", firstAnomaly.ID, retrieved.ID)
	}

	// Test getting non-existent anomaly
	_, err = detector.GetAnomaly("non-existent-id")
	if err == nil {
		t.Error("Expected error for non-existent anomaly, got nil")
	}
}

func TestResolveAnomaly(t *testing.T) {
	detector := NewDetector()
	anomalies := detector.DetectAnomalies()

	if len(anomalies) == 0 {
		t.Fatal("No anomalies detected")
	}

	firstAnomaly := anomalies[0]
	resolution := "Test resolution"

	err := detector.ResolveAnomaly(firstAnomaly.ID, resolution)
	if err != nil {
		t.Fatalf("Failed to resolve anomaly: %v", err)
	}

	// Verify resolution
	resolved, _ := detector.GetAnomaly(firstAnomaly.ID)
	if resolved.Status != models.StatusResolved {
		t.Errorf("Expected status %s, got %s", models.StatusResolved, resolved.Status)
	}

	if resolved.Resolution != resolution {
		t.Errorf("Expected resolution %s, got %s", resolution, resolved.Resolution)
	}

	if resolved.ResolvedAt == nil {
		t.Error("ResolvedAt should not be nil")
	}
}

func TestGenerateReport(t *testing.T) {
	detector := NewDetector()
	detector.DetectAnomalies()

	report := detector.GenerateReport()

	if report == nil {
		t.Fatal("GenerateReport returned nil")
	}

	if report.TotalAnomalies == 0 {
		t.Error("Expected total anomalies > 0")
	}

	if report.TotalAnomalies != report.ResolvedAnomalies+report.PendingAnomalies {
		t.Error("Total anomalies should equal resolved + pending")
	}

	if len(report.BySeverity) == 0 {
		t.Error("Expected severity breakdown")
	}

	if len(report.ByType) == 0 {
		t.Error("Expected type breakdown")
	}
}

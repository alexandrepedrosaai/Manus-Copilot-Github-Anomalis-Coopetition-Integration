package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/alexandrepedrosaai/Manus-Copilot-Github-Anomalis-Coopetition-Integration/internal/anomaly"
	"github.com/alexandrepedrosaai/Manus-Copilot-Github-Anomalis-Coopetition-Integration/internal/api"
	"github.com/alexandrepedrosaai/Manus-Copilot-Github-Anomalis-Coopetition-Integration/internal/config"
	"github.com/alexandrepedrosaai/Manus-Copilot-Github-Anomalis-Coopetition-Integration/pkg/blockchain"
	"github.com/alexandrepedrosaai/Manus-Copilot-Github-Anomalis-Coopetition-Integration/pkg/search"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Print startup banner
	printBanner(cfg)

	// Initialize components
	detector := anomaly.NewDetector()
	searchClient := search.NewBingSearchClient(cfg.Bing.APIKey, cfg.Bing.Endpoint)
	blockchainClient := blockchain.NewManusClient(
		cfg.Manus.NodeURL,
		cfg.Manus.NetworkID,
		cfg.Manus.EnablePlanetary,
	)

	// Create API handler
	handler := api.NewHandler(detector, searchClient, blockchainClient)

	// Setup routes
	router := api.SetupRoutes(handler)

	// Create server
	addr := fmt.Sprintf("%s:%d", cfg.Server.Host, cfg.Server.Port)
	server := &http.Server{
		Addr:         addr,
		Handler:      router,
		ReadTimeout:  time.Duration(cfg.Server.ReadTimeout) * time.Second,
		WriteTimeout: time.Duration(cfg.Server.WriteTimeout) * time.Second,
	}

	// Start server in goroutine
	go func() {
		log.Printf("🚀 Server starting on %s", addr)
		log.Printf("📊 Environment: %s", cfg.Server.Environment)
		log.Printf("🔗 API Documentation: http://%s/health", addr)
		
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	// Perform initial anomaly detection
	log.Println("🔍 Running initial anomaly detection...")
	anomalies := detector.DetectAnomalies()
	log.Printf("✅ Detected %d anomalies", len(anomalies))

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("🛑 Shutting down server...")

	// Graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("✅ Server exited gracefully")
}

func printBanner(cfg *config.Config) {
	banner := `
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   🌌 MANUS COPILOT MISSION CONTROL                              ║
║                                                                  ║
║   Algorithmic Interoperability Between Superintelligences       ║
║   Making the Impossible Possible                                ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

🔹 Integration: Manus Blockchain + GitHub Copilot
🔹 Framework: Coopetition (Collaboration + Competition)
🔹 Architecture: Superintelligence Loop with Search Insights
🔹 Scope: Interplanetary Auditability (Earth, Moon, Mars)

`
	fmt.Println(banner)
}

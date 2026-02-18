package config

import (
	"fmt"
	"os"
	"strconv"
)

// Config holds all application configuration
type Config struct {
	Server   ServerConfig
	Bing     BingConfig
	Database DatabaseConfig
	Manus    ManusConfig
}

// ServerConfig holds server-related configuration
type ServerConfig struct {
	Port         int
	Host         string
	Environment  string
	ReadTimeout  int
	WriteTimeout int
}

// BingConfig holds Bing Search API configuration
type BingConfig struct {
	APIKey   string
	Endpoint string
}

// DatabaseConfig holds database configuration
type DatabaseConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
	SSLMode  string
}

// ManusConfig holds Manus Blockchain configuration
type ManusConfig struct {
	NodeURL         string
	NetworkID       string
	EnablePlanetary bool
}

// Load reads configuration from environment variables
func Load() (*Config, error) {
	config := &Config{
		Server: ServerConfig{
			Port:         getEnvAsInt("SERVER_PORT", 8080),
			Host:         getEnv("SERVER_HOST", "0.0.0.0"),
			Environment:  getEnv("ENVIRONMENT", "development"),
			ReadTimeout:  getEnvAsInt("READ_TIMEOUT", 15),
			WriteTimeout: getEnvAsInt("WRITE_TIMEOUT", 15),
		},
		Bing: BingConfig{
			APIKey:   getEnv("BING_API_KEY", ""),
			Endpoint: getEnv("BING_ENDPOINT", "https://api.bing.microsoft.com/v7.0/search"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnvAsInt("DB_PORT", 5432),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", ""),
			DBName:   getEnv("DB_NAME", "manus_copilot"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
		Manus: ManusConfig{
			NodeURL:         getEnv("MANUS_NODE_URL", "http://localhost:9545"),
			NetworkID:       getEnv("MANUS_NETWORK_ID", "1"),
			EnablePlanetary: getEnvAsBool("MANUS_ENABLE_PLANETARY", false),
		},
	}

	// Validate required fields
	if config.Server.Environment == "production" && config.Bing.APIKey == "" {
		return nil, fmt.Errorf("BING_API_KEY is required in production environment")
	}

	return config, nil
}

// Helper functions
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	valueStr := os.Getenv(key)
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultValue
}

func getEnvAsBool(key string, defaultValue bool) bool {
	valueStr := os.Getenv(key)
	if value, err := strconv.ParseBool(valueStr); err == nil {
		return value
	}
	return defaultValue
}

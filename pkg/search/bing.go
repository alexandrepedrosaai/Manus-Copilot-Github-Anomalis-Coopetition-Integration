package search

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"github.com/alexandrepedrosaai/Manus-Copilot-Github-Anomalis-Coopetition-Integration/internal/models"
)

// BingSearchClient handles interactions with Bing Search API
type BingSearchClient struct {
	apiKey   string
	endpoint string
	client   *http.Client
}

// NewBingSearchClient creates a new Bing Search client
func NewBingSearchClient(apiKey, endpoint string) *BingSearchClient {
	return &BingSearchClient{
		apiKey:   apiKey,
		endpoint: endpoint,
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// Search performs a search query using Bing Search API
func (b *BingSearchClient) Search(query string, count int) (*models.SearchResponse, error) {
	if b.apiKey == "" {
		return b.mockSearch(query, count), nil
	}

	u, err := url.Parse(b.endpoint)
	if err != nil {
		return nil, fmt.Errorf("invalid endpoint URL: %w", err)
	}

	q := u.Query()
	q.Set("q", query)
	q.Set("count", fmt.Sprintf("%d", count))
	u.RawQuery = q.Encode()

	req, err := http.NewRequest("GET", u.String(), nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Add("Ocp-Apim-Subscription-Key", b.apiKey)

	resp, err := b.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("search request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("search API returned status %d: %s", resp.StatusCode, string(body))
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	var bingResp models.BingResponse
	if err := json.Unmarshal(body, &bingResp); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	// Convert Bing response to our model
	searchResp := &models.SearchResponse{
		Query:        query,
		TotalResults: len(bingResp.WebPages.Value),
		Results:      make([]models.SearchResult, 0, len(bingResp.WebPages.Value)),
		Source:       "Bing Search API",
	}

	for _, page := range bingResp.WebPages.Value {
		searchResp.Results = append(searchResp.Results, models.SearchResult{
			Title:   page.Name,
			URL:     page.URL,
			Snippet: page.Snippet,
		})
	}

	return searchResp, nil
}

// mockSearch returns mock search results when API key is not configured
func (b *BingSearchClient) mockSearch(query string, count int) *models.SearchResponse {
	mockResults := []models.SearchResult{
		{
			Title:   "Manus Blockchain - Interplanetary Distributed Ledger",
			URL:     "https://manus.blockchain/docs",
			Snippet: "Manus Blockchain enables immutable logging across Earth, Moon, and Mars nodes with advanced anomaly detection.",
		},
		{
			Title:   "GitHub Copilot Integration Best Practices",
			URL:     "https://github.com/features/copilot",
			Snippet: "AI-powered code completion and anomaly detection for modern development workflows.",
		},
		{
			Title:   "Coopetition Framework in Distributed AI Systems",
			URL:     "https://research.ai/coopetition",
			Snippet: "Balancing collaboration and competition among autonomous agents in decentralized environments.",
		},
		{
			Title:   "Superintelligence Loop Architecture",
			URL:     "https://ai.research/superintelligence-loops",
			Snippet: "Iterative analysis patterns combining search insights with AI-driven decision making.",
		},
		{
			Title:   "DAO Governance and Vote Propagation",
			URL:     "https://dao.governance/voting-systems",
			Snippet: "Decentralized autonomous organization voting mechanisms across distributed networks.",
		},
	}

	// Limit results to requested count
	if count > 0 && count < len(mockResults) {
		mockResults = mockResults[:count]
	}

	return &models.SearchResponse{
		Query:        query,
		TotalResults: len(mockResults),
		Results:      mockResults,
		Source:       "Mock Search (API key not configured)",
	}
}

// SearchAnomalyContext searches for context about a specific anomaly
func (b *BingSearchClient) SearchAnomalyContext(anomalyType models.AnomalyType) (*models.SearchResponse, error) {
	query := fmt.Sprintf("MANUS Blockchain %s anomaly resolution", anomalyType)
	return b.Search(query, 5)
}

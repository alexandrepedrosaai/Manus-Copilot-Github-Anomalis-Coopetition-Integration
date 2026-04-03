package models

// SearchResult represents a single search result
type SearchResult struct {
	Title       string `json:"title"`
	URL         string `json:"url"`
	Description string `json:"description,omitempty"`
	Snippet     string `json:"snippet,omitempty"`
}

// SearchResponse represents the response from a search operation
type SearchResponse struct {
	Query       string         `json:"query"`
	TotalResults int           `json:"total_results"`
	Results     []SearchResult `json:"results"`
	Source      string         `json:"source"`
}

// BingWebPage represents a Bing search result
type BingWebPage struct {
	Name    string `json:"name"`
	URL     string `json:"url"`
	Snippet string `json:"snippet"`
}

// BingResponse represents the response from Bing Search API
type BingResponse struct {
	WebPages struct {
		Value []BingWebPage `json:"value"`
	} `json:"webPages"`
}

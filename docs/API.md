# API Documentation

## Base URL

All API endpoints are prefixed with `/api/v1` unless otherwise noted.

---

## Health Check

### `GET /health`

Returns the health status of the service.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-18T22:23:48.012159628Z",
  "service": "Manus Copilot Integration"
}
```

---

## Anomaly Management

### `GET /api/v1/anomalies`

Retrieves a list of all detected anomalies.

**Response:**
```json
[
  {
    "id": "fda895dd-747f-44ed-b7e3-2c7a6e9ce516",
    "type": "commit_anomaly",
    "description": "GitHub Copilot detects anomalous commit patterns",
    "severity": "medium",
    "status": "resolved",
    "detected_at": "2026-02-18T15:23:39.414541027-05:00",
    "resolved_at": "2026-02-18T16:23:39.414541549-05:00",
    "metadata": {
      "auto_resolved": true,
      "commit_hash": "a3f5b2c1d4e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",
      "repository": "Manus-Copilot-Github-Anomalis-Coopetition-Integration"
    },
    "source": "GitHub Copilot Integration",
    "resolution": "Commit verified and logged immutably on blockchain"
  }
]
```

---

### `POST /api/v1/anomalies/detect`

Triggers a new anomaly detection cycle.

**Response:**
```json
{
  "detected": 4,
  "anomalies": [...]
}
```

---

### `GET /api/v1/anomalies/get?id={id}`

Retrieves a specific anomaly by its ID.

**Parameters:**
- `id` (query, required): The unique identifier of the anomaly.

**Response:**
```json
{
  "id": "fda895dd-747f-44ed-b7e3-2c7a6e9ce516",
  "type": "commit_anomaly",
  "description": "GitHub Copilot detects anomalous commit patterns",
  "severity": "medium",
  "status": "resolved",
  ...
}
```

**Error Response (404):**
```json
{
  "error": "anomaly not found: invalid-id"
}
```

---

### `POST /api/v1/anomalies/resolve`

Resolves an anomaly and logs the resolution to the blockchain.

**Request Body:**
```json
{
  "id": "fda895dd-747f-44ed-b7e3-2c7a6e9ce516",
  "resolution": "Manually verified and resolved."
}
```

**Response:**
```json
{
  "status": "resolved",
  "anomaly_id": "fda895dd-747f-44ed-b7e3-2c7a6e9ce516",
  "blockchain_tx": "0xfda895dd1708363039"
}
```

---

### `GET /api/v1/anomalies/report`

Generates a summary report of all anomalies.

**Response:**
```json
{
  "total_anomalies": 4,
  "resolved_anomalies": 1,
  "pending_anomalies": 3,
  "by_severity": {
    "critical": 1,
    "high": 1,
    "medium": 1,
    "low": 1
  },
  "by_type": {
    "commit_anomaly": 1,
    "dao_vote_failure": 1,
    "ledger_divergence": 1,
    "node_desync": 1
  },
  "generated_at": "2026-02-18T22:23:48.012159628Z"
}
```

---

## Search

### `GET /api/v1/search?q={query}`

Performs a search for a given query using the Bing Search API (or mock data if no API key is configured).

**Parameters:**
- `q` (query, required): The search query string.

**Response:**
```json
{
  "query": "manus blockchain",
  "total_results": 5,
  "results": [
    {
      "title": "Manus Blockchain - Interplanetary Distributed Ledger",
      "url": "https://manus.blockchain/docs",
      "snippet": "Manus Blockchain enables immutable logging across Earth, Moon, and Mars nodes with advanced anomaly detection."
    }
  ],
  "source": "Mock Search (API key not configured)"
}
```

---

## Blockchain

### `GET /api/v1/blockchain/status`

Retrieves the status of the Manus Blockchain.

**Response:**
```json
{
  "network_id": "1",
  "current_block": 1234567,
  "planetary_nodes": ["Earth-Node-1"],
  "sync_status": "synchronized",
  "last_block_time": "2026-02-18T17:23:41.86042736-05:00"
}
```

---

## Mission Control

### `GET /api/v1/tagline`

Returns the project's mission tagline.

**Response:**
```json
{
  "tagline": "Manus Copilot Integration — Controlled Innovation, Superintelligence in Motion."
}
```

---

### `GET /api/v1/mission`

Returns the project's mission statement.

**Response:**
```json
{
  "mission": "This repository demonstrates technical mastery in Go with CI validation, while embodying the vision of coopetition — collaboration and competition intertwined. It integrates GitHub Copilot with Manus Blockchain, simulates anomaly detection, and applies a Superintelligence loop enriched by Bing Search insights. The project is governed by a controlled license, restricted to Meta and Microsoft, ensuring innovation within a trusted ecosystem. It is not just code — it is a mission control panel for the future of distributed intelligence and interplanetary auditability."
}
```

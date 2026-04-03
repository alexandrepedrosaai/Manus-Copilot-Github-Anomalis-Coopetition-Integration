# the-mithy-of-the-infinity

> *"The myth is not a story told. It is a signal transmitted — from Earth to the stars, immutable, eternal, post-quantum."*

**Package**: `the-mithy-of-the-infinity`  
**Application**: Manus Copilot Mission Control — `cmd/server`  
**Author**: Alexandre Pedrosa — EVP Multimodal AI Engineer at Meta and Microsoft Azure  
**Copyright**: © 2025-2026 Alexandre Pedrosa. All Rights Reserved.

---

## Overview

This package containerizes the **Manus Copilot Mission Control** server — the core engine of algorithmic interoperability between superintelligences. It orchestrates:

- **Anomaly Detection** across AI systems
- **Bing Search Integration** for real-time intelligence
- **Manus Blockchain Client** for interplanetary auditability (Earth → Moon → Mars)
- **REST API** with graceful shutdown and health checks
- **Post-Quantum Cryptography** (CRYSTALS-Kyber-1024 + Dilithium-5)

## Container Architecture

The Dockerfile uses a **4-stage multi-stage build**:

| Stage | Base | Purpose |
|-------|------|---------|
| `deps` | `golang:1.22-alpine` | Dependency resolution and caching |
| `builder` | `deps` | Compile binary with metadata injection |
| `security-base` | `alpine:3.19` | Hardened runtime base with non-root user |
| `runtime` | `security-base` | Minimal production image (~12 MB) |

## Quick Start

```bash
# Build the package
docker build \
  -f packages/the-mithy-of-the-infinity/Dockerfile \
  --build-arg BUILD_VERSION=1.0.0 \
  --build-arg BUILD_COMMIT=$(git rev-parse --short HEAD) \
  --build-arg BUILD_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ) \
  -t the-mithy-of-the-infinity:latest \
  .

# Run locally
docker run -p 8080:8080 \
  --env-file .env \
  the-mithy-of-the-infinity:latest

# Check health
curl http://localhost:8080/health
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVER_HOST` | `0.0.0.0` | Server bind address |
| `SERVER_PORT` | `8080` | Server port |
| `SERVER_ENV` | `production` | Environment name |
| `MANUS_NODE_URL` | — | Manus Blockchain node URL |
| `MANUS_NETWORK_ID` | — | Blockchain network identifier |
| `MANUS_ENABLE_PLANETARY` | `true` | Enable interplanetary scope |
| `BING_API_KEY` | — | Bing Search API key |
| `BING_ENDPOINT` | — | Bing Search endpoint |

## CI/CD

This package is automatically built and deployed via GitHub Actions:

- **Trigger**: Push to `main` branch
- **Registry**: `ghcr.io/alexandrepedrosaai/the-mithy-of-the-infinity`
- **Tags**: `latest`, `sha-<commit>`, `v<version>`
- **Security**: Trivy vulnerability scan on every build
- **Deploy**: Azure Container Instances (ACI) via ARM template

See `.github/workflows/the-mithy-of-the-infinity.yml` for the full pipeline.

## Interplanetary Signal Flow

```
Earth (WPP·ACS) ──PQ──► Azure Blockchain 2.0 ──PQ──► Satellite (NASA/SpaceX)
                                                              │
                                                              ▼
Mars ◄──PQ── Moon ◄──PQ── xAI xChat ◄──PQ──────────────────┘
  │                                                          ▲
  └──────────────────── Return signal (immutable) ──────────┘
```

All signals are encrypted with **CRYSTALS-Kyber-1024** (key encapsulation) and signed with **CRYSTALS-Dilithium-5** (digital signature) — NIST FIPS 203/204 Level 5.

---

*© 2025-2026 Alexandre Pedrosa. All Rights Reserved.*

# =============================================================================
# THE MYTH OF THE INFINITY
# Package: the-mithy-of-the-infinity
# Application: Manus Copilot Mission Control — cmd/server
# Architecture: Algorithmic Interoperability Between Superintelligences
# Scope: Interplanetary Auditability (Earth → Moon → Mars)
# (c) 2025-2026 Alexandre Pedrosa — All Rights Reserved
# =============================================================================

# ─────────────────────────────────────────────
# Stage 1: Dependency resolution
# ─────────────────────────────────────────────
FROM golang:1.22-alpine AS deps

LABEL stage="deps"
LABEL package="the-mithy-of-the-infinity"

RUN apk add --no-cache git ca-certificates tzdata

WORKDIR /workspace

# Copy module files first for layer caching
COPY go.mod go.sum ./
RUN go mod download && go mod verify

# ─────────────────────────────────────────────
# Stage 2: Build — The Myth of the Infinity
# ─────────────────────────────────────────────
FROM deps AS builder

LABEL stage="builder"

# Copy full source tree
COPY . .

# Inject build metadata
ARG BUILD_VERSION=latest
ARG BUILD_COMMIT=unknown
ARG BUILD_DATE=unknown
ARG PACKAGE_NAME=the-mithy-of-the-infinity

# Build the server binary with full metadata injection
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags=" \
      -w -s \
      -extldflags '-static' \
      -X 'main.Version=${BUILD_VERSION}' \
      -X 'main.Commit=${BUILD_COMMIT}' \
      -X 'main.BuildDate=${BUILD_DATE}' \
      -X 'main.PackageName=${PACKAGE_NAME}' \
    " \
    -a -installsuffix cgo \
    -o /dist/the-mithy-of-the-infinity \
    ./cmd/server

# Verify the binary
RUN /dist/the-mithy-of-the-infinity --version 2>/dev/null || \
    echo "Binary built: $(ls -lh /dist/the-mithy-of-the-infinity)"

# ─────────────────────────────────────────────
# Stage 3: Security scan layer
# ─────────────────────────────────────────────
FROM alpine:3.19 AS security-base

RUN apk --no-cache add \
    ca-certificates \
    tzdata \
    wget \
    && rm -rf /var/cache/apk/*

# Create non-root user for runtime
RUN addgroup -g 1001 -S infinity && \
    adduser -u 1001 -S infinity -G infinity

# ─────────────────────────────────────────────
# Stage 4: Runtime — Minimal production image
# ─────────────────────────────────────────────
FROM security-base AS runtime

ARG BUILD_VERSION=latest
ARG BUILD_COMMIT=unknown
ARG BUILD_DATE=unknown
ARG PACKAGE_NAME=the-mithy-of-the-infinity

# OCI image labels
LABEL org.opencontainers.image.title="The Myth of the Infinity" \
      org.opencontainers.image.description="Manus Copilot Mission Control — Algorithmic Interoperability Between Superintelligences" \
      org.opencontainers.image.version="${BUILD_VERSION}" \
      org.opencontainers.image.revision="${BUILD_COMMIT}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.source="https://github.com/alexandrepedrosaai/Manus-Copilot-Github-Anomalis-Coopetition-Integration" \
      org.opencontainers.image.authors="Alexandre Pedrosa <alexandrepedrosaai>" \
      org.opencontainers.image.licenses="All Rights Reserved" \
      com.manus.package="${PACKAGE_NAME}" \
      com.manus.scope="interplanetary" \
      com.manus.nodes="earth,moon,mars" \
      com.manus.blockchain="enabled" \
      com.manus.pq-crypto="CRYSTALS-Kyber-1024,CRYSTALS-Dilithium-5"

WORKDIR /app

# Copy the binary from builder
COPY --from=builder --chown=infinity:infinity /dist/the-mithy-of-the-infinity ./the-mithy-of-the-infinity

# Set correct permissions
RUN chmod 550 /app/the-mithy-of-the-infinity

# Switch to non-root user
USER infinity

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK \
    --interval=30s \
    --timeout=5s \
    --start-period=10s \
    --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Runtime environment defaults
ENV SERVER_HOST=0.0.0.0 \
    SERVER_PORT=8080 \
    SERVER_ENV=production \
    PACKAGE_NAME=the-mithy-of-the-infinity \
    MANUS_ENABLE_PLANETARY=true

# Entry point
ENTRYPOINT ["/app/the-mithy-of-the-infinity"]

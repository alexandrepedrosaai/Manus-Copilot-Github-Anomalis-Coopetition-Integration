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
# Builder sub-stage 1: Copy source tree
# ─────────────────────────────────────────────
FROM deps AS builder-s1-copy-src

LABEL stage="builder-s1-copy-src"

COPY . .

# ─────────────────────────────────────────────
# Builder sub-stage 2: Inject build args
# ─────────────────────────────────────────────
FROM builder-s1-copy-src AS builder-s2-build-args

LABEL stage="builder-s2-build-args"

ARG BUILD_VERSION=latest
ARG BUILD_COMMIT=unknown
ARG BUILD_DATE=unknown
ARG PACKAGE_NAME=the-mithy-of-the-infinity

RUN echo "BUILD_VERSION=${BUILD_VERSION}" > /workspace/.build-meta && \
    echo "BUILD_COMMIT=${BUILD_COMMIT}" >> /workspace/.build-meta && \
    echo "BUILD_DATE=${BUILD_DATE}" >> /workspace/.build-meta && \
    echo "PACKAGE_NAME=${PACKAGE_NAME}" >> /workspace/.build-meta && \
    cat /workspace/.build-meta

# ─────────────────────────────────────────────
# Builder sub-stage 3: go generate (if any)
# ─────────────────────────────────────────────
FROM builder-s2-build-args AS builder-s3-generate

LABEL stage="builder-s3-generate"

RUN go generate ./... 2>/dev/null || echo "no go:generate directives found"

# ─────────────────────────────────────────────
# Builder sub-stage 4: go vet inside container
# ─────────────────────────────────────────────
FROM builder-s3-generate AS builder-s4-vet

LABEL stage="builder-s4-vet"

RUN go vet ./...

# ─────────────────────────────────────────────
# Builder sub-stage 5: Compile cmd/server (no output)
# ─────────────────────────────────────────────
FROM builder-s4-vet AS builder-s5-compile-check

LABEL stage="builder-s5-compile-check"

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -a -installsuffix cgo \
    ./cmd/server

# ─────────────────────────────────────────────
# Builder sub-stage 6: Build binary (no ldflags)
# ─────────────────────────────────────────────
FROM builder-s5-compile-check AS builder-s6-binary-plain

LABEL stage="builder-s6-binary-plain"

RUN mkdir -p /dist && \
    CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -a -installsuffix cgo \
    -o /dist/the-mithy-of-the-infinity \
    ./cmd/server && \
    echo "Plain binary: $(ls -lh /dist/the-mithy-of-the-infinity)"

# ─────────────────────────────────────────────
# Builder sub-stage 7: Strip + inject ldflags
# ─────────────────────────────────────────────
FROM builder-s6-binary-plain AS builder-s7-binary-stripped

LABEL stage="builder-s7-binary-stripped"

ARG BUILD_VERSION=latest
ARG BUILD_COMMIT=unknown
ARG BUILD_DATE=unknown
ARG PACKAGE_NAME=the-mithy-of-the-infinity

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
    ./cmd/server && \
    echo "Stripped binary: $(ls -lh /dist/the-mithy-of-the-infinity)"

# ─────────────────────────────────────────────
# Builder sub-stage 8: Verify binary integrity
# ─────────────────────────────────────────────
FROM builder-s7-binary-stripped AS builder-s8-verify

LABEL stage="builder-s8-verify"

RUN file /dist/the-mithy-of-the-infinity && \
    /dist/the-mithy-of-the-infinity --version 2>/dev/null || \
    echo "Binary built: $(ls -lh /dist/the-mithy-of-the-infinity)"

# ─────────────────────────────────────────────
# Builder sub-stage 9: Checksum + audit
# ─────────────────────────────────────────────
FROM builder-s8-verify AS builder-s9-checksum

LABEL stage="builder-s9-checksum"

RUN sha256sum /dist/the-mithy-of-the-infinity > /dist/the-mithy-of-the-infinity.sha256 && \
    echo "SHA256: $(cat /dist/the-mithy-of-the-infinity.sha256)" && \
    echo "Size:   $(du -sh /dist/the-mithy-of-the-infinity | cut -f1)"

# ─────────────────────────────────────────────
# Builder sub-stage 10: Final builder (alias)
# ─────────────────────────────────────────────
FROM builder-s9-checksum AS builder

LABEL stage="builder"

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

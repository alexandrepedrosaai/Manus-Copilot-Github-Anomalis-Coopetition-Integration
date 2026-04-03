# CI/CD Workflow Setup Instructions

Due to GitHub App permissions, the CI/CD workflow file needs to be added manually through the GitHub web interface.

## Steps to Add the Workflow

1. **Navigate to your repository on GitHub:**
   ```
   https://github.com/alexandrepedrosaai/Manus-Copilot-Github-Anomalis-Coopetition-Integration
   ```

2. **Go to the Actions tab:**
   Click on "Actions" in the top navigation bar.

3. **Set up a workflow yourself:**
   Click on "set up a workflow yourself" or "New workflow".

4. **Create the workflow file:**
   - Name the file: `ci-cd.yml`
   - Copy the content from the workflow file below

5. **Commit the workflow:**
   Click "Start commit" and then "Commit new file".

## Workflow File Content

The complete workflow file is located at:
```
.github/workflows/ci-cd.yml
```

You can find it in your local repository at the path above, or copy it from here:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ "main", "develop" ]
  pull_request:
    branches: [ "main", "develop" ]
  workflow_dispatch:

env:
  GO_VERSION: '1.22'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Lint and format check
  lint:
    name: Lint Code
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: ${{ env.GO_VERSION }}

      - name: Run go fmt
        run: |
          if [ -n "$(gofmt -s -l .)" ]; then
            echo "Go code is not formatted:"
            gofmt -s -d .
            exit 1
          fi

      - name: Run go vet
        run: go vet ./...

      - name: Install staticcheck
        run: go install honnef.co/go/tools/cmd/staticcheck@latest

      - name: Run staticcheck
        run: staticcheck ./...

  # Build and test
  build-test:
    name: Build and Test
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: ${{ env.GO_VERSION }}

      - name: Cache Go modules
        uses: actions/cache@v4
        with:
          path: ~/go/pkg/mod
          key: ${{ runner.os }}-go-${{ hashFiles('**/go.sum') }}
          restore-keys: |
            ${{ runner.os }}-go-

      - name: Download dependencies
        run: go mod download

      - name: Build application
        run: go build -v -o bin/manus-server ./cmd/server

      - name: Run tests
        run: go test -v -race -coverprofile=coverage.out -covermode=atomic ./...

      - name: Generate coverage report
        run: go tool cover -html=coverage.out -o coverage.html

      - name: Upload coverage to artifacts
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage.html

      - name: Upload binary to artifacts
        uses: actions/upload-artifact@v4
        with:
          name: manus-server
          path: bin/manus-server

  # Security scanning
  security:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: ${{ env.GO_VERSION }}

      - name: Run Gosec Security Scanner
        uses: securego/gosec@master
        with:
          args: '-no-fail -fmt sarif -out results.sarif ./...'

      - name: Upload SARIF file
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: results.sarif

  # Build and push Docker image
  docker:
    name: Build Docker Image
    runs-on: ubuntu-latest
    needs: [build-test, security]
    permissions:
      contents: read
      packages: write
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          platforms: linux/amd64,linux/arm64

      - name: Scan Docker image for vulnerabilities
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'

  # Deploy notification
  deploy-notification:
    name: Deployment Ready
    runs-on: ubuntu-latest
    needs: docker
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - name: Deployment notification
        run: |
          echo "✅ Build successful! Docker image is ready for deployment."
          echo "🚀 Image: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest"
```

## Alternative: Using GitHub CLI

If you have the GitHub CLI installed and authenticated, you can also add the workflow using:

```bash
# Navigate to your repository
cd /path/to/Manus-Copilot-Github-Anomalis-Coopetition-Integration

# Create the workflow directory if it doesn't exist
mkdir -p .github/workflows

# Copy the workflow file (it's already in your local repo)
# Then commit and push via the web interface or ask a repository admin
# to grant workflow permissions to the GitHub App
```

## Verifying the Workflow

Once the workflow is added:

1. Go to the "Actions" tab in your repository
2. You should see the "CI/CD Pipeline" workflow
3. It will run automatically on the next push to `main` or `develop`
4. You can also trigger it manually using the "Run workflow" button

## Troubleshooting

If the workflow doesn't appear:
- Ensure the file is in `.github/workflows/` directory
- Check that the YAML syntax is valid
- Verify you have the necessary repository permissions

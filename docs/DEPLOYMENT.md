# Deployment Guide

This guide provides detailed instructions for deploying the **Manus-Copilot Integration** to various environments, including local development, Kubernetes clusters, and AWS using Terraform.

---

## Table of Contents

1. [Local Development with Docker Compose](#local-development-with-docker-compose)
2. [Kubernetes Deployment](#kubernetes-deployment)
3. [AWS Deployment with Terraform](#aws-deployment-with-terraform)
4. [Environment Variables](#environment-variables)
5. [Monitoring and Observability](#monitoring-and-observability)

---

## Local Development with Docker Compose

Docker Compose provides the simplest way to run the application locally along with its dependencies (PostgreSQL and Redis).

### Prerequisites

- Docker and Docker Compose installed on your machine

### Steps

1. **Clone the repository:**
   ```sh
   git clone https://github.com/alexandrepedrosaai/Manus-Copilot-Github-Anomalis-Coopetition-Integration.git
   cd Manus-Copilot-Github-Anomalis-Coopetition-Integration
   ```

2. **Create a `.env` file:**
   Copy the example environment file and customize it as needed.
   ```sh
   cp .env.example .env
   ```

3. **Start the services:**
   ```sh
   docker-compose up -d
   ```

4. **Verify the deployment:**
   ```sh
   curl http://localhost:8080/health
   ```

5. **View logs:**
   ```sh
   docker-compose logs -f manus-server
   ```

6. **Stop the services:**
   ```sh
   docker-compose down
   ```

---

## Kubernetes Deployment

Deploying to Kubernetes provides production-grade orchestration, auto-scaling, and resilience.

### Prerequisites

- A running Kubernetes cluster (local via Minikube/Kind, or cloud-based like GKE, EKS, AKS)
- `kubectl` configured to access your cluster

### Steps

1. **Create secrets:**
   Copy the secrets template and fill in your actual values.
   ```sh
   cp deployments/kubernetes/secrets.yaml.template deployments/kubernetes/secrets.yaml
   # Edit secrets.yaml with your BING_API_KEY and other sensitive data
   ```

2. **Run the deployment script:**
   ```sh
   ./scripts/deploy-k8s.sh
   ```
   This script will:
   - Create a namespace (`manus-copilot`)
   - Apply secrets
   - Deploy the application
   - Create a LoadBalancer service
   - Configure Horizontal Pod Autoscaler (HPA)

3. **Check deployment status:**
   ```sh
   kubectl get pods -n manus-copilot
   kubectl get service -n manus-copilot
   ```

4. **Access the application:**
   If using a LoadBalancer, get the external IP:
   ```sh
   kubectl get service manus-copilot-service -n manus-copilot
   ```
   Or use port-forwarding for local access:
   ```sh
   kubectl port-forward service/manus-copilot-service 8080:80 -n manus-copilot
   ```

5. **View logs:**
   ```sh
   kubectl logs -f -l app=manus-copilot -n manus-copilot
   ```

6. **Scale manually (optional):**
   ```sh
   kubectl scale deployment manus-copilot-server --replicas=5 -n manus-copilot
   ```

---

## AWS Deployment with Terraform

Terraform enables infrastructure-as-code (IaC) for reproducible AWS deployments.

### Prerequisites

- AWS account with appropriate permissions
- AWS CLI configured (`aws configure`)
- Terraform installed (v1.0+)
- An S3 bucket for storing Terraform state (update `backend "s3"` in `main.tf`)

### Steps

1. **Navigate to the Terraform directory:**
   ```sh
   cd deployments/terraform
   ```

2. **Initialize Terraform:**
   ```sh
   terraform init
   ```

3. **Review the plan:**
   ```sh
   terraform plan -var="bing_api_key=YOUR_BING_API_KEY"
   ```

4. **Apply the configuration:**
   ```sh
   terraform apply -var="bing_api_key=YOUR_BING_API_KEY"
   ```
   Confirm with `yes` when prompted.

5. **Retrieve outputs:**
   After successful deployment, Terraform will output:
   - **ALB DNS Name**: The public endpoint for your application
   - **ECR Repository URL**: Where to push Docker images
   - **ECS Cluster Name**: The name of the ECS cluster

6. **Push Docker image to ECR:**
   ```sh
   # Authenticate Docker to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ECR_URL>
   
   # Tag and push the image
   docker tag manus-copilot-test:latest <ECR_URL>:latest
   docker push <ECR_URL>:latest
   ```

7. **Access the application:**
   Open the ALB DNS name in your browser or use `curl`:
   ```sh
   curl http://<ALB_DNS_NAME>/health
   ```

8. **Destroy infrastructure (when done):**
   ```sh
   terraform destroy -var="bing_api_key=YOUR_BING_API_KEY"
   ```

---

## Environment Variables

The application is configured via environment variables. Below is a complete list:

| Variable                  | Description                                      | Default                                      |
| ------------------------- | ------------------------------------------------ | -------------------------------------------- |
| `SERVER_PORT`             | Port the server listens on                       | `8080`                                       |
| `SERVER_HOST`             | Host address to bind to                          | `0.0.0.0`                                    |
| `ENVIRONMENT`             | Environment name (development/production)        | `development`                                |
| `READ_TIMEOUT`            | HTTP read timeout in seconds                     | `15`                                         |
| `WRITE_TIMEOUT`           | HTTP write timeout in seconds                    | `15`                                         |
| `BING_API_KEY`            | Bing Search API key (optional for mock mode)     | `` (empty)                                   |
| `BING_ENDPOINT`           | Bing Search API endpoint                         | `https://api.bing.microsoft.com/v7.0/search` |
| `DB_HOST`                 | Database host                                    | `localhost`                                  |
| `DB_PORT`                 | Database port                                    | `5432`                                       |
| `DB_USER`                 | Database user                                    | `postgres`                                   |
| `DB_PASSWORD`             | Database password                                | `` (empty)                                   |
| `DB_NAME`                 | Database name                                    | `manus_copilot`                              |
| `DB_SSLMODE`              | Database SSL mode                                | `disable`                                    |
| `MANUS_NODE_URL`          | Manus Blockchain node URL                        | `http://localhost:9545`                      |
| `MANUS_NETWORK_ID`        | Manus Blockchain network ID                      | `1`                                          |
| `MANUS_ENABLE_PLANETARY`  | Enable planetary nodes (Earth, Moon, Mars)       | `false`                                      |

---

## Monitoring and Observability

### Health Checks

The application exposes a `/health` endpoint that returns the current status. This is used by:
- Kubernetes liveness and readiness probes
- Load balancer health checks
- Monitoring systems

### Logs

Structured logging is implemented throughout the application. Logs are written to stdout and can be collected by:
- Docker Compose: `docker-compose logs -f`
- Kubernetes: `kubectl logs -f <pod-name>`
- AWS CloudWatch: Automatically collected from ECS tasks

### Metrics (Future Enhancement)

The application is designed to support metrics collection via Prometheus. Future versions will expose a `/metrics` endpoint with:
- Request count and latency
- Anomaly detection metrics
- Blockchain interaction metrics
- Search API call metrics

### Distributed Tracing (Future Enhancement)

Integration with OpenTelemetry for distributed tracing across services is planned for future releases.

---

## Troubleshooting

### Application won't start

- Check environment variables are set correctly
- Verify port 8080 is not already in use
- Review logs for error messages

### Health check fails

- Ensure the server is fully started (may take a few seconds)
- Check firewall rules allow traffic on port 8080
- Verify the application is listening on `0.0.0.0` not `127.0.0.1`

### Kubernetes pods not ready

- Check pod logs: `kubectl logs <pod-name> -n manus-copilot`
- Verify secrets are created correctly
- Ensure the Docker image is accessible

### Terraform apply fails

- Verify AWS credentials are configured
- Check S3 bucket for state storage exists
- Review IAM permissions for the user/role

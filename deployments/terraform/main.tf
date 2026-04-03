terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "manus-copilot-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC Configuration
resource "aws_vpc" "manus_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "manus-copilot-vpc"
    Environment = var.environment
    Project     = "Manus-Copilot-Integration"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "manus_igw" {
  vpc_id = aws_vpc.manus_vpc.id

  tags = {
    Name        = "manus-copilot-igw"
    Environment = var.environment
  }
}

# Public Subnets
resource "aws_subnet" "public_subnet_1" {
  vpc_id                  = aws_vpc.manus_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name        = "manus-copilot-public-subnet-1"
    Environment = var.environment
  }
}

resource "aws_subnet" "public_subnet_2" {
  vpc_id                  = aws_vpc.manus_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true

  tags = {
    Name        = "manus-copilot-public-subnet-2"
    Environment = var.environment
  }
}

# Route Table
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.manus_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.manus_igw.id
  }

  tags = {
    Name        = "manus-copilot-public-rt"
    Environment = var.environment
  }
}

# Route Table Associations
resource "aws_route_table_association" "public_rta_1" {
  subnet_id      = aws_subnet.public_subnet_1.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "public_rta_2" {
  subnet_id      = aws_subnet.public_subnet_2.id
  route_table_id = aws_route_table.public_rt.id
}

# Security Group
resource "aws_security_group" "manus_sg" {
  name        = "manus-copilot-sg"
  description = "Security group for Manus Copilot Integration"
  vpc_id      = aws_vpc.manus_vpc.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Application Port"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "manus-copilot-sg"
    Environment = var.environment
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "manus_cluster" {
  name = "manus-copilot-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name        = "manus-copilot-cluster"
    Environment = var.environment
  }
}

# ECR Repository
resource "aws_ecr_repository" "manus_repo" {
  name                 = "manus-copilot-integration"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "manus-copilot-repo"
    Environment = var.environment
  }
}

# Application Load Balancer
resource "aws_lb" "manus_alb" {
  name               = "manus-copilot-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.manus_sg.id]
  subnets            = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]

  enable_deletion_protection = false

  tags = {
    Name        = "manus-copilot-alb"
    Environment = var.environment
  }
}

# Target Group
resource "aws_lb_target_group" "manus_tg" {
  name        = "manus-copilot-tg"
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = aws_vpc.manus_vpc.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 3
  }

  tags = {
    Name        = "manus-copilot-tg"
    Environment = var.environment
  }
}

# ALB Listener
resource "aws_lb_listener" "manus_listener" {
  load_balancer_arn = aws_lb.manus_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.manus_tg.arn
  }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "manus_logs" {
  name              = "/ecs/manus-copilot"
  retention_in_days = 7

  tags = {
    Name        = "manus-copilot-logs"
    Environment = var.environment
  }
}

# Outputs
output "alb_dns_name" {
  description = "DNS name of the load balancer"
  value       = aws_lb.manus_alb.dns_name
}

output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = aws_ecr_repository.manus_repo.repository_url
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.manus_cluster.name
}

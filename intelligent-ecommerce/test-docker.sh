#!/bin/bash

# Docker Test Script for Intelligent E-commerce
echo "🐳 Testing Docker setup for Intelligent E-commerce..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop."
    exit 1
fi

print_status "Docker is running"

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed"
    exit 1
fi

print_status "Docker Compose is available"

# Build images
echo "🔨 Building Docker images..."
if npm run docker:build; then
    print_status "Docker images built successfully"
else
    print_error "Failed to build Docker images"
    exit 1
fi

# Start services
echo "🚀 Starting services..."
if npm run docker:up; then
    print_status "Services started successfully"
else
    print_error "Failed to start services"
    exit 1
fi

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Test backend health
echo "🔍 Testing backend health..."
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    print_status "Backend is healthy"
else
    print_warning "Backend health check failed (this might be normal if still starting up)"
fi

# Test frontend
echo "🔍 Testing frontend..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_status "Frontend is accessible"
else
    print_warning "Frontend check failed (this might be normal if still starting up)"
fi

# Show running containers
echo "📋 Running containers:"
docker-compose ps

# Show logs
echo "📝 Recent logs:"
docker-compose logs --tail=10

echo ""
echo "🎉 Docker setup test completed!"
echo ""
echo "Access your application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:5000"
echo "  MongoDB: localhost:27017"
echo ""
echo "Useful commands:"
echo "  View logs: npm run docker:logs"
echo "  Stop services: npm run docker:down"
echo "  Restart: npm run docker:restart"
echo "  Clean up: npm run docker:clean"

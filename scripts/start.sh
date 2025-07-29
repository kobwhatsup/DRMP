#!/bin/bash

# DRMP Platform Start Script
# This script starts the entire platform using Docker Compose

set -e

echo "🚀 Starting DRMP Platform..."

# Function to print colored output
print_status() {
    echo -e "\033[32m[INFO]\033[0m $1"
}

print_error() {
    echo -e "\033[31m[ERROR]\033[0m $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found. Please run this script from the project root directory."
    exit 1
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p uploads logs docker/nginx/conf.d docker/mysql/init

# Start services
print_status "Starting services..."
docker-compose up -d

# Wait for services to be healthy
print_status "Waiting for services to start..."
sleep 30

# Check service status
print_status "Checking service status..."
docker-compose ps

echo ""
print_status "✅ DRMP Platform started successfully!"
print_status "🌐 Frontend: http://localhost:3000"
print_status "🔧 Backend API: http://localhost:8080/api"
print_status "📊 API Documentation: http://localhost:8080/api/swagger-ui.html"
print_status "🔑 Default admin credentials: admin / Admin@123456"
echo ""
print_status "Use 'docker-compose logs -f [service_name]' to view logs"
print_status "Use 'docker-compose stop' to stop all services"
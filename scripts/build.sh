#!/bin/bash

# DRMP Platform Build Script
# This script builds the entire platform including backend and frontend

set -e

echo "🚀 Building DRMP Platform..."

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

# Build backend
print_status "Building backend..."
cd backend
if [ -f "pom.xml" ]; then
    ./mvnw clean package -DskipTests
    print_status "Backend build completed successfully"
else
    print_error "pom.xml not found in backend directory"
    exit 1
fi
cd ..

# Build frontend
print_status "Building frontend..."
cd frontend
if [ -f "package.json" ]; then
    npm ci
    npm run build
    print_status "Frontend build completed successfully"
else
    print_error "package.json not found in frontend directory"
    exit 1
fi
cd ..

# Build Docker images
print_status "Building Docker images..."
docker-compose build

print_status "✅ DRMP Platform build completed successfully!"
print_status "Run 'docker-compose up -d' to start the platform"
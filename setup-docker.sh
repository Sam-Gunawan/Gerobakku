#!/bin/bash
# Setup script for Gerobakku Docker deployment

echo "========================================"
echo "  Gerobakku Docker Setup Script"
echo "========================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "[ERROR] Docker is not running!"
    echo "Please start Docker and try again."
    exit 1
fi

echo "[OK] Docker is running"
echo ""

# Check if .env file exists
if [ -f .env ]; then
    echo "[INFO] .env file already exists"
    read -p "Do you want to overwrite it with .env.example? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "[INFO] Creating .env file from .env.example..."
        cp .env.example .env
        echo "[OK] .env file created"
    else
        echo "[INFO] Keeping existing .env file"
    fi
else
    echo "[INFO] Creating .env file from .env.example..."
    cp .env.example .env
    echo "[OK] .env file created"
fi

echo ""
echo "========================================"
echo "  Building and starting containers..."
echo "========================================"
echo ""
echo "This may take a few minutes on first run..."
echo ""

docker-compose up --build

echo ""
echo "========================================"
echo "  Setup complete!"
echo "========================================"

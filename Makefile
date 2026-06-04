# Logistics Master Hub - Makefile

.PHONY: help install-all build-all start-ecoload start-yardexx clean

help:
	@echo "Logistics Master Hub - Command Center"
	@echo "--------------------------------------"
	@echo "Available commands:"
	@echo "  make start-ecoload  - Start the ECS Ecoload stack (Docker)"
	@echo "  make start-yardexx  - Start the YardExx platform (Docker)"
	@echo "  make install-all    - Install dependencies for all apps (npm)"
	@echo "  make build-all      - Build all apps and tools"
	@echo "  make clean          - Remove all build artifacts and node_modules"

start-ecoload:
	cd apps/ecoload && docker-compose up --build

start-yardexx:
	cd apps/yardexx && docker-compose up --build

install-all:
	@echo "Installing dependencies for all sub-projects..."
	find . -name "package.json" -not -path "*/node_modules/*" -execdir npm install \;

build-all:
	@echo "Building all projects..."
	# Add specific build commands here if needed

clean:
	@echo "Cleaning up all build artifacts and node_modules..."
	find . -name "node_modules" -type d -prune -exec rm -rf {} +
	find . -name "bin" -type d -prune -exec rm -rf {} +
	find . -name "obj" -type d -prune -exec rm -rf {} +
	find . -name "dist" -type d -prune -exec rm -rf {} +
	find . -name ".next" -type d -prune -exec rm -rf {} +

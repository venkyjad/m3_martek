# Backend Service

A Node.js Express application with MySQL and Qdrant vector database

## API Endpoints

### Health Check Endpoints

- `GET /health` - Overall system health
- `GET /health/api` - API service health
- `GET /health/mysql` - MySQL database health
- `GET /health/qdrant` - Qdrant vector database health
- `GET /health/ready` - Readiness probe (all services ready)
- `GET /health/live` - Liveness probe (service alive)

### Main Endpoints

- `GET /` - API information

## Quick Start

### Using Docker Compose (Recommended)

1. **Clone and navigate to the project:**
   ```bash
   cd /Users/venky/m3_slice/backend
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Check service status:**
   ```bash
   docker-compose ps
   ```

4. **View logs:**
   ```bash
   docker-compose logs -f app
   ```

5. **Test the API:**
   ```bash
   curl http://localhost:3000/health
   ```

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your local database settings
   ```

3. **Start MySQL and Qdrant (via Docker):**
   ```bash
   docker-compose up -d mysql qdrant
   ```

4. **Start the application:**
   ```bash
   npm run dev
   ```


## Docker Services

- **app**: Node.js Express application (port 3000)
- **mysql**: MySQL 8.0 database (port 3306)
- **qdrant**: Qdrant vector database (ports 6333, 6334)

## Development Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Rebuild application
docker-compose build app

```

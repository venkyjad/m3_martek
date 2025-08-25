# Docker Restart Policies - M3 Slice Backend

## Overview

Enhanced Docker Compose configurations with robust restart policies and resource management for production reliability.

## 🔄 Restart Policies Implemented

### All Services
- **Base Policy**: `restart: unless-stopped`
  - Containers restart automatically unless explicitly stopped
  - Survives Docker daemon restarts and system reboots

### Advanced Restart Policies (Deploy Section)
- **Condition**: `on-failure` - Only restart if container exits with non-zero code
- **Delay**: 5-10s between restart attempts
- **Max Attempts**: 3-5 attempts before giving up
- **Window**: 120s observation window for restart attempts

## 📊 Resource Limits

### MySQL Container
```yaml
resources:
  limits:
    memory: 1G
    cpus: '1.0'
  reservations:
    memory: 512M
    cpus: '0.5'
```

### Qdrant Container
```yaml
resources:
  limits:
    memory: 2G
    cpus: '2.0'
  reservations:
    memory: 512M
    cpus: '0.5'
```

### Node.js App Container
```yaml
resources:
  limits:
    memory: 1G
    cpus: '2.0'
  reservations:
    memory: 256M
    cpus: '0.25'
```

## 🏥 Health Checks

### MySQL
- **Test**: `mysqladmin ping -h localhost`
- **Interval**: 30s
- **Timeout**: 20s
- **Retries**: 5
- **Start Period**: 60s

### Qdrant
- **Status**: Disabled (container lacks curl/wget tools)
- **Fallback**: Relies on restart policies for failure recovery

### Node.js App
- **Test**: `curl -f http://localhost:3000/health/live`
- **Interval**: 30s
- **Timeout**: 10s
- **Retries**: 5
- **Start Period**: 60s

## 📝 Logging Configuration

All containers configured with:
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

This prevents logs from consuming excessive disk space.

## 🚀 Production Benefits

1. **Automatic Recovery**: Services restart on failure
2. **Resource Protection**: Memory/CPU limits prevent resource exhaustion
3. **Graceful Startup**: Health checks ensure services are ready before marking healthy
4. **Dependency Management**: Services start in correct order
5. **Log Management**: Prevents log files from filling disk space

## 🔧 Usage

### Production
```bash
docker compose up -d
```

### Development
```bash
docker compose -f docker-compose.dev.yml up -d
```

### Monitoring
```bash
# Check container status
docker compose ps

# Check restart count
docker compose logs app --tail=50

# Monitor resource usage
docker stats
```

## 🛡️ Failure Scenarios Handled

- **Container crashes**: Automatic restart with exponential backoff
- **Memory exhaustion**: Resource limits prevent system overload
- **Network issues**: Health checks detect and restart unhealthy services
- **Database connection loss**: App restarts and reconnects automatically
- **System reboot**: All services restart automatically

## ⚠️ Notes

- Restart policies are for container-level failures, not application logic errors
- Health checks should be monitored in production environments
- Resource limits may need adjustment based on actual usage patterns
- Consider implementing circuit breakers and retry logic in application code for additional resilience


# Docker Setup for Intelligent E-commerce

This document explains how to run the Intelligent E-commerce application using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose v3.8 or higher

## Quick Start

### Production Mode

1. **Build and start all services:**
   ```bash
   npm run docker:build
   npm run docker:up
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

3. **Stop all services:**
   ```bash
   npm run docker:down
   ```

### Development Mode

1. **Start development environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **View logs:**
   ```bash
   docker-compose -f docker-compose.dev.yml logs -f
   ```

3. **Stop development environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run docker:build` | Build all Docker images |
| `npm run docker:up` | Start all services in production mode |
| `npm run docker:down` | Stop all services |
| `npm run docker:logs` | View logs from all services |
| `npm run docker:restart` | Restart all services |
| `npm run docker:clean` | Remove all containers, volumes, and images |

## Services

### Backend (Port 5000)
- Node.js Express API
- MongoDB connection
- AI features (recommendations, price prediction, sentiment analysis)
- File upload support

### Frontend (Port 3000)
- React application served by Nginx
- Material-UI components
- Responsive design
- AI-powered features

### MongoDB (Port 27017)
- Database for products, users, and orders
- Persistent data storage
- Initialized with sample data

### Redis (Port 6379)
- Optional caching layer
- Session storage
- Rate limiting

## Environment Variables

Create a `.env` file in the root directory with:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://admin:password123@mongodb:27017/intelligent-ecommerce?authSource=admin
JWT_SECRET=your-super-secret-jwt-key
REACT_APP_API_URL=http://localhost:5000/api
```

## Database Initialization

The MongoDB container automatically:
- Creates the database and user
- Sets up indexes for optimal performance
- Seeds with sample data (if seed script is available)

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   - Ensure ports 3000, 5000, and 27017 are available
   - Change ports in docker-compose.yml if needed

2. **Permission issues:**
   - On Linux/Mac, ensure Docker has proper permissions
   - Run `sudo chown -R $USER:$USER .` if needed

3. **Build failures:**
   - Clear Docker cache: `docker system prune -a`
   - Rebuild without cache: `docker-compose build --no-cache`

4. **Database connection issues:**
   - Wait for MongoDB to fully initialize (30-60 seconds)
   - Check logs: `docker-compose logs mongodb`

### Useful Commands

```bash
# View service status
docker-compose ps

# View logs for specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Execute commands in running container
docker-compose exec backend bash
docker-compose exec frontend sh

# Rebuild specific service
docker-compose build backend
docker-compose up -d backend

# View resource usage
docker stats

# Clean up everything
docker-compose down -v --rmi all
docker system prune -a
```

## Production Deployment

For production deployment:

1. Update environment variables
2. Use proper secrets management
3. Configure reverse proxy (Nginx/Traefik)
4. Set up SSL certificates
5. Configure monitoring and logging
6. Use external database services

## Security Notes

- Change default passwords in production
- Use proper JWT secrets
- Configure firewall rules
- Enable SSL/TLS
- Regular security updates
- Monitor container logs

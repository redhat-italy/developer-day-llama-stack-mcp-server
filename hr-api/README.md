# HR Enterprise API

A comprehensive REST API for managing HR operations including employee data, vacation management, job postings, and performance reviews.

## Features

- **Employee Management**: Complete CRUD operations for employee records
- **Vacation Management**: Vacation requests, approvals, and balance tracking
- **Job Management**: Job postings, applications, and hiring workflow
- **Performance Management**: Performance reviews, development plans, and analytics
- **Security**: Rate limiting, CORS, input validation, and security headers
- **Documentation**: Interactive Swagger/OpenAPI documentation
- **Monitoring**: Health checks, readiness probes, and metrics endpoints

## API Endpoints

### Core Endpoints
- `GET /health` - Health check
- `GET /ready` - Readiness probe
- `GET /api-docs` - API documentation

### Employee Management
- `GET /api/v1/employees` - List all employees
- `GET /api/v1/employees/{id}` - Get employee by ID
- `POST /api/v1/employees` - Create new employee
- `PUT /api/v1/employees/{id}` - Update employee
- `DELETE /api/v1/employees/{id}` - Delete employee

### Vacation Management
- `GET /api/v1/vacations` - List vacation requests
- `GET /api/v1/vacations/{id}` - Get vacation request by ID
- `POST /api/v1/vacations` - Create vacation request
- `PUT /api/v1/vacations/{id}/approve` - Approve vacation request
- `PUT /api/v1/vacations/{id}/reject` - Reject vacation request
- `GET /api/v1/vacations/balance/{employeeId}` - Get vacation balance

### Job Management
- `GET /api/v1/jobs` - List job postings
- `GET /api/v1/jobs/{id}` - Get job by ID
- `POST /api/v1/jobs` - Create job posting
- `PUT /api/v1/jobs/{id}` - Update job posting
- `GET /api/v1/jobs/{id}/applications` - Get job applications
- `POST /api/v1/jobs/{id}/applications` - Submit job application

### Performance Management
- `GET /api/v1/performance/reviews` - List performance reviews
- `GET /api/v1/performance/reviews/{id}` - Get review by ID
- `POST /api/v1/performance/reviews` - Create performance review
- `PUT /api/v1/performance/reviews/{id}` - Update performance review
- `GET /api/v1/performance/development-plans` - List development plans
- `POST /api/v1/performance/development-plans` - Create development plan
- `GET /api/v1/performance/analytics` - Get performance analytics

## Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Install dependencies (this will generate package-lock.json if missing)
npm install

# For production builds, use:
npm ci --omit=dev
```

### Running Locally
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### Environment Variables
Copy `.env.example` to `.env` and configure as needed:

```bash
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=*
ENABLE_SWAGGER=true
ENABLE_RATE_LIMITING=true
```

## Container Deployment

### Build Container Image

**Note**: Ensure you have run `npm install` locally first to generate `package-lock.json` for reproducible builds.

Build for single architecture:
```bash
podman build -t hr-enterprise-api:latest .
```

Build for multiple architectures (recommended for production):
```bash
# Create and use a buildx builder for multi-arch support
podman build --platform=linux/amd64,linux/arm64 -t hr-enterprise-api:latest .

# Or build specific architecture
podman build --platform=linux/amd64 -t hr-enterprise-api:amd64 .
podman build --platform=linux/arm64 -t hr-enterprise-api:arm64 .

# For pushing multi-arch images to registry
podman manifest create hr-enterprise-api:latest
podman build --platform=linux/amd64 -t hr-enterprise-api:amd64 .
podman build --platform=linux/arm64 -t hr-enterprise-api:arm64 .
podman manifest add hr-enterprise-api:latest hr-enterprise-api:amd64
podman manifest add hr-enterprise-api:latest hr-enterprise-api:arm64
podman manifest push hr-enterprise-api:latest quay.io/your-org/hr-enterprise-api:latest
```

### Run Container
```bash
podman run -p 3000:3000 -e NODE_ENV=production hr-enterprise-api:latest
```

## OpenShift Deployment

### Using Helm Chart

1. **Install the Helm chart:**
```bash
helm install hr-api ./helm \
  --set image.repository=quay.io/your-org/hr-enterprise-api \
  --set image.tag=1.0.0 \
  --set route.host=hr-api.apps.your-cluster.com
```

2. **Update deployment:**
```bash
helm upgrade hr-api ./helm \
  --set image.tag=1.1.0
```

3. **Uninstall:**
```bash
helm uninstall hr-api
```

### Configuration Options

The Helm chart supports extensive configuration through `values.yaml`:

- **Scaling**: Configure replicas, HPA, and resource limits
- **Security**: Pod security contexts, network policies, RBAC
- **Storage**: Persistent volumes for data storage
- **Monitoring**: ServiceMonitor for Prometheus integration
- **Database**: External database configuration
- **Networking**: Routes, ingress, and service configuration

### Example Production Values

```yaml
# values-production.yaml
replicaCount: 3

image:
  repository: quay.io/company/hr-enterprise-api
  tag: "1.0.0"

resources:
  limits:
    cpu: 1000m
    memory: 1Gi
  requests:
    cpu: 500m
    memory: 512Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 20
  targetCPUUtilizationPercentage: 70

route:
  enabled: true
  host: hr-api.company.com
  tls:
    enabled: true

database:
  enabled: true
  host: postgres.company.com
  name: hr_production

secret:
  enabled: true
  data:
    database-password: "secure-password"
    api-key: "production-api-key"
```

Deploy with production values:
```bash
helm install hr-api ./helm -f values-production.yaml
```

## Security Considerations

- **Authentication**: Implement proper authentication before production use
- **Database**: Use encrypted connections and proper access controls
- **Secrets**: Store sensitive data in Kubernetes secrets
- **Network**: Use network policies to restrict traffic
- **RBAC**: Configure appropriate service account permissions
- **TLS**: Enable TLS termination at the route level

## Monitoring and Observability

- **Health Checks**: Built-in liveness and readiness probes
- **Metrics**: Application metrics endpoint (can be extended for Prometheus)
- **Logging**: Structured logging with configurable levels
- **Tracing**: Ready for distributed tracing integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
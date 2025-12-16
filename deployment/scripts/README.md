# Deployment Scripts

Collection of shell scripts for managing Consultor.AI deployments.

## Prerequisites

- `bash` shell
- `docker` (for build scripts)
- `kubectl` (for Kubernetes scripts)
- Proper cluster access configured

## Quick Start

```bash
# Make scripts executable
chmod +x deployment/scripts/*.sh

# Build and push Docker image
./deployment/scripts/build-and-push.sh v1.0.0

# Deploy to Kubernetes
./deployment/scripts/deploy-k8s.sh

# Check status
./deployment/scripts/status.sh
```

## Scripts

### 1. build-and-push.sh

Builds and pushes Docker image to registry.

**Usage:**
```bash
# Build with version tag
./deployment/scripts/build-and-push.sh v1.0.0

# Build with latest tag (default)
./deployment/scripts/build-and-push.sh

# Custom registry
DOCKER_REGISTRY=myregistry.io ./deployment/scripts/build-and-push.sh v1.0.0
```

**Environment Variables:**
- `DOCKER_REGISTRY` - Container registry URL (default: `your-registry.io`)
- `IMAGE_NAME` - Image name (default: `consultorai`)

**What it does:**
1. Checks if Docker is running
2. Builds production image with multi-stage Dockerfile
3. Tags image with version and `latest`
4. Asks for confirmation before pushing
5. Pushes to registry

### 2. deploy-k8s.sh

Deploys application to Kubernetes cluster.

**Usage:**
```bash
# Deploy to default namespace (consultorai)
./deployment/scripts/deploy-k8s.sh

# Deploy to custom namespace
NAMESPACE=production ./deployment/scripts/deploy-k8s.sh
```

**Environment Variables:**
- `NAMESPACE` - Kubernetes namespace (default: `consultorai`)

**What it does:**
1. Checks cluster connectivity
2. Verifies secrets exist
3. Applies manifests in correct order
4. Waits for deployments to be ready
5. Shows deployment status

**Prerequisites:**
- Kubernetes cluster configured
- Secrets created (see kubernetes/README.md)
- kubectl configured

### 3. status.sh

Displays comprehensive deployment status.

**Usage:**
```bash
# Check status in default namespace
./deployment/scripts/status.sh

# Check status in custom namespace
NAMESPACE=production ./deployment/scripts/status.sh
```

**Shows:**
- Pods status and resource usage
- Deployments
- Services
- Ingress
- HPA (Horizontal Pod Autoscaler)
- PVC (Persistent Volume Claims)
- Recent events
- Health check summary

### 4. update.sh

Updates deployment with new image version.

**Usage:**
```bash
# Update to specific version
./deployment/scripts/update.sh your-registry/consultorai:v2.0.0

# Update to latest
./deployment/scripts/update.sh your-registry/consultorai:latest
```

**What it does:**
1. Shows current image version
2. Asks for confirmation
3. Performs rolling update
4. Waits for rollout to complete
5. Shows new pods status
6. Displays rollout history

**Rolling Update:**
- Zero downtime
- Gradual pod replacement
- Automatic rollback on failure

### 5. rollback.sh

Rolls back deployment to previous version.

**Usage:**
```bash
# Rollback to previous revision
./deployment/scripts/rollback.sh

# Rollback to specific revision
./deployment/scripts/rollback.sh consultorai-app 3

# Check rollout history first
kubectl rollout history deployment/consultorai-app -n consultorai
```

**Arguments:**
1. Deployment name (default: `consultorai-app`)
2. Revision number (optional, defaults to previous)

**What it does:**
1. Shows rollout history
2. Asks for confirmation
3. Performs rollback
4. Waits for completion
5. Shows new status

### 6. logs.sh

Views application logs.

**Usage:**
```bash
# Follow logs in real-time
./deployment/scripts/logs.sh

# Follow logs from specific deployment
./deployment/scripts/logs.sh consultorai-redis

# Show last 100 lines (no follow)
./deployment/scripts/logs.sh consultorai-app 100

# Show last 50 lines
./deployment/scripts/logs.sh consultorai-app 50
```

**Arguments:**
1. Deployment name (default: `consultorai-app`)
2. Lines or `-f` to follow (default: `-f`)

**Tips:**
- Press `Ctrl+C` to exit
- Logs from all containers in pod
- Use for debugging and monitoring

### 7. cleanup.sh

**⚠️ DANGER: Completely removes deployment**

Deletes entire namespace including all data.

**Usage:**
```bash
# Cleanup default namespace
./deployment/scripts/cleanup.sh

# Cleanup custom namespace
NAMESPACE=staging ./deployment/scripts/cleanup.sh
```

**What it deletes:**
- All pods
- All services
- All deployments
- All PVCs (persistent data)
- The namespace itself

**⚠️ WARNING:**
- This is irreversible
- All data will be lost
- Requires typing "DELETE" and "yes" to confirm

## Common Workflows

### Initial Deployment

```bash
# 1. Build and push image
./deployment/scripts/build-and-push.sh v1.0.0

# 2. Create secrets (one-time)
kubectl create secret generic consultorai-secrets \
  --from-literal=NEXT_PUBLIC_SUPABASE_URL=... \
  --namespace=consultorai

# 3. Deploy
./deployment/scripts/deploy-k8s.sh

# 4. Check status
./deployment/scripts/status.sh

# 5. View logs
./deployment/scripts/logs.sh
```

### Update to New Version

```bash
# 1. Build new version
./deployment/scripts/build-and-push.sh v1.1.0

# 2. Update deployment
./deployment/scripts/update.sh your-registry/consultorai:v1.1.0

# 3. Monitor rollout
./deployment/scripts/status.sh

# 4. Check logs
./deployment/scripts/logs.sh
```

### Rollback After Bad Deploy

```bash
# 1. Check what went wrong
./deployment/scripts/logs.sh

# 2. View rollout history
kubectl rollout history deployment/consultorai-app -n consultorai

# 3. Rollback
./deployment/scripts/rollback.sh

# 4. Verify
./deployment/scripts/status.sh
```

### Debugging Issues

```bash
# Check overall status
./deployment/scripts/status.sh

# View live logs
./deployment/scripts/logs.sh

# Check specific pod
kubectl describe pod <pod-name> -n consultorai

# Get shell in pod
kubectl exec -it <pod-name> -n consultorai -- /bin/sh

# Check events
kubectl get events -n consultorai --sort-by='.lastTimestamp'
```

### Scale Deployment

```bash
# Manual scaling
kubectl scale deployment consultorai-app --replicas=5 -n consultorai

# Check HPA status
kubectl get hpa -n consultorai

# Edit HPA
kubectl edit hpa consultorai-app-hpa -n consultorai
```

## Environment Variables

All scripts support these environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `NAMESPACE` | `consultorai` | Kubernetes namespace |
| `DOCKER_REGISTRY` | `your-registry.io` | Container registry |
| `IMAGE_NAME` | `consultorai` | Image name |

**Examples:**

```bash
# Deploy to staging
NAMESPACE=staging ./deployment/scripts/deploy-k8s.sh

# Use different registry
DOCKER_REGISTRY=gcr.io/my-project ./deployment/scripts/build-and-push.sh

# Combined
NAMESPACE=production \
DOCKER_REGISTRY=myregistry.io \
./deployment/scripts/deploy-k8s.sh
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Deploy to Kubernetes

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build and push
        env:
          DOCKER_REGISTRY: ${{ secrets.DOCKER_REGISTRY }}
        run: ./deployment/scripts/build-and-push.sh ${GITHUB_REF#refs/tags/}

      - name: Deploy
        env:
          KUBECONFIG: ${{ secrets.KUBECONFIG }}
        run: ./deployment/scripts/deploy-k8s.sh
```

### GitLab CI

```yaml
deploy:
  stage: deploy
  script:
    - ./deployment/scripts/build-and-push.sh $CI_COMMIT_TAG
    - ./deployment/scripts/deploy-k8s.sh
  only:
    - tags
```

## Troubleshooting

### "kubectl: command not found"

Install kubectl:
```bash
# macOS
brew install kubectl

# Linux
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
```

### "Cannot connect to cluster"

Configure kubectl:
```bash
# Check current context
kubectl config current-context

# List contexts
kubectl config get-contexts

# Switch context
kubectl config use-context my-cluster
```

### "Permission denied"

Make scripts executable:
```bash
chmod +x deployment/scripts/*.sh
```

### "Secrets not found"

Create secrets first:
```bash
# See deployment/kubernetes/README.md for details
kubectl create secret generic consultorai-secrets \
  --from-literal=NEXT_PUBLIC_SUPABASE_URL=... \
  --namespace=consultorai
```

## Best Practices

1. **Always test in staging first**
   ```bash
   NAMESPACE=staging ./deployment/scripts/deploy-k8s.sh
   ```

2. **Use version tags, not `latest`**
   ```bash
   ./deployment/scripts/build-and-push.sh v1.0.0
   ```

3. **Monitor rollouts**
   ```bash
   # In another terminal
   watch -n 2 ./deployment/scripts/status.sh
   ```

4. **Keep rollout history**
   ```bash
   kubectl rollout history deployment/consultorai-app -n consultorai
   ```

5. **Check logs after deployment**
   ```bash
   ./deployment/scripts/logs.sh
   ```

## Security Notes

- Never commit secrets to git
- Use secret management tools in production
- Rotate credentials regularly
- Use RBAC to limit access
- Enable audit logging

## Support

For issues:
1. Check logs: `./deployment/scripts/logs.sh`
2. Check status: `./deployment/scripts/status.sh`
3. View events: `kubectl get events -n consultorai`
4. Describe resources: `kubectl describe pod <name> -n consultorai`

# Kubernetes Deployment

This directory contains Kubernetes manifests for deploying Consultor.AI to a Kubernetes cluster.

## Prerequisites

- Kubernetes cluster (v1.25+)
- `kubectl` configured to access your cluster
- NGINX Ingress Controller
- cert-manager (for TLS certificates)
- Docker image built and pushed to registry

## Quick Start

### 1. Build and Push Docker Image

```bash
# Build production image
docker build -t your-registry/consultorai:latest -f Dockerfile .

# Push to registry
docker push your-registry/consultorai:latest
```

### 2. Update Image Reference

Edit `05-app-deployment.yaml` and replace `consultorai/app:latest` with your actual image.

### 3. Create Secrets

**Option A: Using kubectl**

```bash
kubectl create secret generic consultorai-secrets \
  --from-literal=NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
  --from-literal=NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key \
  --from-literal=SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
  --from-literal=GOOGLE_AI_API_KEY=your-google-ai-key \
  --from-literal=NEXT_PUBLIC_META_APP_ID=your-meta-app-id \
  --from-literal=META_APP_SECRET=your-meta-app-secret \
  --from-literal=META_APP_ACCESS_TOKEN=your-meta-access-token \
  --from-literal=NEXT_PUBLIC_META_CONFIG_ID=your-meta-config-id \
  --from-literal=META_WEBHOOK_VERIFY_TOKEN=your-webhook-verify-token \
  --from-literal=ENCRYPTION_KEY=your-32-char-encryption-key \
  --from-literal=REDIS_PASSWORD=your-redis-password \
  --namespace=consultorai
```

**Option B: Using secret management (recommended for production)**

Use tools like:
- [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets)
- [External Secrets Operator](https://external-secrets.io/)
- [HashiCorp Vault](https://www.vaultproject.io/)

### 4. Update ConfigMap

Edit `01-configmap.yaml` and update values like `NEXT_PUBLIC_APP_URL`.

### 5. Deploy

```bash
# Apply all manifests in order
kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-configmap.yaml
kubectl apply -f 02-secret.yaml
kubectl apply -f 03-redis-pvc.yaml
kubectl apply -f 04-redis-deployment.yaml
kubectl apply -f 05-app-deployment.yaml
kubectl apply -f 06-ingress.yaml
kubectl apply -f 07-hpa.yaml
kubectl apply -f 08-network-policy.yaml

# Or apply all at once
kubectl apply -f .
```

### 6. Verify Deployment

```bash
# Check pods
kubectl get pods -n consultorai

# Check services
kubectl get svc -n consultorai

# Check ingress
kubectl get ingress -n consultorai

# View logs
kubectl logs -f deployment/consultorai-app -n consultorai
```

## Architecture

```
┌─────────────────────────────────────────────┐
│              Internet                        │
└────────────────┬────────────────────────────┘
                 │
         ┌───────▼────────┐
         │  Ingress       │
         │  (NGINX)       │
         └───────┬────────┘
                 │
         ┌───────▼────────┐
         │  Service       │
         │  (ClusterIP)   │
         └───────┬────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
┌───▼────┐  ┌────────┐  ┌────────┐
│  Pod   │  │  Pod   │  │  Pod   │
│  App   │  │  App   │  │  App   │
└───┬────┘  └───┬────┘  └───┬────┘
    │           │           │
    └───────────┴───────────┘
                │
         ┌──────▼───────┐
         │   Redis      │
         │   Service    │
         └──────┬───────┘
                │
         ┌──────▼───────┐
         │   Redis      │
         │     Pod      │
         │   + PVC      │
         └──────────────┘
```

## Components

### Namespace (00-namespace.yaml)
- Creates isolated namespace `consultorai`

### ConfigMap (01-configmap.yaml)
- Non-sensitive configuration
- Environment variables like `NODE_ENV`, `GOOGLE_AI_MODEL`

### Secret (02-secret.yaml)
- Sensitive data (API keys, passwords)
- **Important:** Never commit real secrets to git

### Redis (03-04)
- PersistentVolumeClaim for data persistence
- Deployment with password authentication
- ClusterIP Service

### Application (05-app-deployment.yaml)
- Next.js app deployment (3 replicas)
- Health checks (liveness + readiness)
- Resource limits
- Init container waits for Redis

### Ingress (06-ingress.yaml)
- NGINX Ingress Controller
- TLS with Let's Encrypt (cert-manager)
- Rate limiting
- Supports `consultor.ai` and `www.consultor.ai`

### HPA (07-hpa.yaml)
- Auto-scales based on CPU/Memory
- Min: 3 replicas
- Max: 10 replicas

### Network Policy (08-network-policy.yaml)
- Restricts pod-to-pod communication
- App can only access Redis and external HTTPS
- Redis only accepts traffic from app

## Required Add-ons

### NGINX Ingress Controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

### cert-manager (for TLS)

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

### Metrics Server (for HPA)

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

## Monitoring

### View Logs

```bash
# App logs
kubectl logs -f deployment/consultorai-app -n consultorai

# Redis logs
kubectl logs -f deployment/consultorai-redis -n consultorai

# All pods
kubectl logs -f -l app=consultorai-app -n consultorai
```

### Check Resource Usage

```bash
# CPU and memory
kubectl top pods -n consultorai

# HPA status
kubectl get hpa -n consultorai
```

### Describe Resources

```bash
kubectl describe deployment consultorai-app -n consultorai
kubectl describe pod <pod-name> -n consultorai
```

## Scaling

### Manual Scaling

```bash
# Scale to 5 replicas
kubectl scale deployment consultorai-app --replicas=5 -n consultorai
```

### Auto-scaling

HPA will automatically scale between 3-10 replicas based on CPU/Memory.

## Updating

### Rolling Update

```bash
# Update image
kubectl set image deployment/consultorai-app app=your-registry/consultorai:v2.0.0 -n consultorai

# Check rollout status
kubectl rollout status deployment/consultorai-app -n consultorai
```

### Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/consultorai-app -n consultorai

# Rollback to specific revision
kubectl rollout undo deployment/consultorai-app --to-revision=2 -n consultorai
```

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl get pods -n consultorai

# Describe pod
kubectl describe pod <pod-name> -n consultorai

# Check events
kubectl get events -n consultorai --sort-by='.lastTimestamp'
```

### Service Not Accessible

```bash
# Test service internally
kubectl run -it --rm debug --image=busybox --restart=Never -n consultorai -- wget -O- http://consultorai-app

# Check endpoints
kubectl get endpoints -n consultorai
```

### Certificate Issues

```bash
# Check certificate
kubectl describe certificate consultorai-tls -n consultorai

# Check cert-manager logs
kubectl logs -f deployment/cert-manager -n cert-manager
```

## Security Best Practices

1. **Never commit secrets** - Use secret management tools
2. **Enable Network Policies** - Restrict pod communication
3. **Use RBAC** - Limit access to Kubernetes resources
4. **Scan images** - Use tools like Trivy or Snyk
5. **Keep updated** - Regularly update Kubernetes and images
6. **Use non-root containers** - Already configured in Dockerfile
7. **Resource limits** - Prevent resource exhaustion
8. **TLS everywhere** - Force HTTPS with cert-manager

## Production Checklist

- [ ] Secrets created via secret management tool
- [ ] ConfigMap updated with production values
- [ ] Docker image pushed to private registry
- [ ] Domain DNS pointing to cluster LoadBalancer
- [ ] cert-manager ClusterIssuer email updated
- [ ] Resource limits reviewed and adjusted
- [ ] HPA thresholds configured for traffic patterns
- [ ] Monitoring and alerting configured
- [ ] Backup strategy for Redis data
- [ ] Network policies reviewed
- [ ] RBAC policies configured

## Clean Up

```bash
# Delete all resources
kubectl delete namespace consultorai

# Or delete individually
kubectl delete -f .
```

## Cost Optimization

### For Small Deployments

Reduce replicas and resources:

```yaml
# In 05-app-deployment.yaml
spec:
  replicas: 2  # Instead of 3

  resources:
    requests:
      memory: "128Mi"  # Instead of 256Mi
      cpu: "100m"      # Instead of 200m
```

### For Large Deployments

Consider:
- Node autoscaling
- Cluster autoscaler
- Spot/preemptible instances for non-critical workloads
- CDN for static assets

## Support

For issues or questions:
- Check logs: `kubectl logs -f deployment/consultorai-app -n consultorai`
- Review events: `kubectl get events -n consultorai`
- Consult Kubernetes docs: https://kubernetes.io/docs/

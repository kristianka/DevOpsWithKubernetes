## Commands

Remember to turn off GCLOUD when not using!

### GKE Deployment

#### All-in-one command for GKE updates

- `docker build -t gcr.io/dwk-gke-484423/ping-pong:latest . && docker push gcr.io/dwk-gke-484423/ping-pong:latest && kubectl rollout restart deployment ping-pong-dep -n exercises`

### Local K3D Development

### All-in-one command to restart

- `docker build --pull -t ping-pong . && docker tag ping-pong:latest k3d-registry.localhost:5000/ping-pong:latest && docker push k3d-registry.localhost:5000/ping-pong:latest && kubectl apply -k manifests/` (updated 5.7 - Knative with local registry)

### Troubleshooting

- Dep missing: apply manifests `kubectl apply -f manifests/`

### Exercise 1.9

- `docker build --pull -t ping-pong . && k3d image import ping-pong`
- `kubectl apply -f manifests/`
- `cd .. cd .\log_output\`
- `kubectl apply -f manifests/`
- http://localhost:8082/pingpong

### Exercuse 1.11

- See `log_output` folder

### Exercise 2.3

- See `log_output` folder

### Exercise 2.7

![alt text](2.7.png)

### Exercise 3.1

![alt text](3.1.png)

### Exercuse 4.3

- `helm install prometheus-community/kube-prometheus-stack --generate-name --namespace prometheus`
- `kubectl -n prometheus port-forward prometheus-kube-prometheus-stack-1714-prometheus-0 9090:9090`
- In Prometheus `count by (pod) (kube_pod_info{namespace="prometheus", created_by_kind="StatefulSet"})`

### Exercise 4.4

- `kubectl create namespace argo-rollouts`
- `kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml`

### Exercise 5.7

- We need to create registy and push the image to it:

```bash
k3d registry create registry.localhost --port 5000
docker network connect k3d-k3s-default k3d-registry.localhost
docker tag ping-pong:latest k3d-registry.localhost:5000/ping-pong:latest
docker push k3d-registry.localhost:5000/ping-pong:latest
```

- Get SVC `kubectl get ksvc -n exercises`
- Access via port-forward: `kubectl port-forward -n kourier-system svc/kourier 8081:80`
- Then: `curl -H "Host: ping-pong.exercises.172.20.0.3.sslip.io" http://localhost:8081/pongs`

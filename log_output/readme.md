## Commands to run

- `docker build . -t log-output`
- `k3d cluster create --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 2`
- `k3d image import log-output`
- `kubectl create deployment log-output --image=log-output`

### Edit to allow local images

- `kubectl edit deployment log-output`
- Change `imagePullPolicy` to `IfNotPresent`
- Save, then restart pod with `kubectl rollout restart deployment/log-output`


## Commands

### Exercise 1.7

- `docker build --pull -t log-output . && k3d image import log-output`
- `kubectl apply -f manifests`
- View the app in http://localhost:8081/


### Exercise 1.10

- If k3d breaks, just delete all the Docker containers and fully restart Docker
- Make sure you change new pod's `imagePullPolicy` (check `kubectl get pods`)
- Same steps as above


### Exercise 1.11

- `docker exec k3d-k3s-default-agent-0 mkdir -p /tmp/kube`
- Pretty much as same steps above, just for `ping_pong` app too
- (Started taking screenshots from this point on)

![alt text](image.png)

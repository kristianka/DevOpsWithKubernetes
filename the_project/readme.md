## Tech

### Why Bun?

Testing new technologies! Originally tried Deno, but couldn't get env values working. Bun seems to be pretty popular: 78.9k stars [on GitHub](https://github.com/oven-sh/bun)!


## Setup

### Bun

- https://bun.sh/
- Make sure to open this folder specifically with vs code, otherwise tsconfig won't load properly and will show errors


### Kubernetes

- Init k3d and kubectl with the steps in `log_output` folder
- `docker build --pull -t todo-server .`
- `k3d image import todo-server`
- `kubectl create deployment todo-server --image=todo-server`





## Commands

### Exercise 1.6

- `k3d cluster delete`
- `docker build --pull -t todo-server . && k3d image import todo-server`
- `k3d cluster create --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 2`
- `kubectl apply -f manifests/deployment.yaml`
- `kubectl apply -f .\manifests\service.yaml`
- http://localhost:8082/
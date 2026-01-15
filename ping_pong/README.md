## Commands

### All-in-one command to restart

- `docker build --pull -t ping-pong . && k3d image import ping-pong && kubectl rollout restart deployment ping-pong-dep -n exercises`

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

## Commands to run

- `docker build . -t log-output`
- `k3d cluster create -a 2`
- `k3d image import log-output`
- `kubectl create deployment log-output --image=log-output`

### Edit to allow local images

- `kubectl edit deployment log-output`
- Change `imagePullPolicy` to `IfNotPresent`
- Save, then restart pod with `kubectl rollout restart deployment/log-output`

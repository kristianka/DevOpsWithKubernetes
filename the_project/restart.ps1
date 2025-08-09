# ps script for easier restarts during dev
# make sure you are in the_project folder

docker build --pull -t todo-server .

k3d image import todo-server

kubectl rollout restart deployment/todo-server-dep
kubectl apply -f manifests/


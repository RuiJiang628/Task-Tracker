cd server
docker build -t cs590-final-group-5-server .
cd ../ui
docker build -t cs590-final-group-5-ui .
cd ../server
npm run setup
cd ..
kubectl delete -f k8s/
kubectl create -f k8s/
# kubectl apply -f k8s/
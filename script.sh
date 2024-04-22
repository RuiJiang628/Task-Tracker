cd server && docker build -t cs590-final-group-5-server . && cd .. && cd ui && docker build -t cs590-final-group-5-ui . && cd .. && kubectl delete -f k8s/ && kubectl create -f k8s/


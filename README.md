# CS590 Final Project Group 5

## Build Docker images

**NOTE**: Kubernetes does *not* build Docker images for you. Before deploying for the first time, or if you make any changes to your code, you *must* (re-)run the commands below to regenerate the images, and then re-deploy to Kubernetes.

## Server
```bash
cd server && docker build -t cs590-final-group-5-server . && cd ..
```

## UI (NGINX)
```bash
cd ui && docker build -t cs590-final-group-5-ui . && cd ..
```

# Deploy on Kubernetes

```bash
kubectl create -f k8s/
```

# Undeploy

Undeploy before re-deploying if you make a change to the app. Also remember to rebuild Docker images per the instructions earlier in this README.

```bash
kubectl delete -f k8s/
```
Also manually delete containers/images from Docker

# Do one-time Mongo setup

**IMPORTANT:** Ensure that there is only one mongo-related container in Docker (excluding containers marked with POD). I.e. the only container with mongo-related title is `k8s_mong-db-xxxxx`.   
In one terminal:
```bash
kubectl port-forward service/db 27017:27017
```
Compass uses `mongodb://127.0.0.1:27017`

In another terminal:

```bash
cd server && npm install && npm run setup
```
Now access webpage at:
`http://127.0.0.1:31000/`

# For ci/cd:
- If failed on gitlab due to not recognize docker/kubectl, rerun job manually
- If still being inconsistent: use `gitlab-runner exec shell [job name]`
- Mac uses zshell, Git uses bash shell. `echo "export PATH=/opt/homebrew/bin:$PATH" >> ~/.bash_profile` sets up homebrew on bash besides the default zshell (Gitlab doesn't have zshell runners)
- Also uncheck instance runners on Gitlab project settings because the department instance runners won't have docker/your containers

# Playwright tests

```bash
cd .. && npm install && npx playwright test --headed --project=webkit
```
To debug / see seelctors: PWDEBUG=1 npx playwright test and click record for suggested code

# Disable security for testing
New env variable in server-deployment.yaml. To toggle security setting, set this to "true" or false.
```bash
        env:
        - name: MONGO_URL
          value: mongodb://db
        - name: DISABLE_SECURITY # Toggle Security
          value: "foo-bar-baz"
```
If true, username and roles are set in your URL.

Example:
http://127.0.0.1:31000/api/login?key=foo-bar-baz&user=wl275&role=user OR
http://127.0.0.1:31000/api/login?key=foo-bar-baz&user=rj153&role=admin
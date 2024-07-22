# Steps to run the application in development mode

- Build and run docker-compose file to run the application:

    docker compose up --build

# Steps to run the application in production mode

- Build and run docker-compose file to run the application:

    docker compose -f docker-compose.prod.yml --profile migrate up

# Steps to run the tests:

- First, do exactly steps in the steps to run the application

- Then, run: docker compose run --rm --entrypoint=npx e2e-playwright playwright test 

# Steps to use Kubernetes to run and monitor the application

## Steps to run the application

### Set up the database
    Start minikube:
    - Run: minikube start

    Firstly, install a PostgreSQL operator, here we use CloudNativePG:
    - Run: kubectl apply -f https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-1.19/releases/cnpg-1.19.1.yaml

    Secondly, deploy a cluster:
    - Run: kubectl apply -f kubernetes/tung-app-database-cluster.yaml
    - Run: kubectl get cluster to check the condition, if it display 2/2 and the db is in healthy condition then move on to next step

    Thirdly, go to flyway directory to build image for flyway:
    - Run: minikube image build -t tung-app-database-migrations -f ./Dockerfile .

    Then, run this to migrate the database:
    - Run: kubectl apply -f kubernetes/tung-app-database-migration-job.yaml 
    - Run: kubectl get job to check the status, if completions 1/1 then move on to next step, if you wait for too long but it's still 0/1, 
    run kubectl delete job tung-app-database-migration-job then run the first step again

    Next, Run this to check the connection with the cluster:
    - kubectl cnpg psql tung-app-database-cluster
    - \c app
    - \dt => if you see all tables there then the database migration is done

### Set up the application
    Run this in qa-ui directory:
    - minikube image build -t tung-qa-ui -f ./Dockerfile .

    Then, run this in qa-api directory:
    - minikube image build -t tung-qa-api -f ./Dockerfile .

    Run this in llm-api directory:
    - minikube image build -t tung-llm-api -f ./Dockerfile .

### Run the deployments and services:
    - kubectl apply -f kubernetes/tung-app-deployment.yaml 
    - kubectl apply -f kubernetes/tung-app-service.yaml 

### Run the autoscaling configuration:
    - kubectl apply -f kubernetes/tung-app-ui-deployment-hpa.yaml
    - kubectl apply -f kubernetes/tung-app-api-deployment-hpa.yaml
    - kubectl apply -f kubernetes/tung-app-llm-deployment-hpa.yaml

### Run the nginx ingress:
    - Run: kubectl apply -f kubernetes/tung-nginx-ingress.yaml

### Expose the services and ingress:
    - Run: minikube tunnel

### Access the application:
    - Add the following line to the file /etc/hosts:
        + <INGRESS_CONTROLLER_PUBLIC_IP> tung-app.minikube (If you use Macbook then type sudo nano /etc/hosts and add this line then save)
        + The tutorial link is here: https://docs.nginx.com/mesh/tutorials/kic/ingress-walkthrough/

    - Open http://tung-app.minikube in your browser, wait for a little bit and it will open my application.

## Steps to monitor the application with Prometheus and Grafana:

    - Deploy the Prometheus Operator: 
        + Run: kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/main/bundle.yaml, If you run into the error The CustomResourceDefinition "prometheuses.monitoring.coreos.com" is invalid: metadata.annotations: Too long: must have at most 262144 bytes, you have to delete the old deployment and run this: kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/main/bundle.yaml --force-conflicts=true --server-side=true

    - Install role-based access control:
        + Run: kubectl apply -f kubernetes/prometheus_rbac.yaml

    - Create a prometheus instance: 
        + Run: kubectl apply -f kubernetes/prometheus_instance.yaml
        + Run: kubectl get prometheus to check the status of the instance

    - Forwarding a local port to the Prometheus service:
        + Run: kubectl port-forward svc/prometheus-operated 9090:9090
        + Access http://localhost:9090/

    - Create service monitor:
        + Run: kubectl apply -f kubernetes/service_monitor.yaml

## Run Grafana:

    - Deploy the Grafana:
        + kubectl create deployment grafana --image=docker.io/grafana/grafana:latest 

    - Expose the Grafana application: 
        + kubectl expose deployment grafana --port 3000

    - Forwarding a local port to the Grafana service:
        + kubectl port-forward svc/grafana 3000:3000

    - kubectl apply -f kubernetes/expose_prometheus.yaml

    - Access http://localhost:3000/

    - Login with username and password: admin

    - Create new password with your own choice

    - Put in http://<node_ip>:30900 as the request URL. To view the <node_ip>, run kubectl get nodes -o wide

    - Create dashboard => Add visualization => Select metric (prometheus_sd_kubernetes_events_total) + Select label (prometheus-prometheus-0) => Apply => You can create a lot of dashboards
    
## Cleaning up:
    - kubectl delete -f kubernetes/expose_prometheus.yaml
    - kubectl delete -f kubernetes/service_monitor.yaml
    - kubectl delete -f kubernetes/prometheus_rbac.yaml
    - kubectl delete -f kubernetes/prometheus_instance.yaml
    - kubectl delete -f kubernetes/tung-nginx-ingress.yaml
    - kubectl delete -f kubernetes/tung-app-ui-deployment-hpa.yaml
    - kubectl delete -f kubernetes/tung-app-api-deployment-hpa.yaml
    - kubectl delete -f kubernetes/tung-app-llm-deployment-hpa.yaml
    - kubectl delete -f kubernetes/tung-app-service.yaml
    - kubectl delete -f kubernetes/tung-app-deployment.yaml
    - kubectl delete -f kubernetes/tung-app-database-migration-job.yaml
    - kubectl delete -f kubernetes/tung-app-database-cluster.yaml
    - kubectl get svc => then kubectl delete svc ... to delete remaining services
    - kubectl get pods => then kubectl delete pod ... to delete remaining pods
    - kubectl get deployments => then kubectl delete deployment ... to delete remaining deployments
    - minikube image list => minikube image rm ...
    - minikube stop
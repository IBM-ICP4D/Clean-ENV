# Clean-ENV-Job
This project will showdown the unused environment in Cloud Pak for Data

Currently, there's no way to auto-clean/stop active environments within projects that have been idle for a particular period of time. And as a result of this, the platform becomes unusable and inaccessible after a period of time due to high memory usage.
 
As a workaround we can create a Kubernetes cron job that runs every hour and delete following environments/pods that idle longer than a day and free up resource:
 
- spss-modeler-server 
- zeppelin-server 
- dods-processor-server 
- wex-server 
- shaper-server 
- rstudio-server 
- jupyter-server 
- jupyter-py36-server 
- jupyter-py35-server



# How to use

1. Login to Master#1 node of your cluster
```
ssh root@<Master#1>
```
2. Clone the repository on Master#1 node 
```
git clone https://github.com/IBM-ICP4D/Clean-ENV.git
cd /root/Clean-ENV
```
3. login to icp to be able to access kubectl and docker
if you can access kubectl and docker, you can skip this step.
```
cloudctl login -a https://mycluster.icp:8443 --skip-ssl-validation -u admin -p <password> -n default
```
4. build and push docker image
```
bash build.sh
```
5. modify settings in the cronjob.yaml
```
vi cronjob.yaml
```

schedule: 

When this job will run
default value: every hour
Check the k8s docs on how to set cronjob schedule
https://kubernetes.io/docs/tasks/job/automated-tasks-with-cron-jobs/#schedule

TARGET_DEPLOY: 

the array of target Deployments prefix, we will only kill the deploments with these prefix.
default value: all the env
```
              - name: TARGET_DEPLOY
                value: "spss-modeler-server, zeppelin-server, dods-processor-server, wex-server, shaper-server, rstudio-server, jupyter-server, jupyter-py36-server, jupyter-py35-server"
```


KILL_AGE: 

We will only kill all the target deployments lived longer than this age in second
default value: 86400 s = 1 day
```
              - name: KILL_AGE
                value: "86400"
```

TARGET_NAMESPACE:

We will only kill the deployments in this namespace

default value: zen

```

              - name: TARGET_NAMESPACE
                value: "zen"
```

5. start cronjob
```
kubectl apply -f cronjob.yaml
```

5. stop cronjob
```
kubectl -n zen delete cronjob clean-env
```

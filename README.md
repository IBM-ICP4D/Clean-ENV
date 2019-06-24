# Clean-ENV-Job
This project will showdown the unused environment in ICP4d

This Job is only for Demo or Dev use only.


# how to use

1. unzip Clean-ENV-Job then scp this folder to you cluster
```
export clusterIP=9.30.222.66
scp -r ./Clean-ENV-Job root@$clusterIP:/ibm/Clean-ENV-Job
```
2. ssh to your cluster then cd to /ibm/Clean-ENV-Job
```
ssh root@clusterIP
cd /ibm/Clean-ENV-Job
```

3. login to icp to be able to access kubectl and docker

if you can access kubectl and docker, you can skip this step.
Normally the username is `admin` password is `admin` or `Passw0rdPassw0rdPassw0rdPassw0rd`, admin may also change it to something else.
```
cloudctl login -a https://mycluster.icp:8443 --skip-ssl-validation -u admin -p Passw0rdPassw0rdPassw0rdPassw0rd -n default
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

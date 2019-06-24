const Client = require('kubernetes-client').Client;
const cf = require('kubernetes-client').config;
const async = require('async');

let client;


if (process.env.TELEPRESENCE_ROOT) {
  client = new Client({
    config: cf.fromKubeconfig(),
    version: '1.9'
  })
} else {
  client = new Client({
    config: cf.getInCluster(),
    version: '1.9'
  });

}

// test only
// process.env.TARGET_DEPLOY = "jupyter-py36-server";
// process.env.KILL_AGE = "2"
// process.env.TARGET_NAMESPACE = "zen"

if (!process.env.TARGET_DEPLOY) {
  console.log("TARGET_DEPLOY is not in ENV, use default spss-modeler-server, zeppelin-server, dods-processor-server, wex-server, shaper-server, rstudio-server, jupyter-server, jupyter-py36-server, jupyter-py35-server");
  process.env.TARGET_DEPLOY = "spss-modeler-server, zeppelin-server, dods-processor-server, wex-server, shaper-server, rstudio-server, jupyter-server, jupyter-py36-server, jupyter-py35-server";
}
// the array of target Deployments prefix, we will kill all the deploment with this prefix
let targetDeploy = process.env.TARGET_DEPLOY.split(",").map(target => target.trim());
console.log("targetDeploy: ", targetDeploy);

if (!process.env.KILL_AGE) {
  console.log("KILL_AGE is not in ENV, use default 1 day");
  //                       s    m   h
  process.env.KILL_AGE = 60 * 60 * 24;
}
// We will only kill all the target deployment lived longer than this age in second
let killAge = Number(process.env.KILL_AGE) * 1000;
console.log("killAge: ", killAge + ' ms');

if (!process.env.TARGET_NAMESPACE) {
  console.log("TARGET_NAMESPACE is not in ENV, use default zen");
  process.env.TARGET_NAMESPACE = "zen";
}
// We will only kill the deployment in this namespace
let targetNamespace = process.env.TARGET_NAMESPACE;
console.log("targetNamespace: ", targetNamespace);




function startKill() {
  async.waterfall([
    getAllDeploymentToKill,
    deleteAllTargetDeployment
  ], function (err, result) {
    if (err) {
      console.log(`Error in startKill function,${err}`);
      return 1;
    } else {
      console.log("deployment deleted:");
      result.forEach(deploy => {
        if(deploy.body && deploy.body.details && deploy.body.details.name)
          console.log(deploy.body.details.name);
      });
      
      return 0;
    }
  });
};


function getAllDeploymentToKill(callback) {
  client.apis.apps.v1.namespaces(targetNamespace).deployments.get()
    .then(result => {
      if (result && result.body && result.body.items) {
        let resultDeployment = [];
        result.body.items.map(deploy => {
          if (deploy.metadata && deploy.metadata.name && deploy.metadata.creationTimestamp) {
            let name = deploy.metadata.name;
            let creationTimestamp = new Date(deploy.metadata.creationTimestamp).getTime();
            let currentTimeStamp = new Date().getTime();
            for (let targetName of targetDeploy) {
              if (name.includes(targetName) && (currentTimeStamp - creationTimestamp) > killAge) {
                resultDeployment.push(name);
              }
            }
          } else {
            let err = new Error("Can not find deploy.metadata.name or deploy.metadata.creationTimestamp in the deploy");
            console.log(err);
          }

        });
        return callback(null, resultDeployment);
      } else {
        let err = new Error("Can not find result.body.items in the result");
        return callback(err);
      }
    }).catch(err => {
      console.log(err);
      return callback(err);
    });
}




function deleteAllTargetDeployment(deploymentToKill, callback) {
  async.map(deploymentToKill, deleteDeployment, function(err, results) {
    if( err ) {
      console.log("err from deleteAllTargetDeployment: ", err);
      return callback(err);
    } else {
      //console.log(results);
      return callback(null, results);
    }
});
}



function deleteDeployment(deployName, callback) {
  client.apis.apps.v1.namespaces(targetNamespace).deployments(deployName).delete()
    .then(result => {
      //console.log(result);
      return callback(null, result);
    }).catch(err => {
      console.log(err);
      return callback(err);
    });
}

startKill();
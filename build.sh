#!/bin/sh
set -x
docker build . -t mycluster.icp:8500/zen/clean-env:1.0.0
docker push mycluster.icp:8500/zen/clean-env:1.0.0

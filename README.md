### Development

```
docker run --rm -it -v $PWD:/var/lib/grafana/plugins/status-heatmap-panel \
           -p 3000:3000 --name grafana.docker \
           --env=GF_USERS_DEFAULT_THEME=light \
           grafana/grafana:5.1.3
```

```
grunt watch
```

Prometheus

```
ssh kube-cluster -L 3001:localhost:9001
kubectl port-forward prometheus-0 9001:9090 -n prom-namespace
```

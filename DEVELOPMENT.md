# Development

To test and improve the plugin you can run local Grafana instance in Docker container:

```
git clone https://github.com/flant/grafana-statusmap.git
cd grafana-statusmap
docker run --rm -it -v $PWD:/var/lib/grafana/plugins/flant-statusmap-panel \
           -p 3000:3000 --name grafana.docker \
           --env=GF_USERS_DEFAULT_THEME=light \
           grafana/grafana:7.3.4
```

The `-v` flag exposes plugin directory from your machine to Grafana container. Now run `yarn watch` to compile `dist` directory and follow changes in src directory.



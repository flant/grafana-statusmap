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


## Compatibility

- @grafana/data available for Angular plugins since 6.3.0 https://github.com/grafana/grafana/blob/v6.3.0/public/app/features/plugins/plugin_loader.ts#L94
- useDataFrames presents in graph plugin since 6.4.0 https://github.com/grafana/grafana/blob/v6.4.0/public/app/plugins/panel/graph/module.ts#L145
- Object based events are in use since 6.5.0
- It seems @grafana/data contains PanelEvents.dataFramesReceived since 7.0.0, older versions use CoreEvents.dataFramesReceived

## Docker compose

Use GRAFANA_VERSION environment variable to run plugin in specific Grafana version:

```
$ GRAFANA_VERSION=6.7.4 docker-compose up
...
grafana_1  | t=2022-05-05T08:16:54+0000 lvl=info msg="Starting Grafana" logger=server version=6.7.4 commit=8e44bbc5f5 branch=HEAD compiled=2020-05-26T17:35:38+0000
...
```

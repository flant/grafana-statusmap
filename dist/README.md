# Statusmap panel for Grafana



![Statusmap sample panel](https://raw.githubusercontent.com/flant/grafana-statusmap/master/src/img/flant-statusmap-panel.png)


## Features

* Group values into rows and buckets by query's legend
* User defined color mapping
* Multiple values in bucket display in tooltip
* Interval shaping to better visual representation
* Represent null values as empty bucket or as zero

Supported / Tested Data Sources :
--------------------------------

* Prometheus
* TestData

Tested Grafana versions :
-------------------------

* 5.1.3

## Development

```
docker run --rm -it -v $PWD:/var/lib/grafana/plugins/status-heatmap-panel \
           -p 3000:3000 --name grafana.docker \
           --env=GF_USERS_DEFAULT_THEME=light \
           grafana/grafana:5.1.3
```

```
grunt watch
```

### Acknowledgements

This panel plugin is based on "Heatmap" panel by Grafana with ideas from Carpet plot, Discrete panel, Status Panel, Status Dot, Status By Group.

#### Changelog

##### v0.0.1

- First public release


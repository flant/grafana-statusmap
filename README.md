# Statusmap panel for Grafana

![Statusmap sample panel](https://raw.githubusercontent.com/flant/grafana-statusmap/master/src/img/flant-statusmap-panel.png)

## Features

* Group values into rows and buckets by query's legend
* User defined color mapping
* Multiple values in bucket display in tooltip
* Interval shaping to better visual representation
* Represent null values as empty bucket or as zero value

### Supported environment

* Prometheus datasource
* Tested with Grafana 5.1.3

## Installation

Plugin can be installed with git:

```
git clone git@github.com:flant/grafana-statusmap.git /var/lib/grafana/plugins/flant-statusmap-panel
```

Or you can download ZIP archive of this repo and unpack it into /var/lib/grafana/plugins directory.

## Motivation

This plugin emerges from our needs to visually represent history of changes for a set of objects
with discrete statuses.
_Objects_ can be hosts, Kubernetes pods or coffee makers and _discrete statuses_ are a set
of predefined values: something like `ok` = 0, `off` = 1, `fail` = 2.

## Configuration

### Prometheus

Discrete statuses requires some setup in prometheus to get all available statuses over time.
If metric has values 0 and 1 and status is stored in label then it's ok. But if there are 5 statuses
and metric has possible values (0,1,2,3,4) then it should be transformed into previous form with this rule:

```
- record: coffee_maker_status:discrete
  expr: |
    count_values("status", coffee_maker_status)

```

This rule will transform metric `coffee_maker_status` with value `3` into this new metric:

```
coffee_maker_status:discrete{status="3"} 1
```

Now prometheus has 0 and 1 for each status. And these metrics can be aggregated
to get all available statuses over time.

### Panel

Each possible status value corresponds to a separate query. Each query should have similar legend for grouping.



![Query setup](https://raw.githubusercontent.com/flant/grafana-statusmap/master/src/img/queries-example.png)

Next define color mapping for status values in __Discrete__ color mode.

![Color mapping](https://raw.githubusercontent.com/flant/grafana-statusmap/master/src/img/color-mapping.png)


__Spectrum__ and __Opacity__ color modes works as in a [Heatmap](https://grafana.com/plugins/heatmap) plugin.


### More options

![Bucket options](https://raw.githubusercontent.com/flant/grafana-statusmap/master/src/img/options-bucket.png)

__Multiple values__ check determine multiple values display mode. If check is unset then multiple values
for one bucket treated as error. If check is on then color for bucket determined
by value with least index in color mapping.

![Color mapping](https://raw.githubusercontent.com/flant/grafana-statusmap/master/src/img/multiple-values-error.png)

__Null values__ can be treated as empty buckets or displayed as color of 0 value.

![Color mapping](https://raw.githubusercontent.com/flant/grafana-statusmap/master/src/img/null-as-empty.png)

__Min width__ and __spacing__ are determine minimal bucket width and spacing between buckets.
__Rounding__ is for round edges.

![Min width, spacing, rounding](https://raw.githubusercontent.com/flant/grafana-statusmap/master/src/img/min-width-spacing-rounding.png)


## Development

The easy way to test and develop plugin is to run Grafana instance in docker with following command in the directory containing the plugin.
This will expose the local plugin on your machine to the Grafana container.

```
docker run --rm -it -v $PWD:/var/lib/grafana/plugins/flant-statusmap-panel \
           -p 3000:3000 --name grafana.docker \
           --env=GF_USERS_DEFAULT_THEME=light \
           grafana/grafana:5.1.3
```

Now run `grunt` to compile dist directory and start changes watcher:

```
grunt watch
```

## Acknowledgements

Idea of a plugin comes from Dmitry Stolyarov [@distol](https://github.com/distol), initial version written by Sergey Gnuskov [@gsmetal](https://github.com/gsmetal) and final changes made by Ivan Mikheykin [@diafour](https://github.com/diafour).

This plugin is based on a "Heatmap" panel by Grafana and inspired by ideas from Carpet plot, Discrete panel, Status Panel, Status Dot, Status By Group.

#### Changelog

##### v0.0.1

- First public release


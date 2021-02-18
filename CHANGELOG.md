# Changelog

## v0.4.1

- Fix regression in discrete mode. "Data has value with undefined color"

## v0.4.0

- Add __y_label_trim variable for tooltip items.
- Add y-label splitter for tooltip items.
- Add custom content for toolip.
- Fix to work with Grafana 7.4.x.
- Migrate to grafana-toolkit and yarn to build and sign.
- Cleanup dist directory content, reduce compiled plugin size, remove dist from repository.
- Code cleanup: fix huge amount of linter errors and warnings.
- Add Github Actions configuration to automate release process. 
- Add unobtrusive branding.

## v0.3.4

- Fix to work in Grafana 7.2.0,7.2.1
- Fix 'name' in tooltip for opacity and gradient modes
- Fix color scale for opacity and gradient modes

## v0.3.3

- Fix fallback to string events for older versions of Grafana

## v0.3.2

- Fix plugin metadata for Grafana repository

## v0.3.1

- Fix to work in Grafana 7.1.0

## v0.3.0

- Tooltip freeze on click
- Show URLs in tooltip
- Pagination controls
- Fix tooltip and null buckets
- Fix display for 6.7+, 7.0+

## v0.2.0

- Migrate code base to typescript
- Fixes to work in 6.3.0+ grafana

## v0.1.1

- Fix for annotations in grafana 5.x before 5.4

## v0.1.0

- Tested with Grafana 6.0.0
- Tested with InfluxDB and Mysql datasources
- Add initial support for display annotations
- Add example for k8s statuses (thanks, @vrutkovs)
- Fix hanging on big values
- Fix horizontal spacing = 0
- Fix for "Object doesn't support property or method 'remove'"
- Fix card width for targets with different datapoints count

## v0.0.4

- Fix display of multivalues buckets as an empty cell

## v0.0.3

- Add solarized preset
- Reorganize statuses editor for discrete mode
- Separate options for vertical and horizontal spacing for cards
- Add simple sort options for Y axis
- Fix display null values as zero

## v0.0.2

- Install with GF_INSTALL_PLUGINS
- Fix legend overlap
- Fix colors for dark theme
- Fix panel rendering timeout error


## v0.0.1

- First public release


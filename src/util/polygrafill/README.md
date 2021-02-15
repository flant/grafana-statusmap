1. @grafana/data is not supported in grafana 5.x and 6.2. The workaround is
the module `./util/grafana/events` that include copy-pasted events
from @grafana/data and app/core from grafana sources.

2. Newly Grafana versions flood Console with
"Usage strings as events is deprecated ..." messages.
This module has a function to detect if Grafana’s Emitter support AppEvent style event ids.


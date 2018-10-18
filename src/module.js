import {loadPluginCss} from 'app/plugins/sdk';
import { StatusHeatmapCtrl } from './status_heatmap_ctrl';

loadPluginCss({
  dark: 'plugins/flant-statusmap-panel/css/statusmap.dark.css',
  light: 'plugins/flant-statusmap-panel/css/statusmap.light.css'
});

export {
  StatusHeatmapCtrl as PanelCtrl
};

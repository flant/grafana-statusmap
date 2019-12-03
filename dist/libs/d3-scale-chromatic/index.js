"use strict";

System.register(["./categorical/Accent", "./categorical/Dark2", "./categorical/Paired", "./categorical/Pastel1", "./categorical/Pastel2", "./categorical/Set1", "./categorical/Set2", "./categorical/Set3", "./diverging/BrBG", "./diverging/PRGn", "./diverging/PiYG", "./diverging/PuOr", "./diverging/RdBu", "./diverging/RdGy", "./diverging/RdYlBu", "./diverging/RdYlGn", "./diverging/GnYlRd", "./diverging/Spectral", "./sequential-multi/BuGn", "./sequential-multi/BuPu", "./sequential-multi/GnBu", "./sequential-multi/OrRd", "./sequential-multi/PuBuGn", "./sequential-multi/PuBu", "./sequential-multi/PuRd", "./sequential-multi/RdPu", "./sequential-multi/YlGnBu", "./sequential-multi/YlGn", "./sequential-multi/YlOrBr", "./sequential-multi/YlOrRd", "./sequential-single/Blues", "./sequential-single/Greens", "./sequential-single/Greys", "./sequential-single/Purples", "./sequential-single/Reds", "./sequential-single/Oranges"], function (_export, _context) {
  "use strict";

  return {
    setters: [function (_categoricalAccent) {
      _export("schemeAccent", _categoricalAccent.default);
    }, function (_categoricalDark) {
      _export("schemeDark2", _categoricalDark.default);
    }, function (_categoricalPaired) {
      _export("schemePaired", _categoricalPaired.default);
    }, function (_categoricalPastel) {
      _export("schemePastel1", _categoricalPastel.default);
    }, function (_categoricalPastel2) {
      _export("schemePastel2", _categoricalPastel2.default);
    }, function (_categoricalSet) {
      _export("schemeSet1", _categoricalSet.default);
    }, function (_categoricalSet2) {
      _export("schemeSet2", _categoricalSet2.default);
    }, function (_categoricalSet3) {
      _export("schemeSet3", _categoricalSet3.default);
    }, function (_divergingBrBG) {
      _export({
        interpolateBrBG: _divergingBrBG.default,
        schemeBrBG: _divergingBrBG.scheme
      });
    }, function (_divergingPRGn) {
      _export({
        interpolatePRGn: _divergingPRGn.default,
        schemePRGn: _divergingPRGn.scheme
      });
    }, function (_divergingPiYG) {
      _export({
        interpolatePiYG: _divergingPiYG.default,
        schemePiYG: _divergingPiYG.scheme
      });
    }, function (_divergingPuOr) {
      _export({
        interpolatePuOr: _divergingPuOr.default,
        schemePuOr: _divergingPuOr.scheme
      });
    }, function (_divergingRdBu) {
      _export({
        interpolateRdBu: _divergingRdBu.default,
        schemeRdBu: _divergingRdBu.scheme
      });
    }, function (_divergingRdGy) {
      _export({
        interpolateRdGy: _divergingRdGy.default,
        schemeRdGy: _divergingRdGy.scheme
      });
    }, function (_divergingRdYlBu) {
      _export({
        interpolateRdYlBu: _divergingRdYlBu.default,
        schemeRdYlBu: _divergingRdYlBu.scheme
      });
    }, function (_divergingRdYlGn) {
      _export({
        interpolateRdYlGn: _divergingRdYlGn.default,
        schemeRdYlGn: _divergingRdYlGn.scheme
      });
    }, function (_divergingGnYlRd) {
      _export({
        interpolateGnYlRd: _divergingGnYlRd.default,
        schemeGnYlRd: _divergingGnYlRd.scheme
      });
    }, function (_divergingSpectral) {
      _export({
        interpolateSpectral: _divergingSpectral.default,
        schemeSpectral: _divergingSpectral.scheme
      });
    }, function (_sequentialMultiBuGn) {
      _export({
        interpolateBuGn: _sequentialMultiBuGn.default,
        schemeBuGn: _sequentialMultiBuGn.scheme
      });
    }, function (_sequentialMultiBuPu) {
      _export({
        interpolateBuPu: _sequentialMultiBuPu.default,
        schemeBuPu: _sequentialMultiBuPu.scheme
      });
    }, function (_sequentialMultiGnBu) {
      _export({
        interpolateGnBu: _sequentialMultiGnBu.default,
        schemeGnBu: _sequentialMultiGnBu.scheme
      });
    }, function (_sequentialMultiOrRd) {
      _export({
        interpolateOrRd: _sequentialMultiOrRd.default,
        schemeOrRd: _sequentialMultiOrRd.scheme
      });
    }, function (_sequentialMultiPuBuGn) {
      _export({
        interpolatePuBuGn: _sequentialMultiPuBuGn.default,
        schemePuBuGn: _sequentialMultiPuBuGn.scheme
      });
    }, function (_sequentialMultiPuBu) {
      _export({
        interpolatePuBu: _sequentialMultiPuBu.default,
        schemePuBu: _sequentialMultiPuBu.scheme
      });
    }, function (_sequentialMultiPuRd) {
      _export({
        interpolatePuRd: _sequentialMultiPuRd.default,
        schemePuRd: _sequentialMultiPuRd.scheme
      });
    }, function (_sequentialMultiRdPu) {
      _export({
        interpolateRdPu: _sequentialMultiRdPu.default,
        schemeRdPu: _sequentialMultiRdPu.scheme
      });
    }, function (_sequentialMultiYlGnBu) {
      _export({
        interpolateYlGnBu: _sequentialMultiYlGnBu.default,
        schemeYlGnBu: _sequentialMultiYlGnBu.scheme
      });
    }, function (_sequentialMultiYlGn) {
      _export({
        interpolateYlGn: _sequentialMultiYlGn.default,
        schemeYlGn: _sequentialMultiYlGn.scheme
      });
    }, function (_sequentialMultiYlOrBr) {
      _export({
        interpolateYlOrBr: _sequentialMultiYlOrBr.default,
        schemeYlOrBr: _sequentialMultiYlOrBr.scheme
      });
    }, function (_sequentialMultiYlOrRd) {
      _export({
        interpolateYlOrRd: _sequentialMultiYlOrRd.default,
        schemeYlOrRd: _sequentialMultiYlOrRd.scheme
      });
    }, function (_sequentialSingleBlues) {
      _export({
        interpolateBlues: _sequentialSingleBlues.default,
        schemeBlues: _sequentialSingleBlues.scheme
      });
    }, function (_sequentialSingleGreens) {
      _export({
        interpolateGreens: _sequentialSingleGreens.default,
        schemeGreens: _sequentialSingleGreens.scheme
      });
    }, function (_sequentialSingleGreys) {
      _export({
        interpolateGreys: _sequentialSingleGreys.default,
        schemeGreys: _sequentialSingleGreys.scheme
      });
    }, function (_sequentialSinglePurples) {
      _export({
        interpolatePurples: _sequentialSinglePurples.default,
        schemePurples: _sequentialSinglePurples.scheme
      });
    }, function (_sequentialSingleReds) {
      _export({
        interpolateReds: _sequentialSingleReds.default,
        schemeReds: _sequentialSingleReds.scheme
      });
    }, function (_sequentialSingleOranges) {
      _export({
        interpolateOranges: _sequentialSingleOranges.default,
        schemeOranges: _sequentialSingleOranges.scheme
      });
    }],
    execute: function () {}
  };
});
//# sourceMappingURL=index.js.map

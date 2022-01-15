/// <reference path="../../build/linq.d.ts" />
/// <reference path="../../layer.d.ts" />
/// <reference path="../../build/biocad_webcore.d.ts" />

namespace biodeep.app {

    export function start() {
        Router.AddAppHandler(new apps.PathwayExplorer());
        Router.AddAppHandler(new apps.FlowEditor());
        Router.AddAppHandler(new apps.KEGGNetwork());
        Router.AddAppHandler(new apps.Viewer());

        Router.RunApp();
    }
}

const __indexOf = Array.prototype.indexOf || function (item) {
    for (var i = 0, l = this.length; i < l; i++) {
        if (i in this && this[i] === item)
            return i;
    }

    return -1;
};

$ts.mode = Modes.debug;
$ts(biodeep.app.start);


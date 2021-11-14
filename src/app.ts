/// <reference path="../../build/linq.d.ts" />
/// <reference path="../../layer.d.ts" />
/// <reference path="../../build/biocad_webcore.d.ts" />

namespace biodeep.app {

    export function start() {
        Router.AddAppHandler(new apps.PathwayExplorer());

        Router.RunApp();
    }
}

$ts.mode = Modes.debug;
$ts(biodeep.app.start);
/// <reference path="../../build/linq.d.ts" />
/// <reference path="../../layer.d.ts" />

namespace biodeep.app {

    export function start() {
        Router.AddAppHandler(new apps.Metabolic_pathway());

        Router.RunApp();
    }
}

$ts.mode = Modes.debug;
$ts(biodeep.app.start);
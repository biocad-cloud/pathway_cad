/// <reference path="../../../build/biocad.d.ts" />

namespace apps {

    export class KEGGNetwork extends Bootstrap {

        public get appName(): string {
            return "kegg_network";
        }

        protected init(): void {
            const tree = PathwayExplorer.loadKEGGTree();

            console.log(tree);
        }
    }
}
namespace apps {

    export class PathwayExplorer extends Bootstrap {

        public get appName(): string {
            return "Pathway_explorer";
        };

        readonly assemblyKey: string = "ko00001-assembly";
        readonly canvas: Metabolic_pathway = new Metabolic_pathway();

        protected init(): void {
            const dataUrl: string = <any>$ts("@data:repository");
            const vm = this;
            const assembly: string = localStorage.getItem(this.assemblyKey);

            if (Strings.Empty(assembly)) {
                // get from server and cached into localstorage
                $ts.get(dataUrl, function (obj) {
                    vm.saveCache(<any>obj);
                    vm.loadCache();
                })
            } else {
                vm.loadCache()
            }

            vm.canvas.init();
        }

        private loadUITree(obj: KEGG.brite.IKEGGBrite) {
            const tree = PathwayNavigator.parseJsTree(obj);
            const target: string = <any>$ts("@app:explorer");

            $(`#${target}`).jstree({
                'core': {
                    data: tree.children
                }
            });
        }

        private saveCache(obj: KEGG.brite.IKEGGBrite) {
            const cacheKeys: string[] = [];

            for (let data of obj.children) {
                const cacheKey: string = data.name
                    .toLowerCase()
                    .replace(/\s+/ig, "_")
                    ;

                cacheKeys.push(cacheKey);
                localStorage.setItem(cacheKey, JSON.stringify(data));
            }

            localStorage.setItem(this.assemblyKey, JSON.stringify(cacheKeys));
        }

        private loadCache() {
            const assembly: string = localStorage.getItem(this.assemblyKey);
            const keys: string[] = JSON.parse(assembly);
            const keggTree = <KEGG.brite.IKEGGBrite>{
                name: "ko00001",
                children: []
            }

            let cache: string = null;

            for (let keyId of keys) {
                TypeScript.logging.log(`load cache: ${keyId}...`);

                cache = localStorage.getItem(keyId);
                keggTree.children.push(JSON.parse(cache));
            }

            this.loadUITree(keggTree);
        }
    }
}
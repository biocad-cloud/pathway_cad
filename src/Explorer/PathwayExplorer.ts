namespace apps {

    export const assemblyKey: string = "ko00001-assembly";

    export class PathwayExplorer extends Bootstrap {

        public get appName(): string {
            return "Pathway_explorer";
        };

        private Metabolic_pathway: string = null;

        protected init(): void {
            PathwayExplorer.initKEGG(() => this.loadCache());
        }

        public static initKEGG(loadCache: Delegate.Action) {
            const dataUrl: string = <any>$ts("@data:repository");
            const assembly: string = localStorage.getItem(assemblyKey);

            if (!Strings.Empty(dataUrl, true)) {
                if (Strings.Empty(assembly)) {
                    // get from server and cached into localstorage
                    $ts.get(dataUrl, function (obj) {
                        PathwayExplorer.saveCache(<any>obj);
                        loadCache();
                    })
                } else {
                    loadCache()
                }
            }
        }

        private loadUITree(obj: KEGG.brite.IKEGGBrite) {
            const tree = PathwayNavigator.parseJsTree(obj);
            const target: string = <any>$ts("@app:explorer");
            const $vm = this;

            $(`#${target}`).jstree({
                'core': {
                    data: tree.children
                },
                'plugins': ["contextmenu"],
                'contextmenu': {
                    'items': {
                        "add_reactor": {
                            label: "Create Reactor",
                            action: PathwayExplorer.createReactor
                        }
                    }
                }
            });

            $(`#${target}`).on("click", ".jstree-anchor", function (e) {
                const id: string = $(`#${target}`).jstree(true).get_node($(this)).id;
                const mapId = `map${id.split("_")[0]}`;

                $vm.Metabolic_pathway = mapId;
                $ts("#do-createReactor").onclick = function () { PathwayExplorer.createReactor(mapId) }
                $ts("#canvas")
                    .clear()
                    .display($ts("<iframe>", {
                        src: `@url:readmap/${mapId}`,
                        width: "1600px",
                        height: "1200px",
                        "max-width": "1920px",
                        frameborder: "no",
                        border: "0",
                        marginwidth: "0",
                        marginheight: "0",
                        scrolling: "no",
                        allowtransparency: "yes"
                    }));
            })
        }

        private static createReactor(data: string | object) {
            const id: string = typeof (data) == "string" ? data : (<any>data).reference[0].id;
            const mapId: string = `map${id.split("_")[0]}`;

            $ts.post(`@url:createmap`, { mapid: mapId }, function (data) {
                const url: string = PathwayExplorer.getUrl(data);

                if (data.code == 0 && !Strings.Empty(url, true)) {
                    $goto(url);
                } else {
                    // show error message
                }
            });
        }

        private static getUrl(data: IMsg<any>) {
            if (isNullOrUndefined(data)) return null;
            if (typeof (data.info) != "string") return null;

            return data.info;
        }

        public static saveCache(obj: KEGG.brite.IKEGGBrite) {
            const cacheKeys: string[] = [];

            for (let data of obj.children) {
                const cacheKey: string = data.name
                    .toLowerCase()
                    .replace(/\s+/ig, "_")
                    ;

                cacheKeys.push(cacheKey);
                localStorage.setItem(cacheKey, JSON.stringify(data));
            }

            localStorage.setItem(assemblyKey, JSON.stringify(cacheKeys));
        }

        private loadCache() {
            this.loadUITree(PathwayExplorer.loadKEGGTree());
        }

        public static loadKEGGTree() {
            const assembly: string = localStorage.getItem(assemblyKey);
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

            return keggTree;
        }
    }
}
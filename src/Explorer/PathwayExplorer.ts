namespace apps {

    export class PathwayExplorer extends Bootstrap {

        public get appName(): string {
            return "Pathway_explorer";
        };

        protected init(): void {
            const dataUrl: string = <any>$ts("@data:repository");
            const target: string = <any>$ts("@app:explorer");

            $ts.get(dataUrl, function (obj) {
                const tree = PathwayNavigator.parseJsTree(<any>obj);
                const load = $(`#${target}`).jstree({
                    'core': {
                        data: [tree]
                    }
                });
            })
        }
    }
}
/// <reference path="../../../build/biocad.d.ts" />

namespace apps {

    type SearchTerm = Application.Suggestion.term;

    export const listDiv = "#sample_suggests";
    export const inputDiv = "#sample_search";

    export class KEGGNetwork extends Bootstrap {

        public get appName(): string {
            return "kegg_network";
        }

        protected init(): void {
            PathwayExplorer.initKEGG(() => this.loadCache());
        }

        private loadCache() {
            const tree = PathwayNavigator.parseJsTree(PathwayExplorer.loadKEGGTree());
            const components: PathwayNavigator.jsTree[] = [];

            KEGGNetwork.createSet(tree, components);

            const terms: SearchTerm[] = [];
            const unique = $from(components)
                .GroupBy(t => t.text.split(/\s+/ig)[0])
                .Select(t => t.First)
                .ToArray();

            for (let koId of unique) {
                terms.push(new Application.Suggestion.term(koId.id, koId.text));
            }

            const suggest = Application.Suggestion.render.makeSuggestions(
                terms, listDiv, term => this.clickOnTerm(term), 13, true, ""
            );

            $ts(inputDiv).onkeyup = function () {
                const search: string = $ts.value(inputDiv);

                if (Strings.Empty(search, true)) {
                    $ts(listDiv).hide();
                } else {
                    $ts(listDiv).show();
                    suggest(search);
                }
            }

            TypeScript.logging.log(`${components.length} kegg components has been loaded!`, TypeScript.ConsoleColors.Magenta);
            TypeScript.logging.log(" ~done!", TypeScript.ConsoleColors.Magenta);
        }

        private clickOnTerm(term: SearchTerm) {
            // const valueSel = "#pathway_list";

            // $ts.value(valueSel, term.id.toString());
            $ts(listDiv).hide();
            console.log(term);

            // this.updateChart(term.id);
        }

        private static createSet(tree: PathwayNavigator.jsTree, components: PathwayNavigator.jsTree[]) {
            for (let node of tree.children) {
                if (isNullOrUndefined(node.children)) {
                    components.push(node);
                } else {
                    this.createSet(node, components);
                }
            }
        }
    }
}
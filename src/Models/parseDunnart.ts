namespace dataAdapter {

    export class parseDunnart {

        private nodeLookup = {};
        private graph: graph;

        private sbsvg;

        public constructor(svgObjId: string = "#embeddedsvg") {
            let sbsvg = d3.select($ts(svgObjId)).select('svg');

            this.sbsvg = sbsvg;
            this.graph = {
                nodes: [],
                links: [],
                constraints: [],
                groups: []
            };
        }

        public getGraph(): graph {
            this.loadNodes(this.sbsvg);

            let connectors: HTMLElement[] = this.sbsvg.selectAll('.connector')[0];

            for (let l of connectors) {
                let u = l.getAttribute('dunnart:srcid');
                let v = l.getAttribute('dunnart:dstid');

                if (!(u in this.nodeLookup)) {
                    console.warn(`missing node of ${u}`);
                } else if (!(v in this.nodeLookup)) {
                    console.warn(`missing node of ${v}`);
                } else {
                    this.graph.links.push({
                        source: this.nodeLookup[u].index,
                        target: this.nodeLookup[v].index
                    });
                }
            }

            let clusters: HTMLElement[] = this.sbsvg.selectAll('.cluster')[0]

            for (let g of clusters) {
                this.graph.groups.push({
                    leaves: g.getAttribute('dunnart:contains').split(' ').map(i => this.nodeLookup[i].index),
                    style: g.getAttribute('style'),
                    padding: 10
                })
            }

            let constraintMap = {};
            let alignments: HTMLElement[] = this.sbsvg.selectAll('[relType=alignment]')[0];

            for (let alignment of alignments) {
                let cid = alignment.getAttribute('constraintid');
                let nodeid = this.nodeLookup[alignment.getAttribute('objoneid')].index;
                let alignmentPos = parseInt(alignment.getAttribute('alignmentpos'));
                let o = { node: nodeid, offset: 0 };

                if (cid in constraintMap) {
                    constraintMap[cid].offsets.push(o);
                } else {
                    this.graph.constraints.push(constraintMap[cid] = {
                        type: 'alignment',
                        offsets: [o],
                        axis: <any>(alignmentPos == 1 ? "y" : "x")
                    });
                }
            }

            return this.graph;
        }

        private loadNodes(sbsvg) {
            let vm = this;
            let shapes: HTMLElement[] = sbsvg.selectAll('rect.shape')[0];
            let i: number = 0;

            for (let d of shapes) {
                vm.graph.nodes.push(
                    vm.nodeLookup[d.id] = {
                        label: d.getAttribute('dunnart:label'),
                        dunnartid: d.id,
                        index: i++,
                        width: 60,
                        height: 40,
                        x: parseFloat(d.getAttribute('x')),
                        y: parseFloat(d.getAttribute('y')),
                        rx: ('rx' in d.attributes) ? parseFloat(d.getAttribute('rx')) : 5,
                        ry: ('ry' in d.attributes) ? parseFloat(d.getAttribute('ry')) : 5
                    }
                );
            }
        }
    }
}
namespace apps {

    export class Metabolic_pathway {

        private width: number = 800;
        private height: number = 520;

        public margin: number = 6;
        public pad: number = 12;

        private d3cola;
        private outer;
        private vis;

        public constructor() {
            this.width = parseFloat(<string><any>$ts("@width"));
            this.height = parseFloat(<string><any>$ts("@height"));
        }

        private redraw() {
            this.vis.attr("transform", `translate(${d3.event.translate}) scale(${d3.event.scale})`);
        }

        public savePng() {
            saveSvgAsPng(<any>$ts("#canvas").childNodes.item(0), "pathway.png");
        }

        public init(): Metabolic_pathway {
            let graph_url: string = <any>$ts("@url:graph");

            this.d3cola = cola.d3adaptor(d3)
                .linkDistance(60)
                .avoidOverlaps(true)
                .size([this.width, this.height]);

            this.outer = d3.select($ts("#canvas")).append("svg")
                .attr("width", this.width)
                .attr("height", this.height)
                .attr("pointer-events", "all");

            this.outer.append('rect')
                .attr('class', 'background')
                .attr('width', "100%")
                .attr('height', "100%")
                .call(d3.behavior.zoom().on("zoom", () => this.redraw()));

            this.vis = this.outer
                .append('g')
                .attr('transform', 'translate(80,80) scale(0.7)');

            if (graph_url.charAt(0) == "#") {
                // load from a svg container node            
                this.d3cola.on("tick", this.loadGraph(new dataAdapter.parseDunnart(graph_url).getGraph()).tick());
            } else {
                $ts.getText(graph_url, json => this.d3cola.on("tick", this.loadGraph(JSON.parse(json)).tick()))
            }

            TypeScript.logging.log("intialization job done!", TypeScript.ConsoleColors.DarkBlue);

            return this;
        }

        /**
         * load network graph model and then 
         * initialize data visualization 
         * components.
        */
        private loadGraph(graph: graph): Cola_graph {
            let groupsLayer = this.vis.append("g");
            let nodesLayer = this.vis.append("g");
            let linksLayer = this.vis.append("g");

            console.log(JSON.stringify(graph));

            this.d3cola
                .nodes(graph.nodes)
                .links(graph.links)
                .groups(graph.groups)
                .constraints(graph.constraints)
                .start();

            // define arrow markers for graph links
            this.outer.append('svg:defs').append('svg:marker')
                .attr('id', 'end-arrow')
                .attr('viewBox', '0 -5 10 10')
                .attr('refX', 5)
                .attr('markerWidth', 3)
                .attr('markerHeight', 3)
                .attr('orient', 'auto')
                .append('svg:path')
                .attr('d', 'M0,-5L10,0L0,5L2,0')
                .attr('stroke-width', '0px')
                .attr('fill', '#000');

            let group = groupsLayer.selectAll(".group")
                .data(graph.groups)
                .enter().append("rect")
                .attr("rx", 8).attr("ry", 8)
                .attr("class", "group")
                .attr("style", d => d.style);

            let link = linksLayer.selectAll(".link")
                .data(graph.links)
                .enter()
                .append("line")
                .attr("class", "link");

            let node = nodesLayer.selectAll(".node")
                .data(graph.nodes)
                .enter().append("rect")
                .attr("class", "node")
                .attr("width", d => d.width + 2 * this.pad + 2 * this.margin)
                .attr("height", d => d.height + 2 * this.pad + 2 * this.margin)
                .attr("rx", d => d.rx)
                .attr("ry", d => d.rx)
                .call(this.d3cola.drag);

            let label = nodesLayer.selectAll(".label")
                .data(graph.nodes)
                .enter().append("text")
                .attr("class", "label")
                .call(this.d3cola.drag);

            label.each(Metabolic_pathway.insertLinebreaks);
            node.append("title").text(d => d.label);

            return new Cola_graph(node, link, group, label, this);
        }

        private static insertLinebreaks(d) {
            let el = d3.select(this);
            let words: string[] = d.label.split(' ');
            let tspan;

            el.text('');

            for (let word of words) {
                tspan = el.append('tspan').text(word);
                tspan
                    .attr('x', 0)
                    .attr('dy', '15')
                    .attr("font-size", "12");
            }
        }
    }
}
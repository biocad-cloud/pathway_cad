namespace apps {

    export class Cola_graph {

        public constructor(public node, public link, public group, public label, private vm: Metabolic_pathway) {
            console.log(this);
        }

        public tick(): Delegate.Action {
            let vm = this.vm;
            let simulator = this;

            return function () {
                simulator.node.each(d => d.innerBounds = d.bounds.inflate(-vm.margin));
                simulator.link.each(d => d.route = cola.makeEdgeBetween(d.source.innerBounds, d.target.innerBounds, 5));

                simulator.link
                    .attr("x1", d => d.route.sourceIntersection.x)
                    .attr("y1", d => d.route.sourceIntersection.y)
                    .attr("x2", d => d.route.arrowStart.x)
                    .attr("y2", d => d.route.arrowStart.y);

                simulator.label.each(function (d) {
                    let b = this.getBBox();

                    d.width = b.width + 2 * vm.margin + 8;
                    d.height = b.height + 2 * vm.margin + 8;
                });

                simulator.node
                    .attr("x", d => d.innerBounds.x)
                    .attr("y", d => d.innerBounds.y)
                    .attr("width", d => d.innerBounds.width())
                    .attr("height", d => d.innerBounds.height());

                simulator.group
                    .attr("x", d => d.bounds.x)
                    .attr("y", d => d.bounds.y)
                    .attr("width", d => d.bounds.width())
                    .attr("height", d => d.bounds.height());

                simulator.label.attr("transform", d => simulator.transform(d));
            }
        }

        private transform(d) {
            return `translate(${d.x}${this.vm.margin}, ${(d.y + this.vm.margin - d.height / 2)})`
        }
    }
}
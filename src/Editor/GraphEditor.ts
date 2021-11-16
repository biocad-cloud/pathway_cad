namespace apps {

    export class GraphEditor {

        public width: number = 960;
        public height: number = 500;

        /**
         * SELECTION - store the selected node
         * EDITING - store the drag mode (either 'drag' or 'add_link')
        */
        private selection = null;
        private vis = null;

        public colorify = null;

        private force = null;
        private tool: string;
        private new_link_source = null;
        private drag = null;
        private drag_link = null;

        public constructor(public graph: Graph) {
            if (graph instanceof Graph) {
                // do nothing
            } else {
                this.graph = new Graph(graph);
            }
        }

        /**
         * update nodes and links
        */
        private tick() {
            this.vis
                .selectAll('.node')
                .attr('transform', d => "translate(" + d.x + "," + d.y + ")");

            return this.vis.selectAll('.link').attr('x1', function (d) {
                return d.source.x;
            }).attr('y1', function (d) {
                return d.source.y;
            }).attr('x2', function (d) {
                return d.target.x;
            }).attr('y2', function (d) {
                return d.target.y;
            });
        }

        /**
         * SELECTION
        */
        private click(d) {
            const vm = this;

            vm.selection = null;
            d3.selectAll('.node').classed('selected', false);

            return d3.selectAll('.link').classed('selected', false);
        }

        private zoom() {
            return this.vis.attr('transform', "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        }

        public init() {
            // create the SVG                     
            const svg = d3.select('body').append('svg').attr('width', this.width).attr('height', this.height);
            // ZOOM and PAN
            // create container elements            
            const container = svg.append('g');
            const vm = this;

            this.graph.objectify();

            container.call(d3.behavior.zoom().scaleExtent([0.5, 8]).on('zoom', () => vm.zoom()));
            vm.vis = container.append('g');
            /* create a rectangular overlay to catch events
            */
            /* WARNING rect size is huge but not infinite. this is a dirty hack
            */
            vm.vis.append('rect').attr('class', 'overlay')
                .attr('x', -500000)
                .attr('y', -500000)
                .attr('width', 1000000)
                .attr('height', 1000000)
                .on('click', d => this.click(d));
            // END ZOOM and PAN
            vm.colorify = d3.scale.category10();
            // initialize the force layout
            vm.force = d3.layout.force()
                .size([this.width, this.height])
                .charge(-400)
                .linkDistance(60)
                .on('tick', () => vm.tick());

            /* DRAG
            */
            vm.drag = vm.force.drag().on('dragstart', d => d.fixed = true);
            /* DELETION - pressing DEL deletes the selection
            */
            d3.select(window).on('keydown', function () {
                if (d3.event.keyCode === 46) {
                    if (vm.selection != null) {
                        vm.graph.remove(vm.selection);
                        vm.selection = null;

                        return vm.update();
                    }
                }
            });

            this.update();
            this.toolbar();
        }

        /**
         * TOOLBAR
        */
        private toolbar() {
            const toolbar = $("<div class='toolbar'></div>");
            const vm = this;
            const library = $("<div class='library'></div></div>");

            $('body').append(toolbar);

            toolbar.append($(apps.pointer));
            toolbar.append($(apps.add_node));
            toolbar.append($(apps.add_link));
            toolbar.append(library);

            ['X', 'Y', 'Z', 'W'].forEach(function (type) {
                const new_btn = $(buttonHtml(vm, type));

                new_btn.bind('click', function () {
                    vm.graph.add_node(type);
                    return vm.update();
                });
                library.append(new_btn);

                return library.hide();
            });
            vm.tool = 'pointer';
            vm.new_link_source = null;
            vm.vis.on('mousemove.add_link', (function (d) {
                /* check if there is a new link in creation
                */
                if (vm.new_link_source != null) {
                    /* update the draggable link representation
                    */
                    const p = d3.mouse(vm.vis.node());
                    return vm.drag_link.attr('x1', vm.new_link_source.x).attr('y1', vm.new_link_source.y).attr('x2', p[0]).attr('y2', p[1]);
                }
            })).on('mouseup.add_link', (function (d) {
                vm.new_link_source = null;
                /* remove the draggable link representation, if exists
                */
                if (vm.drag_link != null)
                    return vm.drag_link.remove();
            }));

            return d3.selectAll('.tool').on('click', () => vm.tool_click(library));
        }

        private tool_click(library: JQuery<HTMLElement>) {
            const vm = this;

            d3.selectAll('.tool').classed('active', false);
            d3.select(library).classed('active', true);

            const new_tool = $(library).data('tool');
            const nodes = vm.vis.selectAll('.node');

            if (new_tool === 'add_link' && vm.tool !== 'add_link') {
                /* remove drag handlers from nodes
                */
                nodes.on('mousedown.drag', null).on('touchstart.drag', null);
                /* add drag handlers for the add_link tool
                */
                nodes.call(vm.drag_add_link);
            } else if (new_tool !== 'add_link' && vm.tool === 'add_link') {
                /* remove drag handlers for the add_link tool
                */
                nodes.on('mousedown.add_link', null).on('mouseup.add_link', null);
                /* add drag behavior to nodes
                */
                nodes.call(vm.drag);
            }
            if (new_tool === 'add_node') {
                library.show();
            } else {
                library.hide();
            }
            return vm.tool = new_tool;
        }

        /**
         * SELECTION
        */
        private node_click(d) {
            const vm = this;

            vm.selection = d;
            d3.selectAll('.node').classed('selected', d2 => d2 === d);

            return d3.selectAll('.link').classed('selected', false);
        }

        /**
         * SELECTION
        */
        private link_click(d) {
            const vm = this;

            vm.selection = d;
            d3.selectAll('.link').classed('selected', d2 => d2 === d);

            return d3.selectAll('.node').classed('selected', false);
        }

        /**
         * update the layout
        */
        update() {
            const graph = this.graph;
            const vm = this;

            vm.force.nodes(graph.nodes).links(graph.links).start();

            // create nodes and links
            // (links are drawn with insert to make them appear under the nodes)
            // also define a drag behavior to drag nodes
            // dragged nodes become fixed
            const nodes = vm.vis.selectAll('.node').data(graph.nodes, d => d.id);
            const new_nodes = nodes.enter().append('g').attr('class', 'node').on('click', d => vm.node_click(d));
            const links = vm.vis.selectAll('.link').data(graph.links, d => "" + d.source.id + "->" + d.target.id);

            links.enter().insert('line', '.node').attr('class', 'link').on('click', d => vm.link_click(d));
            links.exit().remove();

            // TOOLBAR - add link tool initialization for new nodes
            if (vm.tool === 'add_link') {
                new_nodes.call(this.drag_add_link);
            } else {
                new_nodes.call(vm.drag);
            }

            new_nodes.append('circle').attr('r', 18)
                .attr('stroke', d => vm.colorify(d.type))
                .attr('fill', d => d3.hcl(vm.colorify(d.type)).brighter(3));

            // draw the label            
            new_nodes.append('text')
                .text(d => d.id)
                .attr('dy', '0.35em')
                .attr('fill', d => vm.colorify(d.type));

            return nodes.exit().remove();
        };

        drag_add_link(selection) {
            const vm = this;
            const graph = this.graph;

            return selection.on('mousedown.add_link', (function (d) {

                vm.new_link_source = d;
                // create the draggable link representation

                const p = d3.mouse(vm.vis.node());
                vm.drag_link = vm.vis.insert('line', '.node').attr('class', 'drag_link').attr('x1', d.x).attr('y1', d.y).attr('x2', p[0]).attr('y2', p[1]);
                // prevent pan activation
                d3.event.stopPropagation();
                // prevent text selection
                return d3.event.preventDefault();
            })).on('mouseup.add_link', (function (d) {
                // add link and update, but only if a link is actually added
                if (graph.add_link(vm.new_link_source, d) != null)
                    return vm.update();
            }));
        };

    }
}
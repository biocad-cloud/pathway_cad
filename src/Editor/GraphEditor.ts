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
        private colorify = null;
        private force = null;
        private tool: string;
        private new_link_source = null;
        private drag = null;
        private drag_link = null;

        /* create some fake data
        */

        private graph: graph;

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

            toolbar.append($("<svg\n    class='active tool'\n    data-tool='pointer'\n    xmlns='http://www.w3.org/2000/svg'\n    version='1.1'\n    width='32'\n    height='32'\n    viewBox='0 0 128 128'>\n    <g transform='translate(881.10358,-356.22543)'>\n      <g transform='matrix(0.8660254,-0.5,0.5,0.8660254,-266.51112,-215.31898)'>\n        <path\n           d='m -797.14902,212.29589 a 5.6610848,8.6573169 0 0 0 -4.61823,4.3125 l -28.3428,75.0625 a 5.6610848,8.6573169 0 0 0 4.90431,13 l 56.68561,0 a 5.6610848,8.6573169 0 0 0 4.9043,-13 l -28.3428,-75.0625 a 5.6610848,8.6573169 0 0 0 -5.19039,-4.3125 z m 0.28608,25.96875 18.53419,49.09375 -37.06838,0 18.53419,-49.09375 z'\n        />\n        <path\n           d='m -801.84375,290.40625 c -2.09434,2.1e-4 -3.99979,1.90566 -4,4 l 0,35.25 c 2.1e-4,2.09434 1.90566,3.99979 4,4 l 10,0 c 2.09434,-2.1e-4 3.99979,-1.90566 4,-4 l 0,-35.25 c -2.1e-4,-2.09434 -1.90566,-3.99979 -4,-4 z'\n        />\n      </g>\n    </g>\n</svg>"));
            toolbar.append($("<svg\n    class='tool'\n    data-tool='add_node'\n    xmlns='http://www.w3.org/2000/svg'\n    version='1.1'\n    width='32'\n    height='32'\n    viewBox='0 0 128 128'>\n    <g transform='translate(720.71649,-356.22543)'>\n      <g transform='translate(-3.8571429,146.42857)'>\n        <path\n           d='m -658.27638,248.37149 c -1.95543,0.19978 -3.60373,2.03442 -3.59375,4 l 0,12.40625 -12.40625,0 c -2.09434,2.1e-4 -3.99979,1.90566 -4,4 l 0,10 c -0.007,0.1353 -0.007,0.27095 0,0.40625 0.19978,1.95543 2.03442,3.60373 4,3.59375 l 12.40625,0 0,12.4375 c 2.1e-4,2.09434 1.90566,3.99979 4,4 l 10,0 c 2.09434,-2.1e-4 3.99979,-1.90566 4,-4 l 0,-12.4375 12.4375,0 c 2.09434,-2.1e-4 3.99979,-1.90566 4,-4 l 0,-10 c -2.1e-4,-2.09434 -1.90566,-3.99979 -4,-4 l -12.4375,0 0,-12.40625 c -2.1e-4,-2.09434 -1.90566,-3.99979 -4,-4 l -10,0 c -0.1353,-0.007 -0.27095,-0.007 -0.40625,0 z'\n        />\n        <path\n           d='m -652.84375,213.9375 c -32.97528,0 -59.875,26.86847 -59.875,59.84375 0,32.97528 26.89972,59.875 59.875,59.875 32.97528,0 59.84375,-26.89972 59.84375,-59.875 0,-32.97528 -26.86847,-59.84375 -59.84375,-59.84375 z m 0,14 c 25.40911,0 45.84375,20.43464 45.84375,45.84375 0,25.40911 -20.43464,45.875 -45.84375,45.875 -25.40911,0 -45.875,-20.46589 -45.875,-45.875 0,-25.40911 20.46589,-45.84375 45.875,-45.84375 z'\n        />\n      </g>\n    </g>\n</svg>"));
            toolbar.append($("<svg\n    class='tool'\n    data-tool='add_link'\n    xmlns='http://www.w3.org/2000/svg'\n    version='1.1'\n    width='32'\n    height='32'\n    viewBox='0 0 128 128'>\n<g transform='translate(557.53125,-356.22543)'>\n    <g transform='translate(20,0)'>\n      <path\n         d='m -480.84375,360 c -15.02602,0 -27.375,12.31773 -27.375,27.34375 0,4.24084 1.00221,8.28018 2.75,11.875 l -28.875,28.875 c -3.59505,-1.74807 -7.6338,-2.75 -11.875,-2.75 -15.02602,0 -27.34375,12.34898 -27.34375,27.375 0,15.02602 12.31773,27.34375 27.34375,27.34375 15.02602,0 27.375,-12.31773 27.375,-27.34375 0,-4.26067 -0.98685,-8.29868 -2.75,-11.90625 L -492.75,411.96875 c 3.60156,1.75589 7.65494,2.75 11.90625,2.75 15.02602,0 27.34375,-12.34898 27.34375,-27.375 C -453.5,372.31773 -465.81773,360 -480.84375,360 z m 0,14 c 7.45986,0 13.34375,5.88389 13.34375,13.34375 0,7.45986 -5.88389,13.375 -13.34375,13.375 -7.45986,0 -13.375,-5.91514 -13.375,-13.375 0,-7.45986 5.91514,-13.34375 13.375,-13.34375 z m -65.375,65.34375 c 7.45986,0 13.34375,5.91514 13.34375,13.375 0,7.45986 -5.88389,13.34375 -13.34375,13.34375 -7.45986,0 -13.34375,-5.88389 -13.34375,-13.34375 0,-7.45986 5.88389,-13.375 13.34375,-13.375 z'\n      />\n      <path\n         d='m -484.34375,429.25 c -1.95543,0.19978 -3.60373,2.03442 -3.59375,4 l 0,12.40625 -12.40625,0 c -2.09434,2.1e-4 -3.99979,1.90566 -4,4 l 0,10 c -0.007,0.1353 -0.007,0.27095 0,0.40625 0.19978,1.95543 2.03442,3.60373 4,3.59375 l 12.40625,0 0,12.4375 c 2.1e-4,2.09434 1.90566,3.99979 4,4 l 10,0 c 2.09434,-2.1e-4 3.99979,-1.90566 4,-4 l 0,-12.4375 12.4375,0 c 2.09434,-2.1e-4 3.99979,-1.90566 4,-4 l 0,-10 c -2.1e-4,-2.09434 -1.90566,-3.99979 -4,-4 l -12.4375,0 0,-12.40625 c -2.1e-4,-2.09434 -1.90566,-3.99979 -4,-4 l -10,0 c -0.1353,-0.007 -0.27095,-0.007 -0.40625,0 z'\n      />\n    </g>\n  </g>\n</svg>"));
            toolbar.append(library);

            ['X', 'Y', 'Z', 'W'].forEach(function (type) {
                const new_btn = $("<svg width='42' height='42'>\n    <g class='node'>\n        <circle\n            cx='21'\n            cy='21'\n            r='18'\n            stroke='" + (global.colorify(type)) + "'\n            fill='" + (d3.hcl(global.colorify(type)).brighter(3)) + "'\n        />\n    </g>\n</svg>");
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
                var p;
                if (vm.new_link_source != null) {
                    /* update the draggable link representation
                    */
                    p = d3.mouse(vm.vis.node());
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
            d3.select(this).classed('active', true);

            const new_tool = $(this).data('tool');
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
                var p;
                vm.new_link_source = d;
                /* create the draggable link representation
                */
                p = d3.mouse(vm.vis.node());
                vm.drag_link = vm.vis.insert('line', '.node').attr('class', 'drag_link').attr('x1', d.x).attr('y1', d.y).attr('x2', p[0]).attr('y2', p[1]);
                /* prevent pan activation
                */
                d3.event.stopPropagation();
                /* prevent text selection
                */
                return d3.event.preventDefault();
            })).on('mouseup.add_link', (function (d) {
      /* add link and update, but only if a link is actually added
      */      if (graph.add_link(vm.new_link_source, d) != null) return vm.update();
            }));
        };

    }
}
class graph {
    nodes: node[];
    links?: link[];
    constraints?: constraint[];
    groups?: group[];

    /**
     * resolve node IDs (not optimized at all!)
    */
    public objectify() {
        const vm = this;
        const _ref = vm.links;
        const _results = [];

        for (let _i = 0, _len = _ref.length; _i < _len; _i++) {
            const l = _ref[_i];
            _results.push((function () {
                var _j, _len2, _ref2, _results2;
                _ref2 = vm.nodes;
                _results2 = [];
                for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
                    const n = _ref2[_j];
                    if (l.source === n.id) {
                        l.source = n;
                        continue;
                    }
                    if (l.target === n.id) {
                        l.target = n;
                        continue;
                    } else {
                        _results2.push(void 0);
                    }
                }
                return _results2;
            })());
        }
        return _results;
    }
    remove(condemned) {
      /* remove the given node or link from the graph, also deleting dangling links if a node is removed
      */      if (__indexOf.call(graph.nodes, condemned) >= 0) {
            graph.nodes = graph.nodes.filter(function (n) {
                return n !== condemned;
            });
            return graph.links = graph.links.filter(function (l) {
                return l.source.id !== condemned.id && l.target.id !== condemned.id;
            });
        } else if (__indexOf.call(graph.links, condemned) >= 0) {
            return graph.links = graph.links.filter(function (l) {
                return l !== condemned;
            });
        }
    }
    last_index = 0
    add_node(type) {
        var n;
        n = {
            id: graph.last_index++,
            x: width / 2,
            y: height / 2,
            type: type
        };
        graph.nodes.push(n);
        return n;
    }
    add_link(source, target) {
        /* avoid links to self
        */
        var l, link, _i, _len, _ref;
        if (source === target) return null;
        /* avoid link duplicates
        */
        _ref = graph.links;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            link = _ref[_i];
            if (link.source === source && link.target === target) return null;
        }
        l = {
            source: source,
            target: target
        };
        graph.links.push(l);
        return l;
    }
}

interface node {
    /**
     * the display label text
    */
    label: string
    /**
     * the unique id
    */
    dunnartid: string
    type: string;
    index: number
    width: number
    height: number
    x: number
    y: number
    rx: number
    ry: number
}

interface link {
    source: number;
    target: number;
}

interface constraint {
    axis: "x" | "y";
    offsets: { node: number, offset: number }[];
    type: string;
}

interface group {
    leaves: number[];
    padding: number;
    style: string;
}
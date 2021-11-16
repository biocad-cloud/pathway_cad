class graph {

    nodes: node[];
    links?: link[];
    constraints?: constraint[];
    groups?: group[];

    private last_index: number = 0;

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
    /**
     * remove the given node or link from the graph, also deleting dangling links if a node is removed
    */
    remove(condemned) {
        if (__indexOf.call(this.nodes, condemned) >= 0) {
            this.nodes = this.nodes.filter(n => n !== condemned);
            return this.links = this.links.filter(l => l.source.id !== condemned.id && l.target.id !== condemned.id);
        } else if (__indexOf.call(this.links, condemned) >= 0) {
            return this.links = this.links.filter(l => l !== condemned);
        }
    }

    add_node(type: string): node {
        const n = <node>{
            dunnartid: (this.last_index++).toString(),
            x: 0,
            y: 0,
            type: type
        };
        this.nodes.push(n);
        return n;
    }
    add_link(source: number, target: number) {
        /* avoid links to self
        */
        if (source === target) return null;
        /* avoid link duplicates
        */
        const _ref = this.links;
        for (let _i = 0, _len = _ref.length; _i < _len; _i++) {
            const link = _ref[_i];
            if (link.source === source && link.target === target)
                return null;
        }
        const l = <link>{
            source: source,
            target: target
        };
        this.links.push(l);
        return l;
    }
}
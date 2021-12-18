namespace apps.translation {

    export function translateToColaGraph(graph: apps.Model): Graph {
        const g = <Graph>{
            groups: [],
            constraints: [],
            links: [],
            nodes: []
        }
        const nodeIndex: {} = {};
        const groups: {} = {};

        for (let node of graph.nodeDataArray) {
            if ((!isNullOrUndefined(node.isGroup)) && node.isGroup) {
                groups[node.key.toString()] = <group>{
                    leaves: [],
                    padding: 10,
                    style: "fill:#4db987;fill-opacity:0.31764700000000001;stroke:#4db987;stroke-opacity:1"
                }
            }
        }

        for (let node of graph.nodeDataArray) {
            if ((!isNullOrUndefined(node.isGroup)) && node.isGroup) {
                continue;
            }

            g.nodes.push(<node>{
                dunnartid: (g.nodes.length + 1).toString(),
                height: 40,
                index: g.nodes.length,
                label: node.label,
                rx: 9,
                ry: 9,
                width: 60,
                x: 0,
                y: 0
            });

            nodeIndex[node.key] = g.nodes.length - 1;

            if (!isNullOrUndefined(node.group)) {
                (<group>groups[node.group.toString()]).leaves.push(g.nodes.length - 1);
            }
        }

        for (let link of graph.linkDataArray) {
            g.links.push(<link>{
                source: nodeIndex[link.from],
                target: nodeIndex[link.to]
            });
        }

        for (let name in groups) {
            g.groups.push(groups[name]);
        }

        return g;
    }
}
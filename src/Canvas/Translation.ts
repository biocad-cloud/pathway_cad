namespace apps.translation {

    export function translateToColaGraph(graph: apps.Model): Graph {
        const g = <Graph>{
            groups: [],
            constraints: [],
            links: [],
            nodes: []
        }
        const nodeIndex: {} = {};

        for (let node of graph.nodeDataArray) {
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
        }

        for (let link of graph.linkDataArray) {
            g.links.push(<link>{
                source: nodeIndex[link.from],
                target: nodeIndex[link.to]
            });
        }

        return g;
    }
}
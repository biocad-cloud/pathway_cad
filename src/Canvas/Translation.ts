namespace apps.translation {

    export const paper_colors: string[] = [
        "#D02823", "#0491d0", "#88bb64", "#15DBFF",
        "#583B73", "#f2ce3f", "#8858BF", "#CCFF33",
        "#fb5b44", "#361f32", "#DF2789", "#396b1c"
    ];

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
                const color: string = paper_colors[Object.keys(groups).length];

                groups[node.key.toString()] = <group>{
                    leaves: [],
                    padding: 10,
                    style: `fill:${color};fill-opacity:0.31764700000000001;stroke:${color};stroke-opacity:1`
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
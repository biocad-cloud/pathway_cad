interface graph {
    nodes: node[];
    links?: link[];
    constraints?: constraint[];
    groups?: group[];
}

interface node {
    label: string
    dunnartid: string
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
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
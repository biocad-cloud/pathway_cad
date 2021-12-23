namespace apps {

    const intId = /[-]?\d+/ig;

    function makeSafeSymbol(name: string) {
        if (!name) {
            return null;
        }

        return name
            .toString()
            .replace(".", "_")
            .replace("-", "_")
            .replace("+", "_")
            .replace("*", "_")
            .replace("~", "_");
    }

    export function ModelPatch(model: Model) {
        for (let node of model.nodeDataArray) {
            if (node.isGroup) {
                continue;
            }
            if (Strings.IsPattern(node.key.toString(), intId)) {
                node.key = `T${node.key}`;
            }

            node.key = makeSafeSymbol(node.key);
        }

        for (let link of model.linkDataArray) {
            if (Strings.IsPattern(link.from.toString(), intId)) {
                link.from = `T${link.from}`;
            }
            if (Strings.IsPattern(link.to.toString(), intId)) {
                link.to = `T${link.to}`;
            }

            link.from = makeSafeSymbol(link.from);
            link.to = makeSafeSymbol(link.to);

            if (!isNullOrEmpty(link.labelKeys)) {
                for (let i = 0; i < link.labelKeys.length; i++) {
                    if (Strings.IsPattern(link.labelKeys[i].toString(), intId)) {
                        link.labelKeys[i] = `T${link.labelKeys[i]}`;
                    }

                    link.labelKeys[i] = makeSafeSymbol(link.labelKeys[i]);
                }
            }
        }

        return model;
    }

    export interface Model {
        nodeDataArray: {
            category: "valve" | "stock" | "cloud" | "variable"
            group: string
            key: string
            label: string
            loc: string
            isGroup: boolean
            /**
             * text label of the node element
            */
            text: string 
        }[]
        linkDataArray: {
            category: "flow" | "influence"
            from: string
            labelKeys: string[]
            text: string
            to: string
        }[]
    }
}
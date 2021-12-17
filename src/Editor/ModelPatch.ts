namespace apps {

    const intId = /[-]?\d+/ig;

    function makeSafeSymbol(name: string) {
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
            if (Strings.IsPattern(node.key.toString(), intId)) {
                node.key = `T${node.key}`;
            }
            if (Strings.IsPattern(node.group.toString(), intId)) {
                node.group = `T${node.group}`;
            }

            node.key = makeSafeSymbol(node.key);
            node.group = makeSafeSymbol(node.group);
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
            category: string
            group: string
            key: string
            label: string
            loc: string
        }[]
        linkDataArray: {
            category: string
            from: string
            labelKeys: string[]
            text: string
            to: string
        }[]
    }
}
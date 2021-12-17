namespace apps {

    const intId = /[-]?\d+/ig;

    export function ModelPatch(model: Model) {
        for (let node of model.nodeDataArray) {
            if (Strings.IsPattern(node.key.toString(), intId)) {
                node.key = `T${node.key}`;
            }
        }

        for (let link of model.linkDataArray) {
            if (Strings.IsPattern(link.from.toString(), intId)) {
                link.from = `T${link.from}`;
            }
            if (Strings.IsPattern(link.to.toString(), intId)) {
                link.to = `T${link.to}`;
            }

            if (!isNullOrEmpty(link.labelKeys)) {
                for (let i = 0; i < link.labelKeys.length; i++) {
                    if (Strings.IsPattern(link.labelKeys[i].toString(), intId)) {
                        link.labelKeys[i] = `T${link.labelKeys[i]}`;
                    }
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
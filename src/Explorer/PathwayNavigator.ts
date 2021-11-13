namespace PathwayNavigator {

    export function parseJsTree(kegg_tree: KEGG.brite.IKEGGBrite): jsTree {
        const name = KEGG.brite.parseIDEntry(kegg_tree.name);
        const commonName = name.commonName || "KEGG";

        if (isNullOrEmpty(kegg_tree.children)) {
            return <jsTree>{
                id: name.id,
                text: commonName,
                children: null
            }
        } else {
            return <jsTree>{
                id: name.id,
                text: commonName,
                children: $from(kegg_tree.children)
                    .Select(parseJsTree)
                    .ToArray()
            }
        }
    }
}
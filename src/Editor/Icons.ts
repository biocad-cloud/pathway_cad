namespace apps {

    export function buttonHtml(global: GraphEditor, type: string): string {
        return `
            <svg width='42' height='42'>
                <g class='node'>
                    <circle cx = '21' cy = '21' r = '18'
                        stroke = '${global.colorify(type)}'
                        fill = '${d3.hcl(global.colorify(type)).brighter(3)}'
                    />
                </g>
            </svg>
        `;
    }
}
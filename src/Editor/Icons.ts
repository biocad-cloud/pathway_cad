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

    export const add_link: string = `
        <svg class='tool' data-tool='add_link' xmlns='http://www.w3.org/2000/svg' version='1.1' width='32' height='32' viewBox='0 0 128 128'>
            <g transform='translate(557.53125,-356.22543)'>
                <g transform='translate(20,0)'>
                    <path d='m -480.84375,360 c -15.02602,0 -27.375,12.31773 -27.375,27.34375 0,4.24084 1.00221,8.28018 2.75,11.875 l -28.875,28.875 c -3.59505,-1.74807 -7.6338,-2.75 -11.875,-2.75 -15.02602,0 -27.34375,12.34898 -27.34375,27.375 0,15.02602 12.31773,27.34375 27.34375,27.34375 15.02602,0 27.375,-12.31773 27.375,-27.34375 0,-4.26067 -0.98685,-8.29868 -2.75,-11.90625 L -492.75,411.96875 c 3.60156,1.75589 7.65494,2.75 11.90625,2.75 15.02602,0 27.34375,-12.34898 27.34375,-27.375 C -453.5,372.31773 -465.81773,360 -480.84375,360 z m 0,14 c 7.45986,0 13.34375,5.88389 13.34375,13.34375 0,7.45986 -5.88389,13.375 -13.34375,13.375 -7.45986,0 -13.375,-5.91514 -13.375,-13.375 0,-7.45986 5.91514,-13.34375 13.375,-13.34375 z m -65.375,65.34375 c 7.45986,0 13.34375,5.91514 13.34375,13.375 0,7.45986 -5.88389,13.34375 -13.34375,13.34375 -7.45986,0 -13.34375,-5.88389 -13.34375,-13.34375 0,-7.45986 5.88389,-13.375 13.34375,-13.375 z'/>
                    <path d='m -484.34375,429.25 c -1.95543,0.19978 -3.60373,2.03442 -3.59375,4 l 0,12.40625 -12.40625,0 c -2.09434,2.1e-4 -3.99979,1.90566 -4,4 l 0,10 c -0.007,0.1353 -0.007,0.27095 0,0.40625 0.19978,1.95543 2.03442,3.60373 4,3.59375 l 12.40625,0 0,12.4375 c 2.1e-4,2.09434 1.90566,3.99979 4,4 l 10,0 c 2.09434,-2.1e-4 3.99979,-1.90566 4,-4 l 0,-12.4375 12.4375,0 c 2.09434,-2.1e-4 3.99979,-1.90566 4,-4 l 0,-10 c -2.1e-4,-2.09434 -1.90566,-3.99979 -4,-4 l -12.4375,0 0,-12.40625 c -2.1e-4,-2.09434 -1.90566,-3.99979 -4,-4 l -10,0 c -0.1353,-0.007 -0.27095,-0.007 -0.40625,0 z'/>
                </g>
            </g>
        </svg>
    `;

    export const add_node: string = `
        <svg class='tool' data-tool='add_node' xmlns='http://www.w3.org/2000/svg' version='1.1' width='32' height='32' viewBox='0 0 128 128'>
            <g transform='translate(720.71649,-356.22543)'>
                <g transform='translate(-3.8571429,146.42857)'>
                    <path d='m -658.27638,248.37149 c -1.95543,0.19978 -3.60373,2.03442 -3.59375,4 l 0,12.40625 -12.40625,0 c -2.09434,2.1e-4 -3.99979,1.90566 -4,4 l 0,10 c -0.007,0.1353 -0.007,0.27095 0,0.40625 0.19978,1.95543 2.03442,3.60373 4,3.59375 l 12.40625,0 0,12.4375 c 2.1e-4,2.09434 1.90566,3.99979 4,4 l 10,0 c 2.09434,-2.1e-4 3.99979,-1.90566 4,-4 l 0,-12.4375 12.4375,0 c 2.09434,-2.1e-4 3.99979,-1.90566 4,-4 l 0,-10 c -2.1e-4,-2.09434 -1.90566,-3.99979 -4,-4 l -12.4375,0 0,-12.40625 c -2.1e-4,-2.09434 -1.90566,-3.99979 -4,-4 l -10,0 c -0.1353,-0.007 -0.27095,-0.007 -0.40625,0 z'/>
                    <path d='m -652.84375,213.9375 c -32.97528,0 -59.875,26.86847 -59.875,59.84375 0,32.97528 26.89972,59.875 59.875,59.875 32.97528,0 59.84375,-26.89972 59.84375,-59.875 0,-32.97528 -26.86847,-59.84375 -59.84375,-59.84375 z m 0,14 c 25.40911,0 45.84375,20.43464 45.84375,45.84375 0,25.40911 -20.43464,45.875 -45.84375,45.875 -25.40911,0 -45.875,-20.46589 -45.875,-45.875 0,-25.40911 20.46589,-45.84375 45.875,-45.84375 z'/>
                </g>
            </g>
        </svg>
    `;

    export const pointer: string = `
        <svg class='active tool' data-tool='pointer' xmlns='http://www.w3.org/2000/svg' version='1.1' width='32' height='32' viewBox='0 0 128 128'>
            <g transform='translate(881.10358,-356.22543)'>
                <g transform='matrix(0.8660254,-0.5,0.5,0.8660254,-266.51112,-215.31898)'>
                    <path d='m -797.14902,212.29589 a 5.6610848,8.6573169 0 0 0 -4.61823,4.3125 l -28.3428,75.0625 a 5.6610848,8.6573169 0 0 0 4.90431,13 l 56.68561,0 a 5.6610848,8.6573169 0 0 0 4.9043,-13 l -28.3428,-75.0625 a 5.6610848,8.6573169 0 0 0 -5.19039,-4.3125 z m 0.28608,25.96875 18.53419,49.09375 -37.06838,0 18.53419,-49.09375 z'/>
                    <path d='m -801.84375,290.40625 c -2.09434,2.1e-4 -3.99979,1.90566 -4,4 l 0,35.25 c 2.1e-4,2.09434 1.90566,3.99979 4,4 l 10,0 c 2.09434,-2.1e-4 3.99979,-1.90566 4,-4 l 0,-35.25 c -2.1e-4,-2.09434 -1.90566,-3.99979 -4,-4 z'/>
                </g>
            </g>
        </svg>
    `;
}
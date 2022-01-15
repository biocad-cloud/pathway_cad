namespace Editor.layouts {

    export class circle {

        public constructor(public editor: apps.FlowEditor) { }

        generateCircle() {
            const myDiagram = this.editor.goCanvas;
            const vm = this;

            myDiagram.startTransaction("generateCircle");
            myDiagram.startTransaction("change Layout");
            // force a diagram layout
            vm.layout();
            myDiagram.commitTransaction("change Layout");
            myDiagram.commitTransaction("generateCircle");
        }

        /**
         * Update the layout from the controls, and then perform the layout again
        */
        layout() {
            const myDiagram = this.editor.goCanvas;
            const lay = myDiagram.layout;

            lay.radius = circle.radiusValue("NaN");
            lay.aspectRatio = 1;
            lay.startAngle = 0;
            lay.sweepAngle = 360;
            lay.spacing = 6;
            lay.arrangement = circle.mapArrangement(this.getArrangementValue());
            lay.nodeDiameterFormula = circle.mapDiamFormula(this.getRadioValue());
            lay.direction = circle.mapDirection(this.getDirectionValue());
            lay.sorting = circle.mapSorting(this.getSortValue());

            console.log(lay);
        }

        public static radiusValue(radius) {
            if (radius !== "NaN") {
                return parseFloat(radius, 10);
            } else {
                return NaN
            };
        }

        public static mapSorting(sorting: "Forwards" | "Reverse" | "Ascending" | "Descending" | "Optimized") {
            switch (sorting) {
                case "Forwards": return go.CircularLayout.Forwards;
                case "Reverse": return go.CircularLayout.Reverse;
                case "Ascending": return go.CircularLayout.Ascending;
                case "Descending": return go.CircularLayout.Descending;
                case "Optimized": return go.CircularLayout.Optimized;

                default:
                    throw `invalid option: ${sorting}!`;
            }
        }

        public static mapDirection(direction: "Clockwise" | "Counterclockwise" | "BidirectionalLeft" | "BidirectionalRight") {
            switch (direction) {
                case "Clockwise": return go.CircularLayout.Clockwise;
                case "Counterclockwise": return go.CircularLayout.Counterclockwise;
                case "BidirectionalLeft": return go.CircularLayout.BidirectionalLeft;
                case "BidirectionalRight": return go.CircularLayout.BidirectionalRight;

                default:
                    throw `invalid option: ${direction}!`;
            }
        }

        public static mapDiamFormula(diamFormula: "Pythagorean" | "Circular") {
            if (diamFormula === "Pythagorean") {
                return go.CircularLayout.Pythagorean;
            } else if (diamFormula === "Circular") {
                return go.CircularLayout.Circular;
            } else {
                throw `invalid option value: ${diamFormula}!`;
            }
        }

        public static mapArrangement(arrangement: "ConstantDistance" | "ConstantAngle" | "ConstantSpacing" | "Packed") {
            switch (arrangement) {
                case "ConstantDistance": return go.CircularLayout.ConstantDistance;
                case "ConstantAngle": return go.CircularLayout.ConstantAngle;
                case "ConstantSpacing": return go.CircularLayout.ConstantSpacing;
                case "Packed": return go.CircularLayout.Packed;

                default:
                    throw `invalid option: ${arrangement}!`;
            }
        }

        getSortValue(): "Forwards" | "Reverse" | "Ascending" | "Descending" | "Optimized" {
            return "Forwards";
        }

        getDirectionValue(): "Clockwise" | "Counterclockwise" | "BidirectionalLeft" | "BidirectionalRight" {
            return "Clockwise";
        }

        getArrangementValue(): "ConstantDistance" | "ConstantAngle" | "ConstantSpacing" | "Packed" {
            return "ConstantSpacing";
        }

        getRadioValue(): "Pythagorean" | "Circular" {
            return "Circular";
        }
    }
}
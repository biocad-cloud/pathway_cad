namespace Editor.layouts {

    export class circle {

        public constructor(public editor: apps.FlowEditor) { }

        generateCircle() {
            const myDiagram = this.editor.goCanvas;
            const vm = this;

            myDiagram.startTransaction("generateCircle");
            // force a diagram layout
            vm.layout();
            myDiagram.commitTransaction("generateCircle");
        }

        /**
         * Update the layout from the controls, and then perform the layout again
        */
        layout() {
            const myDiagram = this.editor.goCanvas;

            myDiagram.startTransaction("change Layout");

            var lay = myDiagram.layout;

            var radius: string | number = "NaN"
            if (radius !== "NaN") radius = parseFloat(radius, 10);
            else radius = NaN;
            lay.radius = radius;

            var aspectRatio = 1;
            lay.aspectRatio = aspectRatio;

            var startAngle = 0;
            lay.startAngle = startAngle;

            var sweepAngle = 360
            lay.sweepAngle = sweepAngle;

            var spacing = 6
            lay.spacing = spacing;

            var arrangement = this.getArrangementValue();
            if (arrangement === "ConstantDistance") lay.arrangement = go.CircularLayout.ConstantDistance;
            else if (arrangement === "ConstantAngle") lay.arrangement = go.CircularLayout.ConstantAngle;
            else if (arrangement === "ConstantSpacing") lay.arrangement = go.CircularLayout.ConstantSpacing;
            else if (arrangement === "Packed") lay.arrangement = go.CircularLayout.Packed;

            var diamFormula = this.getRadioValue();
            if (diamFormula === "Pythagorean") lay.nodeDiameterFormula = go.CircularLayout.Pythagorean;
            else if (diamFormula === "Circular") lay.nodeDiameterFormula = go.CircularLayout.Circular;

            var direction = this.getDirectionValue();
            if (direction === "Clockwise") lay.direction = go.CircularLayout.Clockwise;
            else if (direction === "Counterclockwise") lay.direction = go.CircularLayout.Counterclockwise;
            else if (direction === "BidirectionalLeft") lay.direction = go.CircularLayout.BidirectionalLeft;
            else if (direction === "BidirectionalRight") lay.direction = go.CircularLayout.BidirectionalRight;

            var sorting = this.getSortValue();
            if (sorting === "Forwards") lay.sorting = go.CircularLayout.Forwards;
            else if (sorting === "Reverse") lay.sorting = go.CircularLayout.Reverse;
            else if (sorting === "Ascending") lay.sorting = go.CircularLayout.Ascending;
            else if (sorting === "Descending") lay.sorting = go.CircularLayout.Descending;
            else if (sorting === "Optimized") lay.sorting = go.CircularLayout.Optimized;

            myDiagram.commitTransaction("change Layout");
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
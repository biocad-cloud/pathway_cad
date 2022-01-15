namespace Editor.layouts {

    export class circle {

        public constructor(public editor: apps.FlowEditor) { }

        generateCircle(numNodes, width, height, minLinks, maxLinks, randSizes, circ, cyclic) {
            const myDiagram = this.editor.goCanvas;
            const vm = this;

            myDiagram.startTransaction("generateCircle");

            // replace the diagram's model's nodeDataArray
            vm.generateNodes(numNodes, width, height, randSizes, circ);
            // replace the diagram's model's linkDataArray
            vm.generateLinks(minLinks, maxLinks, cyclic);
            // force a diagram layout
            vm.layout();

            myDiagram.commitTransaction("generateCircle");
        }

        generateNodes(numNodes, width, height, randSizes, circ) {
            const nodeArray = [];
            const myDiagram = this.editor.goCanvas;

            for (var i = 0; i < numNodes; i++) {
                var size;
                if (randSizes) {
                    size = new go.Size(Math.floor(Math.random() * (65 - width + 1)) + width, Math.floor(Math.random() * (65 - height + 1)) + height);
                } else {
                    size = new go.Size(width, height);
                }

                if (circ) size.height = size.width;

                var figure = "Rectangle";
                if (circ) figure = "Ellipse";

                nodeArray.push({
                    key: i,
                    text: i.toString(),
                    figure: figure,
                    fill: go.Brush.randomColor(),
                    size: size
                });
            }

            // randomize the data, to help demonstrate sorting
            for (i = 0; i < nodeArray.length; i++) {
                var swap = Math.floor(Math.random() * nodeArray.length);
                var temp = nodeArray[swap];
                nodeArray[swap] = nodeArray[i];
                nodeArray[i] = temp;
            }

            // set the nodeDataArray to this array of objects
            myDiagram.model.nodeDataArray = nodeArray;
        }

        generateLinks(min, max, cyclic) {
            const myDiagram = this.editor.goCanvas;

            if (myDiagram.nodes.count < 2) return;
            var linkArray = [];
            var nit = myDiagram.nodes;
            var nodes = new go.List(/*go.Node*/);
            nodes.addAll(nit);
            var num = nodes.length;
            if (cyclic) {
                for (var i = 0; i < num; i++) {
                    if (i >= num - 1) {
                        linkArray.push({ from: i, to: 0 });
                    } else {
                        linkArray.push({ from: i, to: i + 1 });
                    }
                }
            } else {
                if (isNaN(min) || min < 0) min = 0;
                if (isNaN(max) || max < min) max = min;
                for (var i = 0; i < num; i++) {
                    var next = nodes.get(i);
                    var children = Math.floor(Math.random() * (max - min + 1)) + min;
                    for (var j = 1; j <= children; j++) {
                        var to = nodes.get(Math.floor(Math.random() * num));
                        // get keys from the Node.text strings
                        var nextKey = parseInt(next.text, 10);
                        var toKey = parseInt(to.text, 10);
                        if (nextKey !== toKey) {
                            linkArray.push({ from: nextKey, to: toKey });
                        }
                    }
                }
            }

            myDiagram.model.linkDataArray = linkArray;
        }

        /**
         * Update the layout from the controls, and then perform the layout again
        */
        layout() {
            const myDiagram = this.editor.goCanvas;

            myDiagram.startTransaction("change Layout");

            var lay = myDiagram.layout;

            var radius = "NaN"
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
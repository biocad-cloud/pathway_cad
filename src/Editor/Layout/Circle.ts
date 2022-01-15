namespace Editor.layouts {

    export class circle {

        public constructor(public myDiagram) {
        }

        generateCircle(numNodes, width, height, minLinks, maxLinks, randSizes, circ, cyclic) {
            const vm = this;

            vm.myDiagram.startTransaction("generateCircle");
            // replace the diagram's model's nodeDataArray
            vm.generateNodes(numNodes, width, height, randSizes, circ);
            // replace the diagram's model's linkDataArray
            vm.generateLinks(minLinks, maxLinks, cyclic);
            // force a diagram layout
            vm.layout();
            vm.myDiagram.commitTransaction("generateCircle");
        }

        generateNodes(numNodes, width, height, randSizes, circ) {
            var nodeArray = [];
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
            this.myDiagram.model.nodeDataArray = nodeArray;
        }

        generateLinks(min, max, cyclic) {
            if (this.myDiagram.nodes.count < 2) return;
            var linkArray = [];
            var nit = this.myDiagram.nodes;
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
            this.myDiagram.model.linkDataArray = linkArray;
        }

        /**
         * Update the layout from the controls, and then perform the layout again
        */ 
        layout() {
            this.myDiagram.startTransaction("change Layout");
            var lay = this.myDiagram.layout;

            var radius = document.getElementById("radius").value;
            if (radius !== "NaN") radius = parseFloat(radius, 10);
            else radius = NaN;
            lay.radius = radius;

            var aspectRatio = document.getElementById("aspectRatio").value;
            aspectRatio = parseFloat(aspectRatio, 10);
            lay.aspectRatio = aspectRatio;

            var startAngle = document.getElementById("startAngle").value;
            startAngle = parseFloat(startAngle, 10);
            lay.startAngle = startAngle;

            var sweepAngle = document.getElementById("sweepAngle").value;
            sweepAngle = parseFloat(sweepAngle, 10);
            lay.sweepAngle = sweepAngle;

            var spacing = document.getElementById("spacing").value;
            spacing = parseFloat(spacing, 10);
            lay.spacing = spacing;

            var arrangement = document.getElementById("arrangement").value;
            if (arrangement === "ConstantDistance") lay.arrangement = go.CircularLayout.ConstantDistance;
            else if (arrangement === "ConstantAngle") lay.arrangement = go.CircularLayout.ConstantAngle;
            else if (arrangement === "ConstantSpacing") lay.arrangement = go.CircularLayout.ConstantSpacing;
            else if (arrangement === "Packed") lay.arrangement = go.CircularLayout.Packed;

            var diamFormula = this.getRadioValue("diamFormula");
            if (diamFormula === "Pythagorean") lay.nodeDiameterFormula = go.CircularLayout.Pythagorean;
            else if (diamFormula === "Circular") lay.nodeDiameterFormula = go.CircularLayout.Circular;

            var direction = document.getElementById("direction").value;
            if (direction === "Clockwise") lay.direction = go.CircularLayout.Clockwise;
            else if (direction === "Counterclockwise") lay.direction = go.CircularLayout.Counterclockwise;
            else if (direction === "BidirectionalLeft") lay.direction = go.CircularLayout.BidirectionalLeft;
            else if (direction === "BidirectionalRight") lay.direction = go.CircularLayout.BidirectionalRight;

            var sorting = document.getElementById("sorting").value;
            if (sorting === "Forwards") lay.sorting = go.CircularLayout.Forwards;
            else if (sorting === "Reverse") lay.sorting = go.CircularLayout.Reverse;
            else if (sorting === "Ascending") lay.sorting = go.CircularLayout.Ascending;
            else if (sorting === "Descending") lay.sorting = go.CircularLayout.Descending;
            else if (sorting === "Optimized") lay.sorting = go.CircularLayout.Optimized;

            this.myDiagram.commitTransaction("change Layout");
        }

        getRadioValue(name) {
            var radio = document.getElementsByName(name);
            for (var i = 0; i < radio.length; i++)
                if (radio[i].checked) return radio[i].value;
        }
    }
}
namespace apps {

    export class FlowEditor extends Bootstrap {

        public get appName(): string {
            return "FlowEditor";
        }

        /**
         * SD is a global variable, to avoid polluting global namespace and to make the global
         * nature of the individual variables obvious.
        */
        readonly SD = {
            mode: "pointer",   // Set to default mode.  Alternatives are "node" and "link", for
            // adding a new node or a new link respectively.
            itemType: "pointer",    // Set when user clicks on a node or link button.
            nodeCounter: { stock: 0, cloud: 0, variable: 0, valve: 0 }
        };
        private myDiagram;   // Declared as global

        private config() {
            const SD = this.SD;
            const vm = this;

            return {
                "undoManager.isEnabled": true,
                "allowLink": false,  // linking is only started via buttons, not modelessly
                "animationManager.isEnabled": false,

                "linkingTool.portGravity": 0,  // no snapping while drawing new links
                "linkingTool.doActivate": function () {
                    // change the curve of the LinkingTool.temporaryLink
                    this.temporaryLink.curve = (SD.itemType === "flow") ? go.Link.Normal : go.Link.Bezier;
                    this.temporaryLink.path.stroke = (SD.itemType === "flow") ? "blue" : "green";
                    this.temporaryLink.path.strokeWidth = (SD.itemType === "flow") ? 5 : 1;
                    go.LinkingTool.prototype.doActivate.call(this);
                },
                // override the link creation process
                "linkingTool.insertLink": function (fromnode, fromport, tonode, toport) {
                    // to control what kind of Link is created,
                    // change the LinkingTool.archetypeLinkData's category
                    vm.myDiagram.model.setCategoryForLinkData(this.archetypeLinkData, SD.itemType);
                    // Whenever a new Link is drawng by the LinkingTool, it also adds a node data object
                    // that acts as the label node for the link, to allow links to be drawn to/from the link.
                    this.archetypeLabelNodeData = (SD.itemType === "flow") ? { category: "valve" } : null;
                    // also change the text indicating the condition, which the user can edit
                    this.archetypeLinkData.text = SD.itemType;
                    return go.LinkingTool.prototype.insertLink.call(this, fromnode, fromport, tonode, toport);
                },

                "clickCreatingTool.archetypeNodeData": {},  // enable ClickCreatingTool
                "clickCreatingTool.isDoubleClick": false,   // operates on a single click in background
                "clickCreatingTool.canStart": function () {  // but only in "node" creation mode
                    return SD.mode === "node" && go.ClickCreatingTool.prototype.canStart.call(this);
                },
                "clickCreatingTool.insertPart": function (loc) {  // customize the data for the new node
                    SD.nodeCounter[SD.itemType] += 1;
                    var newNodeId = SD.itemType + SD.nodeCounter[SD.itemType];
                    this.archetypeNodeData = {
                        key: newNodeId,
                        category: SD.itemType,
                        label: newNodeId
                    };
                    return go.ClickCreatingTool.prototype.insertPart.call(this, loc);
                }
            }
        }

        init() {
            const $: any = go.GraphObject.make;
            const SD = this.SD;
            const vm = this;
            const myDiagram = vm.myDiagram = $(go.Diagram, "myDiagram", vm.config());

            // install the NodeLabelDraggingTool as a "mouse move" tool
            myDiagram.toolManager.mouseMoveTools.insertAt(0, new NodeLabelDraggingTool());

            // when the document is modified, add a "*" to the title and enable the "Save" button
            myDiagram.addDiagramListener("Modified", function (e) {
                var button = document.getElementById("SaveButton");
                if (button) button.disabled = !myDiagram.isModified;
                var idx = document.title.indexOf("*");
                if (myDiagram.isModified) {
                    if (idx < 0) document.title += "*";
                } else {
                    if (idx >= 0) document.title = document.title.substr(0, idx);
                }
            });

            // generate unique label for valve on newly-created flow link
            myDiagram.addDiagramListener("LinkDrawn", function (e) {
                var link = e.subject;
                if (link.category === "flow") {
                    myDiagram.startTransaction("updateNode");
                    SD.nodeCounter.valve += 1;
                    var newNodeId = "flow" + SD.nodeCounter.valve;
                    var labelNode = link.labelNodes.first();
                    myDiagram.model.setDataProperty(labelNode.data, "label", newNodeId);
                    myDiagram.commitTransaction("updateNode");
                }
            });

            this.buildTemplates();
            this.load();
        }

        buildTemplates() {
            const $ = go.GraphObject.make;
            const myDiagram = this.myDiagram;

            // Node templates
            myDiagram.nodeTemplateMap.add("stock",
                $(go.Node, EditorTemplates.nodeStyle(),
                    $(go.Shape, EditorTemplates.shapeStyle(),
                        { desiredSize: new go.Size(50, 30) }),
                    $(go.TextBlock, EditorTemplates.textStyle(),
                        {
                            _isNodeLabel: true,  // declare draggable by NodeLabelDraggingTool
                            alignment: new go.Spot(0.5, 0.5, 0, 30)    // initial value
                        },
                        new go.Binding("alignment", "label_offset", go.Spot.parse).makeTwoWay(go.Spot.stringify))
                ));

            myDiagram.nodeTemplateMap.add("cloud",
                $(go.Node, EditorTemplates.nodeStyle(),
                    $(go.Shape, EditorTemplates.shapeStyle(),
                        {
                            figure: "Cloud",
                            desiredSize: new go.Size(35, 35)
                        })
                ));

            myDiagram.nodeTemplateMap.add("valve",
                $(go.Node, EditorTemplates.nodeStyle(), {
                    movable: false,
                    layerName: "Foreground",
                    alignmentFocus: go.Spot.None
                },
                    $(go.Shape, EditorTemplates.shapeStyle(), {
                        figure: "Ellipse",
                        desiredSize: new go.Size(20, 20)
                    }),
                    $(go.TextBlock, EditorTemplates.textStyle(), {
                        _isNodeLabel: true,  // declare draggable by NodeLabelDraggingTool
                        alignment: new go.Spot(0.5, 0.5, 0, 20)    // initial value
                    },
                        new go.Binding("alignment", "label_offset", go.Spot.parse).makeTwoWay(go.Spot.stringify))
                ));

            myDiagram.nodeTemplateMap.add("variable",
                $(go.Node, EditorTemplates.nodeStyle(), { type: go.Panel.Auto },
                    $(go.TextBlock, EditorTemplates.textStyle(), { isMultiline: false }),
                    $(go.Shape, EditorTemplates.shapeStyle(),
                        // the port is in front and transparent, even though it goes around the text;
                        // in "link" mode will support drawing a new link
                        { isPanelMain: true, stroke: null, fill: "transparent" })
                ));

            // Link templates
            myDiagram.linkTemplateMap.add("flow",
                $(go.Link, { toShortLength: 8 },
                    $(go.Shape, { stroke: "blue", strokeWidth: 5 }),
                    $(go.Shape, {
                        fill: "blue",
                        stroke: null,
                        toArrow: "Standard",
                        scale: 2.5
                    })
                ));

            myDiagram.linkTemplateMap.add("influence",
                $(go.Link, { curve: go.Link.Bezier, toShortLength: 8 },
                    $(go.Shape, { stroke: "green", strokeWidth: 1.5 }),
                    $(go.Shape, {
                        fill: "green",
                        stroke: null,
                        toArrow: "Standard",
                        scale: 1.5
                    })
                ));
        }

        setMode(mode, itemType) {
            const myDiagram = this.myDiagram;
            const SD = this.SD;

            myDiagram.startTransaction();
            document.getElementById(SD.itemType).className = SD.mode + "_normal";
            document.getElementById(itemType).className = mode + "_selected";
            SD.mode = mode;
            SD.itemType = itemType;
            if (mode === "pointer") {
                myDiagram.allowLink = false;
                myDiagram.nodes.each(function (n) { n.port.cursor = ""; });
            } else if (mode === "node") {
                myDiagram.allowLink = false;
                myDiagram.nodes.each(function (n) { n.port.cursor = ""; });
            } else if (mode === "link") {
                myDiagram.allowLink = true;
                myDiagram.nodes.each(function (n) { n.port.cursor = "pointer"; });
            }
            myDiagram.commitTransaction("mode changed");
        }

        // Show the diagram's model in JSON format that the user may edit
        save() {
            const myDiagram = this.myDiagram;
            const modelJson = myDiagram.model.toJson();

            myDiagram.isModified = false;
        }

        load() {
            this.myDiagram.model = go.Model.fromJson($ts.text("#demo-system"));
        }

        //#region "button events"
        public pointer_click() {
            this.setMode('pointer', 'pointer');
        }

        public stock_click() {
            this.setMode('node', 'stock');
        }

        public cloud_click() {
            this.setMode('node', 'cloud');
        }

        public variable_click() {
            this.setMode('node', 'variable');
        }

        public flow_click() {
            this.setMode('link', 'flow');
        }

        public influence_click() {
            this.setMode('link', 'influence');
        }

        /**
         * save the current dynamics system
        */
        public run_click() {
            const myDiagram = this.myDiagram;
            const modelJson = myDiagram.model.toJson();
            const vm = this;
            const payload = {
                guid: $ts("@guid"),
                model: JSON.parse(modelJson),
                type: "dynamics"
            };

            myDiagram.isModified = false;

            // save model at first
            $ts.post("@api:save", payload, function (resp) {
                if (resp.code != 0) {
                    console.error(resp.info);
                } else {
                    // and then run model
                    vm.doRunModel(<any>resp.info);
                }
            });
        }

        private doRunModel(guid: string) {
            $ts.post(`@api:run/?run=${guid}`, { guid: guid }, function (resp) {
                if (resp.code != 0) {
                    console.error(resp.info);
                } else {
                    $goto(resp.url);
                }
            });
        }
        //#end region
    }
}
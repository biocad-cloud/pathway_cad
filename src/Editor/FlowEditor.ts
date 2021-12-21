namespace apps {

    export class FlowEditor extends Bootstrap {

        public get appName(): string {
            return "FlowEditor";
        }

        /**
         * SD is a global variable, to avoid polluting global namespace 
         * and to make the global nature of the individual variables 
         * obvious.
        */
        readonly SD = {
            /**
             * Set to default mode.  Alternatives are 
             * "node" and "link", for adding a new node 
             * or a new link respectively.
            */
            mode: "pointer",
            /**
             * Set when user clicks on a node or link 
             * button.
            */
            itemType: "pointer",
            nodeCounter: { stock: 0, cloud: 0, variable: 0, valve: 0 }
        };

        /**
         * Declared as global
        */
        private goCanvas: {
            toolManager: {
                mouseMoveTools
            },
            addDiagramListener,
            model,
            isModified: boolean,
            startTransaction,
            commitTransaction,
            nodeTemplateMap,
            linkTemplateMap,
            groupTemplate,
            allowLink,
            nodes: { each }
        };

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
                    vm.goCanvas.model.setCategoryForLinkData(this.archetypeLinkData, SD.itemType);
                    // Whenever a new Link is drawng by the LinkingTool, it also adds a node data object
                    // that acts as the label node for the link, to allow links to be drawn to/from the link.
                    this.archetypeLabelNodeData = (SD.itemType === "flow") ? { category: "valve" } : null;
                    // also change the text indicating the condition, which the user can edit
                    this.archetypeLinkData.text = SD.itemType;

                    return go.LinkingTool.prototype.insertLink.call(this, fromnode, fromport, tonode, toport);
                },

                "clickCreatingTool.archetypeNodeData": {},   // enable ClickCreatingTool
                // allow Ctrl-G to call groupSelection()
                "commandHandler.archetypeGroupData": { text: "Group", isGroup: true, color: "blue" },
                "clickCreatingTool.isDoubleClick": false,    // operates on a single click in background
                "clickCreatingTool.canStart": function () {  // but only in "node" creation mode
                    return SD.mode === "node" && go.ClickCreatingTool.prototype.canStart.call(this);
                },
                "clickCreatingTool.insertPart": function (loc) {
                    // customize the data for the new node
                    SD.nodeCounter[SD.itemType] += 1;
                    const newNodeId = SD.itemType + SD.nodeCounter[SD.itemType];

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

            vm.goCanvas = $(go.Diagram, "myDiagram", vm.config());

            const myDiagram = vm.goCanvas;

            // install the NodeLabelDraggingTool as a "mouse move" tool
            myDiagram.toolManager.mouseMoveTools.insertAt(0, new NodeLabelDraggingTool());

            // when the document is modified, add a "*" to the title and enable the "Save" button
            myDiagram.addDiagramListener("Modified", function (e) {
                const button = document.getElementById("SaveButton");
                const idx = document.title.indexOf("*");

                if (button) button.disabled = !myDiagram.isModified;

                if (myDiagram.isModified) {
                    if (idx < 0) document.title += "*";
                } else {
                    if (idx >= 0) document.title = document.title.substr(0, idx);
                }
            });

            // generate unique label for valve on newly-created flow link
            myDiagram.addDiagramListener("LinkDrawn", function (e) {
                const link = e.subject;

                if (link.category === "flow") {
                    myDiagram.startTransaction("updateNode");
                    SD.nodeCounter.valve += 1;

                    const newNodeId = "flow" + SD.nodeCounter.valve;
                    const labelNode = link.labelNodes.first();

                    myDiagram.model.setDataProperty(labelNode.data, "label", newNodeId);
                    myDiagram.commitTransaction("updateNode");
                }
            });

            this.buildTemplates();
            this.load();
        }

        buildTemplates() {
            const $ = go.GraphObject.make;
            const myDiagram = this.goCanvas;

            // Node templates
            myDiagram.nodeTemplateMap.add("stock",
                $(go.Node, EditorTemplates.nodeStyle(),
                    $(go.Shape, EditorTemplates.shapeStyle(), { desiredSize: new go.Size(50, 30) }),
                    // declare draggable by NodeLabelDraggingTool
                    // initial value
                    $(go.TextBlock, EditorTemplates.textStyle(), {
                        _isNodeLabel: true, alignment: new go.Spot(0.5, 0.5, 0, 30)
                    },
                        new go.Binding("alignment", "label_offset", go.Spot.parse).makeTwoWay(go.Spot.stringify))
                ));

            myDiagram.nodeTemplateMap.add("cloud",
                $(go.Node, EditorTemplates.nodeStyle(),
                    $(go.Shape, EditorTemplates.shapeStyle(), { figure: "Cloud", desiredSize: new go.Size(35, 35) })
                ));

            myDiagram.nodeTemplateMap.add("valve",
                $(go.Node, EditorTemplates.nodeStyle(), {
                    movable: false,
                    layerName: "Foreground",
                    alignmentFocus: go.Spot.None
                },
                    $(go.Shape, EditorTemplates.shapeStyle(), { figure: "Ellipse", desiredSize: new go.Size(5, 5) }),
                    $(go.TextBlock, EditorTemplates.textStyle(), {
                        _isNodeLabel: true,  // declare draggable by NodeLabelDraggingTool
                        alignment: new go.Spot(0.5, 0.5, 0, 20)    // initial value
                    },
                        new go.Binding("alignment", "label_offset", go.Spot.parse).makeTwoWay(go.Spot.stringify))
                ));

            myDiagram.nodeTemplateMap.add("variable",
                $(go.Node, EditorTemplates.nodeStyle(), { type: go.Panel.Auto },
                    $(go.TextBlock, EditorTemplates.textStyle(), { isMultiline: false }),
                    // the port is in front and transparent, even though it goes around the text;
                    // in "link" mode will support drawing a new link
                    $(go.Shape, EditorTemplates.shapeStyle(), { isPanelMain: true, stroke: null, fill: "transparent" })
                ));

            // Link templates
            myDiagram.linkTemplateMap.add("flow",
                $(go.Link, { toShortLength: 8 },
                    $(go.Shape, { stroke: "blue", strokeWidth: 5 }),
                    $(go.Shape, { fill: "blue", stroke: null, toArrow: "Standard", scale: 2.5 })
                ));

            myDiagram.linkTemplateMap.add("influence",
                $(go.Link, { curve: go.Link.Bezier, toShortLength: 8 },
                    $(go.Shape, { stroke: "green", strokeWidth: 1.5 }),
                    $(go.Shape, { fill: "green", stroke: null, toArrow: "Standard", scale: 1.5 })
                ));

            // Groups consist of a title in the color given by the group node data
            // above a translucent gray rectangle surrounding the member parts
            myDiagram.groupTemplate =
                $(go.Group, "Vertical",
                    {
                        selectionObjectName: "PANEL",  // selection handle goes around shape, not label
                        ungroupable: true  // enable Ctrl-Shift-G to ungroup a selected Group
                    },
                    $(go.TextBlock,
                        {
                            //alignment: go.Spot.Right,
                            font: "bold 19px sans-serif",
                            isMultiline: false,  // don't allow newlines in text
                            editable: true  // allow in-place editing by user
                        },
                        new go.Binding("text", "text").makeTwoWay(),
                        new go.Binding("stroke", "color")),
                    $(go.Panel, "Auto", { name: "PANEL" },
                        $(go.Shape, "Rectangle",  // the rectangular shape around the members
                            {
                                fill: "rgba(128,128,128,0.2)", stroke: "gray", strokeWidth: 3,
                                portId: "", cursor: "pointer",  // the Shape is the port, not the whole Node
                                // allow all kinds of links from and to this port
                                fromLinkable: true, fromLinkableSelfNode: true, fromLinkableDuplicates: true,
                                toLinkable: true, toLinkableSelfNode: true, toLinkableDuplicates: true
                            }),
                        $(go.Placeholder, { margin: 10, background: "transparent" })  // represents where the members are
                    ),
                    { // this tooltip Adornment is shared by all groups
                        toolTip:
                            $("ToolTip",
                                $(go.TextBlock, { margin: 4 },
                                    // bind to tooltip, not to Group.data, to allow access to Group properties
                                    new go.Binding("text", "", FlowEditor.groupInfo).ofObject())
                            )
                    }
                );

        }

        /**
         * Define the appearance and behavior for Groups
        */
        private static groupInfo(adornment) {
            // takes the tooltip or context menu, not a group node data object
            var g = adornment.adornedPart;
            // get the Group that the tooltip adorns
            var mems = g.memberParts.count;
            var links = 0;

            g.memberParts.each(function (part) {
                if (part instanceof go.Link) links++;
            });

            return "Group " + g.data.key + ": " + g.data.text + "\n" + mems + " members including " + links + " links";
        }

        setMode(mode: string, itemType: string) {
            const myDiagram = this.goCanvas;
            const SD = this.SD;

            myDiagram.startTransaction();
            document.getElementById(SD.itemType).className = SD.mode + "_normal";
            document.getElementById(itemType).className = mode + "_selected";
            SD.mode = mode;
            SD.itemType = itemType;

            if (mode === "pointer") {
                myDiagram.allowLink = false;
                myDiagram.nodes.each(n => n.port.cursor = "");
            } else if (mode === "node") {
                myDiagram.allowLink = false;
                myDiagram.nodes.each(n => n.port.cursor = "");
            } else if (mode === "link") {
                myDiagram.allowLink = true;
                myDiagram.nodes.each(n => n.port.cursor = "pointer");
            }

            myDiagram.commitTransaction("mode changed");
        }

        /**
         * Show the diagram's model in JSON format 
         * that the user may edit.
         * 
        */
        public save_click() {
            this.dosave();
        }

        load() {
            const vm = this;

            $ts.getText(`@api:load?model_id=${$ts("@data:model_id")}`, function (json: string) {
                const model: Model = ModelPatch(JSON.parse(json));
                const jsonStr: string = JSON.stringify(model)

                vm.goCanvas.model = go.Model.fromJson(jsonStr);
            });
        }

        private dosave(callback: any = null) {
            const myDiagram = this.goCanvas;
            const modelJson = myDiagram.model.toJson();
            const payload = {
                guid: $ts("@data:model_id"),
                model: apps.ModelPatch(JSON.parse(modelJson)),
                type: "dynamics"
            };

            myDiagram.isModified = false;

            // save model at first
            $ts.post("@api:save", payload, function (resp) {
                if (resp.code != 0) {
                    console.error(resp.info);
                } else if ((!isNullOrUndefined(resp.info)) && (!isNullOrUndefined(callback))) {
                    callback(resp.info);
                }
            });
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
            this.dosave(f => this.doRunModel(f))
        }

        private doRunModel(guid: string) {
            $ts.post(`@api:run/${guid}`, { guid: guid }, function (resp) {
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
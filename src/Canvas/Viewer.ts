namespace apps {

    export class Viewer extends Bootstrap {

        public get appName(): string {
            return "ModelViewer";
        };

        private Metabolic_pathway: Metabolic_pathway = new Metabolic_pathway();

        protected init(): void {
            this.Metabolic_pathway.init();
        }
    }
}
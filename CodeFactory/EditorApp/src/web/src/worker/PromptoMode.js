/*eslint-disable no-alert, no-console */
import 'brace/mode/text';
import PromptoHighlightRules from './PromptoHighlightRules';
import PromptoWorkerClient from './PromptoWorkerClient';

export default class PromptoMode extends window.ace.acequire("ace/mode/text")
    .Mode {
        constructor() {
            super();
            this.$id = "ace/mode/prompto";
            this.$dialect = "E";
            this.HighlightRules = PromptoHighlightRules;
        }

        setDialect(dialect) {
            this.$dialect = dialect;
            this.$worker && this.$worker.send("setDialect", [ this.$dialect ] );
        }

        setContent(content) {
            this.$worker && this.$worker.send("setContent", [ content ] );
        }

        destroy(content) {
            this.$worker && this.$worker.send("destroy", [ content ] );
        }

        setProject(dbId, loadDependencies) {
            this.$worker && this.$worker.send("setProject", [ dbId, loadDependencies ] );
        }

        prepareCommit(dbId) {
            this.$worker && this.$worker.send("prepareCommit", [ dbId ] );
        }

        commitFailed(dbId) {
            this.$worker && this.$worker.send("commitFailed", [ dbId ] );
        }

        commitSuccessful(dbId) {
            this.$worker && this.$worker.send("commitSuccessful", [ dbId ] );
        };

        runMethod(id, mode) {
            this.$worker && this.$worker.send("runMethod", [ id, mode ] );
        }

        debugMethod(id, mode) {
            this.$worker && this.$worker.send("debugMethod", [ id, mode ] );
        }

        fetchRunnablePage(content) {
            this.$worker && this.$worker.send("fetchRunnablePage", [ content ] );
        }

        createWorker(session) {
            this.$worker = new PromptoWorkerClient(session, this.$dialect);
            return this.$worker;
        }

        // a utility method to inspect worker data in Firefox/Safari
        inspect = function(name) {
            this.$worker && this.$worker.send("inspect", [ name ] );
        }

}
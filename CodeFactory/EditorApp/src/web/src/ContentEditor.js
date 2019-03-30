import DebuggerView from "./debugger/DebuggerView";
import PromptoEditor from "./prompto-editor/PromptoEditor";
import Activity from "./utils/Activity";
import ResourceEditor from "./resource-editors/ResourceEditor";
import BinaryEditor from "./resource-editors/BinaryEditor";
import React from "react";
import {Breakpoints} from "./debugger/Breakpoints";

export default class ContentEditor extends React.Component {

    constructor(props) {
        super(props);
        this.debuggerView = null;
        this.promptoEditor = null;
        this.resourceEditor = null;
        this.binaryEditor = null;
        this.state = { breakpoints: new Breakpoints() };
        this.breakpointsUpdated = this.breakpointsUpdated.bind(this);
    }

    setProject(projectId, loadDependencies) {
        this.promptoEditor.setProject(projectId, loadDependencies);
    }

    setContent(content) {
        if(this.promptoEditor)
            this.promptoEditor.setDebugMode(null, () => this.promptoEditor.setContent(content));
        if(this.resourceEditor)
            this.resourceEditor.setContent(content);
        if(this.binaryEditor)
            this.binaryEditor.setContent(content);
    }

    destroyContent(content) {
        if(content.type.toLowerCase()==="prompto")
            this.contentEditor.promptoEditor.destroy(content);
    }

    setDialect(dialect) {
        this.promptoEditor.setDialect(dialect);
    }

    prepareCommit(commitPrepared) {
        this.promptoEditor.prepareCommit(commitPrepared);
    }

    commitFailed() {
        this.promptoEditor.commitFailed();
    }

    commitSuccessful() {
        this.promptoEditor.commitSuccessful();
    }

    runTestOrMethod(content, runMode) {
        const root = this.props.root;
        this.promptoEditor.runTestOrMethod(content, runMode, ()=>root.setState({activity: Activity.Idling}));
    }

    fetchRunnablePage(content, callback) {
        this.promptoEditor.fetchRunnablePage(content, callback);
    }

    setDebugger(dbg) {
        this.debuggerView.setDebugger(dbg);
    }

    getDebugger() {
        return this.debuggerView.getDebugger();
    }

    getDebuggerView() {
        return this.debuggerView;
    }

    breakpointsUpdated(breakpoints) {
        this.setState({ breakpoints: breakpoints });
    }

    dependenciesUpdated() {
        this.promptoEditor.dependenciesUpdated();
    }

   render() {
        const root = this.props.root;
        const activity = root.state.activity;
        return <div className="container">
            <DebuggerView ref={ref=>this.debuggerView=ref||this.debuggerView} activity={activity} container={this}
                          breakpoints={this.state.breakpoints} breakpointSelected={root.breakpointSelected}/>
            <PromptoEditor ref={ref=>this.promptoEditor=ref||this.promptoEditor} commitAndReset={root.commitAndReset}
                           catalogUpdated={root.catalogUpdated} projectUpdated={root.projectUpdated}
                           breakpointsUpdated={this.breakpointsUpdated}
                           root={this.props.root} activity={activity}/>
            <ResourceEditor ref={ref=>this.resourceEditor=ref||this.resourceEditor} textEdited={root.textResourceEdited}
                            root={this.props.root} activity={activity} />
            <BinaryEditor ref={ref=>this.binaryEditor=ref||this.binaryEditor}
                          root={this.props.root} activity={activity} />
        </div>
    }

}
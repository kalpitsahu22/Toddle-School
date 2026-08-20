import React from 'react';
import { WorkflowToolbar } from './components/builder/WorkflowToolbar';
import { NodeLibrary } from './components/builder/NodeLibrary';
import { WorkflowCanvas } from './components/builder/WorkflowCanvas';
import { ConfigurationPanel } from './components/builder/ConfigurationPanel';
import { ExecutionPanel } from './components/builder/ExecutionPanel';
import { CreateWorkflowModal } from './components/workflows/CreateWorkflowModal';
import { ArchitectureModal } from './components/builder/ArchitectureModal';
import { JsonModal } from './components/builder/JsonModal';
import { ValidationModal } from './components/builder/ValidationModal';
import { CustomNodeCreatorModal } from './components/builder/CustomNodeCreatorModal';

export const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-screen bg-[#0b0f19] text-slate-100 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation & Controls Toolbar */}
      <WorkflowToolbar />

      {/* Main 3-Column Layout: [Node Library] | [Canvas] | [Configuration Panel] */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Draggable Node Library */}
        <NodeLibrary />

        {/* Center: Interactive Workflow Graph Canvas */}
        <main className="flex-1 h-full relative overflow-hidden">
          <WorkflowCanvas />
        </main>

        {/* Right: Inspector & Configuration Panel */}
        <ConfigurationPanel />
      </div>

      {/* Bottom: Simulated Execution Engine Console */}
      <ExecutionPanel />

      {/* Modals & Dialogs */}
      <CreateWorkflowModal />
      <ArchitectureModal />
      <JsonModal />
      <ValidationModal />
      <CustomNodeCreatorModal />
    </div>
  );
};

export default App;

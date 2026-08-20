import { create } from 'zustand';
import dagre from 'dagre';
import {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  NodeType,
  NodeData,
  ValidationResult
} from '../types/workflow';
import {
  ExecutionContext,
  ApplicantProfile,
  ExecutionEventLog
} from '../types/execution';
import {
  INITIAL_WORKFLOWS,
  BLANK_STARTER_WORKFLOW
} from '../data/exampleWorkflows';
import { BUILT_IN_NODE_DEFINITIONS, NodeDefinition } from '../data/nodeDefinitions';
import { validateWorkflow } from '../validation/workflowValidator';
import {
  createInitialExecutionContext,
  findNextNodes,
  DEFAULT_MOCK_APPLICANTS
} from '../engine/workflowExecutor';
import { executeNode } from '../engine/nodeExecutor';

const STORAGE_KEY = 'toddle_workflow_builder_v5';
const CUSTOM_NODES_STORAGE_KEY = 'toddle_custom_nodes_v5';

function loadCustomNodesFromStorage(): NodeDefinition[] {
  try {
    const saved = localStorage.getItem(CUSTOM_NODES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load custom nodes from storage', e);
  }
  return [];
}

function saveCustomNodesToStorage(nodes: NodeDefinition[]) {
  try {
    localStorage.setItem(CUSTOM_NODES_STORAGE_KEY, JSON.stringify(nodes));
  } catch (e) {
    console.error('Failed to save custom nodes to storage', e);
  }
}

function getNodeLayoutHeight(node: WorkflowNode, showCodeSnippets: boolean): number {
  if (!showCodeSnippets) {
    if (node.type === 'condition' || node.type === 'human') {
      const branchesCount = node.data.branches?.length || node.data.allowedOutcomes?.length || 2;
      return 210 + Math.ceil(branchesCount / 2) * 24;
    }
    return 190;
  }

  // When Code Snippets are visible on canvas
  if (node.type === 'condition' || node.type === 'human') {
    const branchesCount = node.data.branches?.length || node.data.allowedOutcomes?.length || 2;
    return 410 + Math.ceil(branchesCount / 2) * 28;
  }
  if (node.type === 'action') {
    return 370;
  }
  if (node.type === 'delay') {
    return 350;
  }
  if (node.type === 'goal') {
    return 370;
  }
  return 350;
}

// Dagre Graph Layout Algorithm with adaptive code snippet spacing
export function applyDagreLayout(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  showCodeSnippets: boolean = true
): WorkflowNode[] {
  if (!nodes || nodes.length === 0) return [];

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const baseNodeWidth = 350;
  // Proper generous vertical rank spacing: 180px gap when snippets on, 90px when off
  const rankSep = showCodeSnippets ? 180 : 90;
  // Proper horizontal branch spacing: 130px when snippets on, 80px when off
  const nodeSep = showCodeSnippets ? 130 : 80;

  dagreGraph.setGraph({ rankdir: 'TB', ranksep: rankSep, nodesep: nodeSep, align: 'DL' });

  nodes.forEach((node) => {
    const h = getNodeLayoutHeight(node, showCodeSnippets);
    dagreGraph.setNode(node.id, { width: baseNodeWidth, height: h });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const h = getNodeLayoutHeight(node, showCodeSnippets);
    return {
      ...node,
      position: {
        x: Math.round(nodeWithPosition.x - baseNodeWidth / 2),
        y: Math.round(nodeWithPosition.y - h / 2)
      }
    };
  });
}

function loadWorkflowsFromStorage(): Workflow[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((wf) => ({
          ...wf,
          nodes: applyDagreLayout(wf.nodes, wf.edges, true)
        }));
      }
    }
  } catch (e) {
    console.error('Failed to load workflows from localStorage', e);
  }
  return INITIAL_WORKFLOWS.map((wf) => ({
    ...wf,
    nodes: applyDagreLayout(wf.nodes, wf.edges, true)
  }));
}

function saveWorkflowsToStorage(workflows: Workflow[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
  } catch (e) {
    console.error('Failed to save workflows to localStorage', e);
  }
}

interface WorkflowState {
  // Workflows
  workflows: Workflow[];
  activeWorkflowId: string;
  isDirty: boolean;

  // Selected Node in Inspector
  selectedNodeId: string | null;

  // Validation
  validationResult: ValidationResult;
  isValidationModalOpen: boolean;

  // Execution Simulator
  isTestMode: boolean;
  isExecuting: boolean;
  executionSpeedMs: number; // 1200ms default
  selectedApplicantKey: string;
  executionContext: ExecutionContext;

  // Custom Node Definitions
  customNodeDefinitions: NodeDefinition[];
  isCustomNodeModalOpen: boolean;
  addCustomNodeDefinition: (def: NodeDefinition) => void;
  deleteCustomNodeDefinition: (id: string) => void;
  setIsCustomNodeModalOpen: (open: boolean) => void;

  // UI Modals & Display
  isCreateModalOpen: boolean;
  isArchitectureModalOpen: boolean;
  isJsonModalOpen: boolean;
  jsonModalMode: 'export' | 'import';
  showCodeSnippets: boolean;
  setShowCodeSnippets: (show: boolean) => void;

  // Actions - Workflows
  setActiveWorkflow: (id: string) => void;
  createWorkflow: (params: {
    name: string;
    description?: string;
    startMode: 'blank' | 'template' | 'duplicate';
    templateId?: string;
    duplicateWorkflowId?: string;
  }) => string;
  duplicateWorkflow: (id: string) => string;
  renameWorkflow: (id: string, name: string) => void;
  deleteWorkflow: (id: string) => void;
  saveWorkflow: () => void;
  publishWorkflow: () => void;
  resetToDefaults: () => void;

  // Actions - Graph Editing
  addNode: (nodeType: NodeType, subtype?: string, position?: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  deleteNode: (nodeId: string) => void;
  addEdge: (edge: WorkflowEdge) => void;
  deleteEdge: (edgeId: string) => void;
  autoLayout: () => void;
  setSelectedNodeId: (nodeId: string | null) => void;

  // Actions - Validation
  runValidation: () => ValidationResult;
  setIsValidationModalOpen: (open: boolean) => void;

  // Actions - Execution
  setTestMode: (active: boolean) => void;
  setExecutionSpeedMs: (speed: number) => void;
  setSelectedApplicantKey: (key: string) => void;
  startExecution: (applicantKey?: string) => Promise<void>;
  pauseExecution: () => void;
  stepNextExecution: () => Promise<void>;
  resolveHumanDecision: (outcomeActionId: string) => Promise<void>;
  bypassGoalPaid: () => Promise<void>;
  triggerEarlyAction: () => Promise<void>;
  triggerNextModularWorkflow: (targetWfId: string) => Promise<void>;
  resetExecution: () => void;

  // Actions - Import / Export / UI
  exportWorkflowJson: () => string;
  importWorkflowJson: (jsonStr: string) => boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  setIsArchitectureModalOpen: (open: boolean) => void;
  setIsJsonModalOpen: (open: boolean, mode?: 'export' | 'import') => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => {
  const initialWorkflows = loadWorkflowsFromStorage();
  const initialCustomNodes = loadCustomNodesFromStorage();
  const defaultWorkflow = initialWorkflows[0] || INITIAL_WORKFLOWS[0];

  return {
    workflows: initialWorkflows,
    activeWorkflowId: defaultWorkflow.id,
    isDirty: false,
    selectedNodeId: null,
    validationResult: validateWorkflow(defaultWorkflow),
    isValidationModalOpen: false,

    customNodeDefinitions: initialCustomNodes,
    isCustomNodeModalOpen: false,

    isTestMode: false,
    isExecuting: false,
    executionSpeedMs: 1200,
    selectedApplicantKey: 'standard_middle_high',
    executionContext: createInitialExecutionContext(defaultWorkflow.id),

    isCreateModalOpen: false,
    isArchitectureModalOpen: false,
    isJsonModalOpen: false,
    jsonModalMode: 'export',
    showCodeSnippets: true,
    setShowCodeSnippets: (show: boolean) => {
      const state = get();
      const active = state.workflows.find((w) => w.id === state.activeWorkflowId);
      if (!active) {
        set({ showCodeSnippets: show });
        return;
      }
      const laidOutNodes = applyDagreLayout(active.nodes, active.edges, show);
      const updatedWorkflow = {
        ...active,
        nodes: laidOutNodes,
        updatedAt: new Date().toISOString()
      };
      const updatedWorkflows = state.workflows.map((w) =>
        w.id === active.id ? updatedWorkflow : w
      );
      saveWorkflowsToStorage(updatedWorkflows);
      set({
        showCodeSnippets: show,
        workflows: updatedWorkflows
      });
    },

    addCustomNodeDefinition: (def: NodeDefinition) => {
      const state = get();
      const newDef: NodeDefinition = {
        ...def,
        id: def.id || `custom-node-${Date.now()}`,
        isCustom: true
      };
      const updated = [...state.customNodeDefinitions, newDef];
      saveCustomNodesToStorage(updated);
      set({ customNodeDefinitions: updated, isCustomNodeModalOpen: false });
    },

    deleteCustomNodeDefinition: (id: string) => {
      const state = get();
      const updated = state.customNodeDefinitions.filter((n) => n.id !== id);
      saveCustomNodesToStorage(updated);
      set({ customNodeDefinitions: updated });
    },

    setIsCustomNodeModalOpen: (open: boolean) => set({ isCustomNodeModalOpen: open }),

    setActiveWorkflow: (id: string) => {
      const state = get();
      const target = state.workflows.find((w) => w.id === id);
      if (!target) return;
      state.resetExecution();
      const laidOutNodes = applyDagreLayout(target.nodes, target.edges, state.showCodeSnippets);
      const updatedWorkflow = { ...target, nodes: laidOutNodes };
      const updatedWorkflows = state.workflows.map((w) =>
        w.id === target.id ? updatedWorkflow : w
      );
      set({
        activeWorkflowId: id,
        workflows: updatedWorkflows,
        selectedNodeId: null,
        validationResult: validateWorkflow(updatedWorkflow),
        isDirty: false,
        executionContext: createInitialExecutionContext(id, state.selectedApplicantKey)
      });
    },

    createWorkflow: ({ name, description, startMode, templateId, duplicateWorkflowId }) => {
      const state = get();
      let newNodes: WorkflowNode[] = [];
      let newEdges: WorkflowEdge[] = [];
      let tags: string[] = ['Custom'];

      if (startMode === 'blank') {
        newNodes = JSON.parse(JSON.stringify(BLANK_STARTER_WORKFLOW.nodes));
        newEdges = [];
      } else if (startMode === 'template' && templateId) {
        const tpl = INITIAL_WORKFLOWS.find((w) => w.id === templateId) || INITIAL_WORKFLOWS[0];
        newNodes = JSON.parse(JSON.stringify(tpl.nodes));
        newEdges = JSON.parse(JSON.stringify(tpl.edges));
        tags = tpl.tags ? [...tpl.tags] : ['Template'];
      } else if (startMode === 'duplicate' && duplicateWorkflowId) {
        const source = state.workflows.find((w) => w.id === duplicateWorkflowId) || state.workflows[0];
        newNodes = JSON.parse(JSON.stringify(source.nodes));
        newEdges = JSON.parse(JSON.stringify(source.edges));
        tags = source.tags ? [...source.tags, 'Copy'] : ['Duplicate'];
      } else {
        newNodes = JSON.parse(JSON.stringify(BLANK_STARTER_WORKFLOW.nodes));
        newEdges = [];
      }

      const newWorkflow: Workflow = {
        id: `wf-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: name.trim() || 'Untitled Workflow',
        description: description?.trim() || 'Custom configurable workflow.',
        category: 'admission',
        version: 1,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags,
        nodes: newNodes,
        edges: newEdges
      };

      const updated = [...state.workflows, newWorkflow];
      saveWorkflowsToStorage(updated);

      set({
        workflows: updated,
        activeWorkflowId: newWorkflow.id,
        selectedNodeId: null,
        validationResult: validateWorkflow(newWorkflow),
        isCreateModalOpen: false,
        executionContext: createInitialExecutionContext(newWorkflow.id, state.selectedApplicantKey)
      });

      return newWorkflow.id;
    },

    duplicateWorkflow: (id: string) => {
      const state = get();
      const source = state.workflows.find((w) => w.id === id);
      if (!source) return id;

      const copy: Workflow = {
        ...JSON.parse(JSON.stringify(source)),
        id: `wf-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: `${source.name} (Copy)`,
        version: 1,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updated = [...state.workflows, copy];
      saveWorkflowsToStorage(updated);

      set({
        workflows: updated,
        activeWorkflowId: copy.id,
        selectedNodeId: null,
        validationResult: validateWorkflow(copy),
        executionContext: createInitialExecutionContext(copy.id, state.selectedApplicantKey)
      });

      return copy.id;
    },

    renameWorkflow: (id: string, name: string) => {
      const state = get();
      const updated = state.workflows.map((w) =>
        w.id === id ? { ...w, name, updatedAt: new Date().toISOString() } : w
      );
      saveWorkflowsToStorage(updated);
      set({ workflows: updated, isDirty: false });
    },

    deleteWorkflow: (id: string) => {
      const state = get();
      if (state.workflows.length <= 1) {
        alert('Cannot delete the only remaining workflow.');
        return;
      }
      const updated = state.workflows.filter((w) => w.id !== id);
      const nextActive = updated[0];
      saveWorkflowsToStorage(updated);
      set({
        workflows: updated,
        activeWorkflowId: nextActive.id,
        selectedNodeId: null,
        validationResult: validateWorkflow(nextActive),
        executionContext: createInitialExecutionContext(nextActive.id, state.selectedApplicantKey)
      });
    },

    saveWorkflow: () => {
      const state = get();
      saveWorkflowsToStorage(state.workflows);
      set({ isDirty: false });
    },

    publishWorkflow: () => {
      const state = get();
      const active = state.workflows.find((w) => w.id === state.activeWorkflowId);
      if (!active) return;

      const validation = validateWorkflow(active);
      if (!validation.isValid) {
        set({ isValidationModalOpen: true, validationResult: validation });
        return;
      }

      const updated = state.workflows.map((w) =>
        w.id === active.id
          ? {
              ...w,
              version: w.version + 1,
              status: 'published' as const,
              updatedAt: new Date().toISOString()
            }
          : w
      );
      saveWorkflowsToStorage(updated);
      set({ workflows: updated, isDirty: false });
    },

    resetToDefaults: () => {
      const reset = JSON.parse(JSON.stringify(INITIAL_WORKFLOWS));
      saveWorkflowsToStorage(reset);
      set({
        workflows: reset,
        activeWorkflowId: reset[0].id,
        selectedNodeId: null,
        validationResult: validateWorkflow(reset[0]),
        isDirty: false,
        executionContext: createInitialExecutionContext(reset[0].id, get().selectedApplicantKey)
      });
    },

    // Graph Node / Edge Editing
    addNode: (nodeType: NodeType, subtype?: string, position?: { x: number; y: number }) => {
      const state = get();
      const active = state.workflows.find((w) => w.id === state.activeWorkflowId);
      if (!active) return;

      const defaultKey = subtype || `action_send_email`;
      
      // Check in custom nodes first, then built-in definitions
      const customDef = state.customNodeDefinitions.find((c) => c.id === subtype || c.subtype === subtype);
      const def = customDef || BUILT_IN_NODE_DEFINITIONS[defaultKey] || {
        type: nodeType,
        subtype: 'custom',
        label: `New ${nodeType.toUpperCase()}`,
        category: 'Action',
        description: 'Configurable step',
        defaultConfig: {}
      };

      const posX = position ? position.x : 300 + Math.random() * 60;
      const posY = position ? position.y : 100 + active.nodes.length * 90;

      const newNode: WorkflowNode = {
        id: `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: def.type || nodeType,
        position: { x: posX, y: posY },
        data: {
          label: def.label || `New ${nodeType}`,
          category: def.category as any,
          nodeSubtype: def.subtype,
          description: def.description,
          iconName: def.iconName,
          ...JSON.parse(JSON.stringify(def.defaultConfig || {}))
        }
      };

      const updatedNodes = [...active.nodes, newNode];
      const updatedWorkflow = {
        ...active,
        nodes: updatedNodes,
        updatedAt: new Date().toISOString()
      };

      const updatedWorkflows = state.workflows.map((w) =>
        w.id === active.id ? updatedWorkflow : w
      );

      saveWorkflowsToStorage(updatedWorkflows);

      set({
        workflows: updatedWorkflows,
        selectedNodeId: newNode.id,
        isDirty: true,
        validationResult: validateWorkflow(updatedWorkflow)
      });
    },

    updateNodeData: (nodeId: string, partialData: Partial<NodeData>) => {
      const state = get();
      const active = state.workflows.find((w) => w.id === state.activeWorkflowId);
      if (!active) return;

      const updatedNodes = active.nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: {
                ...n.data,
                ...partialData
              }
            }
          : n
      );

      const updatedWorkflow = {
        ...active,
        nodes: updatedNodes,
        updatedAt: new Date().toISOString()
      };

      const updatedWorkflows = state.workflows.map((w) =>
        w.id === active.id ? updatedWorkflow : w
      );

      set({
        workflows: updatedWorkflows,
        isDirty: true,
        validationResult: validateWorkflow(updatedWorkflow)
      });
    },

    updateNodePosition: (nodeId: string, position: { x: number; y: number }) => {
      const state = get();
      const active = state.workflows.find((w) => w.id === state.activeWorkflowId);
      if (!active) return;

      const updatedNodes = active.nodes.map((n) =>
        n.id === nodeId ? { ...n, position } : n
      );

      const updatedWorkflow = {
        ...active,
        nodes: updatedNodes
      };

      const updatedWorkflows = state.workflows.map((w) =>
        w.id === active.id ? updatedWorkflow : w
      );

      set({
        workflows: updatedWorkflows,
        isDirty: true
      });
    },

    deleteNode: (nodeId: string) => {
      const state = get();
      const active = state.workflows.find((w) => w.id === state.activeWorkflowId);
      if (!active) return;

      const updatedNodes = active.nodes.filter((n) => n.id !== nodeId);
      const updatedEdges = active.edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      );

      const updatedWorkflow = {
        ...active,
        nodes: updatedNodes,
        edges: updatedEdges,
        updatedAt: new Date().toISOString()
      };

      const updatedWorkflows = state.workflows.map((w) =>
        w.id === active.id ? updatedWorkflow : w
      );

      saveWorkflowsToStorage(updatedWorkflows);

      set({
        workflows: updatedWorkflows,
        selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
        isDirty: true,
        validationResult: validateWorkflow(updatedWorkflow)
      });
    },

    addEdge: (edge: WorkflowEdge) => {
      const state = get();
      const active = state.workflows.find((w) => w.id === state.activeWorkflowId);
      if (!active) return;

      // Avoid duplicates
      const exists = active.edges.some(
        (e) =>
          e.source === edge.source &&
          e.target === edge.target &&
          e.sourceHandle === edge.sourceHandle
      );
      if (exists) return;

      const updatedEdges = [...active.edges, { ...edge, animated: true }];
      const updatedWorkflow = {
        ...active,
        edges: updatedEdges,
        updatedAt: new Date().toISOString()
      };

      const updatedWorkflows = state.workflows.map((w) =>
        w.id === active.id ? updatedWorkflow : w
      );

      saveWorkflowsToStorage(updatedWorkflows);

      set({
        workflows: updatedWorkflows,
        isDirty: true,
        validationResult: validateWorkflow(updatedWorkflow)
      });
    },

    deleteEdge: (edgeId: string) => {
      const state = get();
      const active = state.workflows.find((w) => w.id === state.activeWorkflowId);
      if (!active) return;

      const updatedEdges = active.edges.filter((e) => e.id !== edgeId);
      const updatedWorkflow = {
        ...active,
        edges: updatedEdges,
        updatedAt: new Date().toISOString()
      };

      const updatedWorkflows = state.workflows.map((w) =>
        w.id === active.id ? updatedWorkflow : w
      );

      saveWorkflowsToStorage(updatedWorkflows);

      set({
        workflows: updatedWorkflows,
        isDirty: true,
        validationResult: validateWorkflow(updatedWorkflow)
      });
    },

    autoLayout: () => {
      const state = get();
      const active = state.workflows.find((w) => w.id === state.activeWorkflowId);
      if (!active || active.nodes.length === 0) return;

      const laidOutNodes = applyDagreLayout(active.nodes, active.edges, state.showCodeSnippets);
      const updatedWorkflow = {
        ...active,
        nodes: laidOutNodes,
        updatedAt: new Date().toISOString()
      };

      const updatedWorkflows = state.workflows.map((w) =>
        w.id === active.id ? updatedWorkflow : w
      );

      saveWorkflowsToStorage(updatedWorkflows);

      set({
        workflows: updatedWorkflows,
        isDirty: true
      });
    },

    setSelectedNodeId: (nodeId: string | null) => {
      set({ selectedNodeId: nodeId });
    },

    runValidation: () => {
      const state = get();
      const active = state.workflows.find((w) => w.id === state.activeWorkflowId);
      if (!active) return { isValid: false, issues: [] };
      const res = validateWorkflow(active);
      set({ validationResult: res });
      return res;
    },

    setIsValidationModalOpen: (open: boolean) => {
      set({ isValidationModalOpen: open });
    },

    // Execution Simulator Methods
    setTestMode: (active: boolean) => {
      set({ isTestMode: active });
      if (!active) {
        get().resetExecution();
      }
    },

    setExecutionSpeedMs: (speed: number) => {
      set({ executionSpeedMs: speed });
    },

    setSelectedApplicantKey: (key: string) => {
      set({ selectedApplicantKey: key });
      get().resetExecution();
    },

    resetExecution: () => {
      const state = get();
      const active = state.workflows.find((w) => w.id === state.activeWorkflowId);
      if (!active) return;

      // Clear execution states from nodes
      const cleanNodes = active.nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          executionStatus: undefined,
          executionError: undefined,
          executionAttempts: undefined
        }
      }));

      const updatedWorkflows = state.workflows.map((w) =>
        w.id === active.id ? { ...w, nodes: cleanNodes } : w
      );

      set({
        workflows: updatedWorkflows,
        isExecuting: false,
        executionContext: createInitialExecutionContext(active.id, state.selectedApplicantKey)
      });
    },

    startExecution: async (applicantKey?: string) => {
      const state = get();
      const active = state.workflows.find((w) => w.id === state.activeWorkflowId);
      if (!active) return;

      get().resetExecution();

      const appKey = applicantKey || state.selectedApplicantKey;
      const initialCtx = createInitialExecutionContext(active.id, appKey);
      initialCtx.status = 'running';

      // Find starter trigger node
      const triggerNode = active.nodes.find((n) => n.type === 'trigger');
      if (!triggerNode) {
        alert('Workflow cannot run without a Trigger node.');
        return;
      }

      initialCtx.currentNodeId = triggerNode.id;
      set({
        isTestMode: true,
        isExecuting: true,
        executionContext: initialCtx
      });

      // Run traversal
      await runTraversalLoop();
    },

    pauseExecution: () => {
      set({ isExecuting: false });
    },

    stepNextExecution: async () => {
      const state = get();
      const active = state.workflows.find((w) => w.id === state.activeWorkflowId);
      if (!active) return;

      if (!state.isTestMode || state.executionContext.status === 'idle') {
        await get().startExecution();
        return;
      }

      await executeSingleStep();
    },

    resolveHumanDecision: async (outcomeActionId: string) => {
      const state = get();
      const waitingNodeId = state.executionContext.waitingHumanNodeId;
      if (!waitingNodeId) return;

      const active = state.workflows.find((w) => w.id === state.activeWorkflowId);
      if (!active) return;

      const node = active.nodes.find((n) => n.id === waitingNodeId);
      if (!node) return;

      // Execute human node with user choice
      const result = await executeNode(node, state.executionContext.applicant, state.executionContext.variables, {
        humanDecisionChoice: outcomeActionId
      });

      // Update node visual state
      get().updateNodeData(node.id, {
        executionStatus: 'completed'
      });

      // Update context
      const updatedApplicant = {
        ...state.executionContext.applicant,
        ...(result.updatedApplicant || {})
      };

      const updatedHistory = [...state.executionContext.history, result.log];

      // Find next node(s) based on chosen branch handle
      const nextNodes = findNextNodes(node.id, result.outgoingHandleId, active);
      const nextNode = nextNodes[0] || null;

      const nextStatus = nextNode ? 'running' : 'completed';

      set({
        executionContext: {
          ...state.executionContext,
          status: nextStatus,
          currentNodeId: nextNode ? nextNode.id : null,
          waitingHumanNodeId: null,
          applicant: updatedApplicant,
          history: updatedHistory
        },
        isExecuting: !!nextNode
      });

      if (nextNode) {
        await runTraversalLoop();
      }
    },

    bypassGoalPaid: async () => {
      const state = get();
      const goalNodeId = state.executionContext.waitingGoalNodeId || state.executionContext.currentNodeId;
      if (!goalNodeId) return;

      const active = state.workflows.find((w) => w.id === state.activeWorkflowId);
      if (!active) return;

      const node = active.nodes.find((n) => n.id === goalNodeId);
      if (!node || node.type !== 'goal') return;

      // Update applicant with offline payment confirmed
      const updatedApplicant: ApplicantProfile = {
        ...state.executionContext.applicant,
        feePaid: true,
        paymentMethod: 'offline_bank_wire',
        applicationStatus: 'Fee Paid (Offline Wire)'
      };

      const result = await executeNode(node, updatedApplicant, state.executionContext.variables, {
        forceGoalSatisfied: true
      });

      get().updateNodeData(node.id, {
        executionStatus: 'completed'
      });

      const updatedHistory = [...state.executionContext.history, result.log];
      const nextNodes = findNextNodes(node.id, 'success', active);
      const nextNode = nextNodes[0] || null;

      set({
        executionContext: {
          ...state.executionContext,
          status: nextNode ? 'running' : 'completed',
          currentNodeId: nextNode ? nextNode.id : null,
          waitingGoalNodeId: null,
          applicant: updatedApplicant,
          history: updatedHistory
        },
        isExecuting: !!nextNode
      });

      if (nextNode) {
        await runTraversalLoop();
      }
    },

    triggerEarlyAction: async () => {
      const state = get();
      const delayNodeId = state.executionContext.waitingDelayNodeId || state.executionContext.currentNodeId;
      const active = state.workflows.find((w) => w.id === state.activeWorkflowId);
      if (!active) return;

      // Mark applicant with early action / tour booked
      const updatedApplicant: ApplicantProfile = {
        ...state.executionContext.applicant,
        earlyActionTriggered: true,
        tourBooked: true
      };

      let node = delayNodeId ? active.nodes.find((n) => n.id === delayNodeId) : null;
      if (!node || node.type !== 'delay') {
        // Find if any delay node is currently active
        node = active.nodes.find((n) => n.type === 'delay') || null;
      }

      if (node) {
        const result = await executeNode(node, updatedApplicant, state.executionContext.variables, {
          earlyActionTriggered: true
        });

        get().updateNodeData(node.id, {
          executionStatus: 'completed'
        });

        const updatedHistory = [...state.executionContext.history, result.log];
        const nextNodes = findNextNodes(node.id, 'source', active);
        const nextNode = nextNodes[0] || null;

        set({
          executionContext: {
            ...state.executionContext,
            status: nextNode ? 'running' : 'completed',
            currentNodeId: nextNode ? nextNode.id : null,
            waitingDelayNodeId: null,
            applicant: updatedApplicant,
            history: updatedHistory
          },
          isExecuting: !!nextNode
        });

        if (nextNode) {
          await runTraversalLoop();
        }
      } else {
        set({
          executionContext: {
            ...state.executionContext,
            applicant: updatedApplicant
          }
        });
      }
    },

    triggerNextModularWorkflow: async (targetWfId: string) => {
      const state = get();
      const targetWf = state.workflows.find((w) => w.id === targetWfId);
      if (!targetWf) return;

      // Retain current applicant state and switch active workflow
      const currentApplicant = state.executionContext.applicant;
      get().setActiveWorkflow(targetWfId);

      // Start execution on the new modular flow with current applicant context
      setTimeout(async () => {
        const initialCtx = createInitialExecutionContext(targetWf.id);
        initialCtx.applicant = currentApplicant;
        initialCtx.status = 'running';

        const triggerNode = targetWf.nodes.find((n) => n.type === 'trigger');
        if (triggerNode) {
          initialCtx.currentNodeId = triggerNode.id;
          set({
            isTestMode: true,
            isExecuting: true,
            executionContext: initialCtx
          });
          await runTraversalLoop();
        }
      }, 200);
    },

    // JSON Import/Export & Modals
    exportWorkflowJson: () => {
      const state = get();
      const active = state.workflows.find((w) => w.id === state.activeWorkflowId);
      if (!active) return '{}';
      return JSON.stringify(active, null, 2);
    },

    importWorkflowJson: (jsonStr: string) => {
      try {
        const parsed = JSON.parse(jsonStr);
        if (!parsed.name || !Array.isArray(parsed.nodes)) {
          alert('Invalid workflow JSON format: must contain name and nodes array.');
          return false;
        }

        const imported: Workflow = {
          ...parsed,
          id: `wf-imported-${Date.now()}`,
          name: `${parsed.name} (Imported)`,
          version: parsed.version || 1,
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const updated = [...get().workflows, imported];
        saveWorkflowsToStorage(updated);

        set({
          workflows: updated,
          activeWorkflowId: imported.id,
          selectedNodeId: null,
          validationResult: validateWorkflow(imported),
          isJsonModalOpen: false,
          executionContext: createInitialExecutionContext(imported.id, get().selectedApplicantKey)
        });

        return true;
      } catch (e) {
        alert('Failed to parse JSON string.');
        return false;
      }
    },

    setIsCreateModalOpen: (open: boolean) => set({ isCreateModalOpen: open }),
    setIsArchitectureModalOpen: (open: boolean) => set({ isArchitectureModalOpen: open }),
    setIsJsonModalOpen: (open: boolean, mode: 'export' | 'import' = 'export') =>
      set({ isJsonModalOpen: open, jsonModalMode: mode })
  };
});

// Helper for asynchronous execution loop
async function runTraversalLoop() {
  const store = useWorkflowStore.getState();
  while (store.isExecuting && store.executionContext.currentNodeId) {
    const shouldContinue = await executeSingleStep();
    if (!shouldContinue) break;
    // Wait for configured simulation speed
    const delay = useWorkflowStore.getState().executionSpeedMs;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

async function executeSingleStep(): Promise<boolean> {
  const state = useWorkflowStore.getState();
  const active = state.workflows.find((w) => w.id === state.activeWorkflowId);
  if (!active || !state.executionContext.currentNodeId) return false;

  const currentNode = active.nodes.find((n) => n.id === state.executionContext.currentNodeId);
  if (!currentNode) return false;

  // Mark node as running
  state.updateNodeData(currentNode.id, { executionStatus: 'running' });

  // Execute node logic
  const currentAttempts = state.executionContext.activeGoalAttempts[currentNode.id] || 0;
  const result = await executeNode(
    currentNode,
    state.executionContext.applicant,
    state.executionContext.variables,
    {
      goalCurrentAttempt: currentAttempts
    }
  );

  const updatedApplicant = {
    ...state.executionContext.applicant,
    ...(result.updatedApplicant || {})
  };

  const updatedHistory = [...state.executionContext.history, result.log];

  // If waiting for Human Action:
  if (result.status === 'waiting' && result.pauseReason === 'human_decision') {
    state.updateNodeData(currentNode.id, { executionStatus: 'waiting' });
    useWorkflowStore.setState({
      executionContext: {
        ...state.executionContext,
        status: 'paused_human',
        waitingHumanNodeId: currentNode.id,
        applicant: updatedApplicant,
        history: updatedHistory
      },
      isExecuting: false
    });
    return false;
  }

  // If waiting for Goal:
  if (result.status === 'waiting' && result.pauseReason === 'goal_pending') {
    state.updateNodeData(currentNode.id, {
      executionStatus: 'waiting',
      executionAttempts: currentAttempts + 1
    });
    useWorkflowStore.setState({
      executionContext: {
        ...state.executionContext,
        status: 'paused_goal',
        waitingGoalNodeId: currentNode.id,
        activeGoalAttempts: {
          ...state.executionContext.activeGoalAttempts,
          [currentNode.id]: currentAttempts + 1
        },
        applicant: updatedApplicant,
        history: updatedHistory
      },
      isExecuting: false
    });
    return false;
  }

  // If failed:
  if (result.status === 'failed') {
    state.updateNodeData(currentNode.id, {
      executionStatus: 'failed',
      executionError: result.error
    });
    useWorkflowStore.setState({
      executionContext: {
        ...state.executionContext,
        status: 'failed',
        error: result.error,
        history: updatedHistory
      },
      isExecuting: false
    });
    return false;
  }

  // Success: mark node completed
  state.updateNodeData(currentNode.id, {
    executionStatus: 'completed'
  });

  // Find next nodes based on handle
  const nextNodes = findNextNodes(currentNode.id, result.outgoingHandleId, active);
  const nextNode = nextNodes[0] || null;

  if (!nextNode) {
    // Reached terminal end of workflow!
    useWorkflowStore.setState({
      executionContext: {
        ...state.executionContext,
        status: 'completed',
        currentNodeId: null,
        applicant: updatedApplicant,
        history: updatedHistory,
        completedAt: new Date().toISOString()
      },
      isExecuting: false
    });
    return false;
  }

  // Move to next node
  useWorkflowStore.setState({
    executionContext: {
      ...state.executionContext,
      currentNodeId: nextNode.id,
      applicant: updatedApplicant,
      history: updatedHistory
    }
  });

  return true;
}

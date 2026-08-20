import React, { useCallback, useMemo, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Connection,
  Edge,
  Node,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflowStore } from '../../store/workflowStore';
import { TriggerNode } from '../nodes/TriggerNode';
import { ActionNode } from '../nodes/ActionNode';
import { ConditionNode } from '../nodes/ConditionNode';
import { DelayNode } from '../nodes/DelayNode';
import { HumanNode } from '../nodes/HumanNode';
import { GoalNode } from '../nodes/GoalNode';
import { SystemNode } from '../nodes/SystemNode';
import { CustomEdge } from '../edges/CustomEdge';
import { NodeType, WorkflowEdge } from '../../types/workflow';

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  delay: DelayNode,
  human: HumanNode,
  goal: GoalNode,
  system: SystemNode
};

const edgeTypes = {
  custom: CustomEdge,
  default: CustomEdge
};

const CanvasInner: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const {
    workflows,
    activeWorkflowId,
    selectedNodeId,
    setSelectedNodeId,
    addNode,
    addEdge: storeAddEdge,
    deleteEdge,
    updateNodePosition,
    executionContext
  } = useWorkflowStore();

  const activeWorkflow = workflows.find((w) => w.id === activeWorkflowId) || workflows[0];

  // Convert workflow nodes to ReactFlow nodes
  const rfNodes: Node[] = useMemo(() => {
    return activeWorkflow.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        ...node.data,
        isExecutionActive: executionContext.currentNodeId === node.id
      },
      selected: node.id === selectedNodeId
    }));
  }, [activeWorkflow.nodes, selectedNodeId, executionContext.currentNodeId]);

  // Convert workflow edges to ReactFlow edges
  const rfEdges: Edge[] = useMemo(() => {
    return activeWorkflow.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      label: edge.label,
      type: 'custom',
      animated: edge.animated || false,
      data: {
        label: edge.label,
        isExecutionActive: executionContext.status === 'running'
      }
    }));
  }, [activeWorkflow.edges, executionContext.status]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          updateNodePosition(change.id, change.position);
        }
      });
    },
    [updateNodePosition]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      changes.forEach((change) => {
        if (change.type === 'remove') {
          deleteEdge(change.id);
        }
      });
    },
    [deleteEdge]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      const newEdge: WorkflowEdge = {
        id: `e-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle || undefined,
        targetHandle: connection.targetHandle || undefined,
        label: connection.sourceHandle ? connection.sourceHandle.toUpperCase() : undefined,
        animated: true
      };

      storeAddEdge(newEdge);
    },
    [storeAddEdge]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow-type') as NodeType;
      const subtype = event.dataTransfer.getData('application/reactflow-subtype');

      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });

      addNode(type, subtype, position);
    },
    [addNode, screenToFlowPosition]
  );

  return (
    <div ref={reactFlowWrapper} className="w-full h-full relative bg-[#0b0f19]">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.8}
        defaultEdgeOptions={{ type: 'custom' }}
        className="touch-none"
      >
        <Background color="#1e293b" gap={24} size={1.5} />
        <Controls className="!bg-slate-900 !border-slate-800 !text-slate-300 [&>button]:!border-slate-800 [&>button:hover]:!bg-slate-800" />
        <MiniMap
          nodeColor={(n) => {
            switch (n.type) {
              case 'trigger':
                return '#10B981';
              case 'action':
                return '#3B82F6';
              case 'condition':
                return '#F59E0B';
              case 'delay':
                return '#8B5CF6';
              case 'human':
                return '#F43F5E';
              case 'goal':
                return '#F97316';
              case 'system':
                return '#14B8A6';
              default:
                return '#64748B';
            }
          }}
          className="!bg-slate-950/90 !border-slate-800 !rounded-xl overflow-hidden shadow-2xl"
          maskColor="rgba(11, 15, 25, 0.75)"
        />
      </ReactFlow>
    </div>
  );
};

export const WorkflowCanvas: React.FC = () => {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
};

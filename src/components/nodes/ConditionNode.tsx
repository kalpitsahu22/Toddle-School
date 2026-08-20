import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { GitFork, Split, CheckCircle2, Loader2 } from 'lucide-react';
import { NodeData } from '../../types/workflow';
import { NodeCodeSnippet } from './NodeCodeSnippet';

export const ConditionNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as unknown as NodeData;
  const status = nodeData.executionStatus || 'idle';

  const branches = nodeData.branches || [
    { handleId: 'true', label: 'TRUE / YES', color: '#10B981' },
    { handleId: 'false', label: 'FALSE / NO', color: '#EF4444' }
  ];

  return (
    <div
      className={`relative min-w-[300px] max-w-[350px] rounded-xl border bg-slate-900/95 backdrop-blur-md p-4 transition-all duration-300 shadow-xl ${
        selected
          ? 'border-amber-400 ring-2 ring-amber-400/30 shadow-amber-500/20'
          : 'border-amber-600/40 hover:border-amber-500/80 shadow-black/40'
      } ${
        status === 'running'
          ? 'border-amber-400 ring-4 ring-amber-500/40 animate-pulse bg-amber-950/20'
          : status === 'completed'
          ? 'border-amber-500/70 bg-slate-900/95'
          : ''
      }`}
    >
      {/* Top Incoming Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="!w-3.5 !h-3.5 !bg-amber-400 !border-2 !border-slate-900 transition-transform hover:!scale-125 cursor-crosshair"
      />

      {/* Header Pill & Status */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
          <GitFork className="w-3 h-3" />
          <span>Logic / Condition</span>
        </div>

        {status === 'running' && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-medium animate-pulse">
            <Loader2 className="w-2.5 h-2.5 animate-spin" /> Evaluating
          </span>
        )}
        {status === 'completed' && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Evaluated
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex items-start gap-3 mb-2">
        <div className="p-2.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 shrink-0">
          <Split className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-slate-100 leading-snug truncate">
            {nodeData.label || 'Condition Check'}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
            {nodeData.description || 'Evaluates rules and routes execution flow.'}
          </p>
        </div>
      </div>

      {/* Technical Code Snippet */}
      <NodeCodeSnippet nodeType="condition" data={nodeData} />

      {/* Branch Indicators & Outgoing Ports */}
      <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-2">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Outgoing Branches ({branches.length})
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {branches.map((branch, idx) => (
            <div
              key={branch.handleId}
              className="relative flex items-center justify-between p-1.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-[11px]"
            >
              <span className="font-medium text-slate-200 truncate pr-2">
                {branch.label}
              </span>
              <Handle
                type="source"
                position={Position.Bottom}
                id={branch.handleId}
                style={{
                  left: `${((idx + 0.5) / branches.length) * 100}%`,
                  bottom: '-8px',
                  backgroundColor: branch.color || '#F59E0B'
                }}
                className="!w-3 !h-3 !border-2 !border-slate-900 transition-transform hover:!scale-150 cursor-crosshair"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

ConditionNode.displayName = 'ConditionNode';

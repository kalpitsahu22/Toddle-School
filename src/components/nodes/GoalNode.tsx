import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Target, RotateCcw, CheckCircle2, AlertTriangle, ShieldCheck, Hourglass } from 'lucide-react';
import { NodeData } from '../../types/workflow';
import { NodeCodeSnippet } from './NodeCodeSnippet';

export const GoalNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as unknown as NodeData;
  const status = nodeData.executionStatus || 'idle';
  const attempts = nodeData.executionAttempts || 0;
  const maxAttempts = nodeData.goalMaxAttempts || 7;

  return (
    <div
      className={`relative min-w-[300px] max-w-[350px] rounded-xl border bg-slate-900/95 backdrop-blur-md p-4 transition-all duration-300 shadow-xl ${
        selected
          ? 'border-orange-400 ring-2 ring-orange-400/30 shadow-orange-500/20'
          : 'border-orange-600/40 hover:border-orange-500/80 shadow-black/40'
      } ${
        status === 'waiting'
          ? 'border-orange-400 ring-4 ring-orange-500/40 animate-pulse bg-orange-950/20'
          : status === 'completed'
          ? 'border-emerald-500/80 bg-slate-900/95'
          : ''
      }`}
    >
      {/* Top Incoming Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="!w-3.5 !h-3.5 !bg-orange-400 !border-2 !border-slate-900 transition-transform hover:!scale-125 cursor-crosshair"
      />

      {/* Header Pill & Status */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-[10px] font-semibold uppercase tracking-wider text-orange-400">
          <Target className="w-3 h-3" />
          <span>Persistent Goal</span>
        </div>

        {status === 'waiting' && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-[11px] font-medium animate-pulse">
            <RotateCcw className="w-2.5 h-2.5 animate-spin" /> Checking ({attempts}/{maxAttempts})
          </span>
        )}
        {status === 'completed' && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Goal Met
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex items-start gap-3 mb-2">
        <div className="p-2.5 rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-300 shrink-0">
          <Target className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-slate-100 leading-snug truncate">
            {nodeData.label || 'Goal: Objective Target'}
          </h4>
          <p className="text-xs text-orange-300/80 mt-0.5 truncate">
            Interval: Every {nodeData.goalCheckIntervalHours || 24}h · Max {maxAttempts} attempts
          </p>
        </div>
      </div>

      {/* Technical Code Snippet */}
      <NodeCodeSnippet nodeType="goal" data={nodeData} />

      {/* Goal Explanation & Fast-Track Badge */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1 text-emerald-400/90 text-[10px]">
          <ShieldCheck className="w-3 h-3" /> Offline Wire Bypass Enabled
        </span>
      </div>

      {/* Success Outgoing Handle (Bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="success"
        className="!w-3.5 !h-3.5 !bg-emerald-400 !border-2 !border-slate-900 transition-transform hover:!scale-125 cursor-crosshair"
        title="Goal Satisfied"
      />

      {/* Timeout / Expire Outgoing Handle (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        id="timeout"
        className="!w-3.5 !h-3.5 !bg-red-400 !border-2 !border-slate-900 transition-transform hover:!scale-125 cursor-crosshair"
        title="Goal Timeout / Expired"
      />
    </div>
  );
});

GoalNode.displayName = 'GoalNode';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Clock, Hourglass, CheckCircle2, AlertCircle } from 'lucide-react';
import { NodeData } from '../../types/workflow';
import { NodeCodeSnippet } from './NodeCodeSnippet';

export const DelayNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as unknown as NodeData;
  const status = nodeData.executionStatus || 'idle';

  return (
    <div
      className={`relative min-w-[280px] max-w-[340px] rounded-xl border bg-slate-900/95 backdrop-blur-md p-4 transition-all duration-300 shadow-xl ${
        selected
          ? 'border-purple-400 ring-2 ring-purple-400/30 shadow-purple-500/20'
          : 'border-purple-600/40 hover:border-purple-500/80 shadow-black/40'
      } ${
        status === 'running' || status === 'waiting'
          ? 'border-purple-400 ring-4 ring-purple-500/40 animate-pulse bg-purple-950/20'
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
        className="!w-3.5 !h-3.5 !bg-purple-400 !border-2 !border-slate-900 transition-transform hover:!scale-125 cursor-crosshair"
      />

      {/* Header Pill & Status */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-[10px] font-semibold uppercase tracking-wider text-purple-400">
          <Clock className="w-3 h-3" />
          <span>Delay / SLA</span>
        </div>

        {status === 'waiting' && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-medium animate-pulse">
            <Hourglass className="w-2.5 h-2.5 animate-spin" /> Timer Active
          </span>
        )}
        {status === 'completed' && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Elapsed
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex items-start gap-3 mb-2">
        <div className="p-2.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 shrink-0">
          <Hourglass className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-slate-100 leading-snug truncate">
            {nodeData.label || 'Wait Duration'}
          </h4>
          <p className="text-xs text-purple-300/90 font-mono mt-0.5">
            {nodeData.delayDuration || 24} {nodeData.delayUnit || 'hours'} ({nodeData.delayType || 'fixed'})
          </p>
        </div>
      </div>

      {/* Technical Code Snippet */}
      <NodeCodeSnippet nodeType="delay" data={nodeData} />

      {/* SLA Escalation notice */}
      {nodeData.allowEarlyActionBypass && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-purple-400/90">
          <span>Early Action Bypass</span>
          <span className="text-emerald-400">Active</span>
        </div>
      )}

      {/* Bottom Outgoing Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="source"
        className="!w-3.5 !h-3.5 !bg-purple-400 !border-2 !border-slate-900 transition-transform hover:!scale-125 cursor-crosshair"
      />

      {/* Optional Side Handle for SLA Breach Escalation */}
      <Handle
        type="source"
        position={Position.Right}
        id="sla_escalate"
        className="!w-3.5 !h-3.5 !bg-amber-400 !border-2 !border-slate-900 transition-transform hover:!scale-125 cursor-crosshair"
        title="SLA Breached Path"
      />
    </div>
  );
});

DelayNode.displayName = 'DelayNode';

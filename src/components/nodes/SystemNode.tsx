import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Cpu, CheckCircle2, Server, Check } from 'lucide-react';
import { NodeData } from '../../types/workflow';
import { NodeCodeSnippet } from './NodeCodeSnippet';

export const SystemNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as unknown as NodeData;
  const status = nodeData.executionStatus || 'idle';

  return (
    <div
      className={`relative min-w-[280px] max-w-[340px] rounded-xl border bg-slate-900/95 backdrop-blur-md p-4 transition-all duration-300 shadow-xl ${
        selected
          ? 'border-teal-400 ring-2 ring-teal-400/30 shadow-teal-500/20'
          : 'border-teal-600/40 hover:border-teal-500/80 shadow-black/40'
      } ${
        status === 'running'
          ? 'border-teal-400 ring-4 ring-teal-500/40 animate-pulse bg-teal-950/20'
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
        className="!w-3.5 !h-3.5 !bg-teal-400 !border-2 !border-slate-900 transition-transform hover:!scale-125 cursor-crosshair"
      />

      {/* Header Pill & Status */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-[10px] font-semibold uppercase tracking-wider text-teal-400">
          <Cpu className="w-3 h-3" />
          <span>System / Handover</span>
        </div>

        {status === 'completed' && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Active Enrolled
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex items-start gap-3 mb-2">
        <div className="p-2.5 rounded-lg bg-teal-500/20 border border-teal-500/30 text-teal-300 shrink-0">
          <Server className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-slate-100 leading-snug truncate">
            {nodeData.label || 'System Handover'}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
            {nodeData.description || 'Provisions student portal and assigns academic roster.'}
          </p>
        </div>
      </div>

      {/* Technical Code Snippet */}
      <NodeCodeSnippet nodeType="system" data={nodeData} />

      {/* Phase */}
      {nodeData.phase && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="truncate">{nodeData.phase}</span>
          <span className="text-[10px] text-teal-400 font-semibold">Terminal State</span>
        </div>
      )}

      {/* Outgoing Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="source"
        className="!w-3.5 !h-3.5 !bg-teal-400 !border-2 !border-slate-900 transition-transform hover:!scale-125 cursor-crosshair"
      />
    </div>
  );
});

SystemNode.displayName = 'SystemNode';

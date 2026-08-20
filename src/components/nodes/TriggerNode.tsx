import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FileSpreadsheet, Sparkles, CheckCircle2, Play, AlertCircle } from 'lucide-react';
import { NodeData } from '../../types/workflow';
import { NodeCodeSnippet } from './NodeCodeSnippet';

export const TriggerNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as unknown as NodeData;
  const status = nodeData.executionStatus || 'idle';

  return (
    <div
      className={`relative min-w-[280px] max-w-[340px] rounded-xl border bg-slate-900/95 backdrop-blur-md p-4 transition-all duration-300 shadow-xl ${
        selected
          ? 'border-emerald-400 ring-2 ring-emerald-400/30 shadow-emerald-500/20'
          : 'border-emerald-600/40 hover:border-emerald-500/80 shadow-black/40'
      } ${
        status === 'running'
          ? 'border-emerald-400 ring-4 ring-emerald-500/40 animate-pulse'
          : status === 'completed'
          ? 'border-emerald-500 bg-emerald-950/30'
          : ''
      }`}
    >
      {/* Category Pill & Status Badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
          <Sparkles className="w-3 h-3" />
          <span>Trigger</span>
        </div>

        {status === 'running' && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-medium animate-pulse">
            <Play className="w-2.5 h-2.5 fill-current" /> Active
          </span>
        )}
        {status === 'completed' && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Fired
          </span>
        )}
      </div>

      {/* Title & Icon */}
      <div className="flex items-start gap-3 mb-2">
        <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 shrink-0">
          <FileSpreadsheet className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-slate-100 leading-snug truncate">
            {nodeData.label || 'Trigger'}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            {nodeData.formName || nodeData.triggerEvent || 'Admission Event'}
          </p>
        </div>
      </div>

      {/* Technical Code Snippet */}
      <NodeCodeSnippet nodeType="trigger" data={nodeData} />

      {/* Description or Phase tag */}
      {nodeData.phase && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="truncate">{nodeData.phase}</span>
          <span className="text-[10px] text-emerald-400 font-mono">Event Listener</span>
        </div>
      )}

      {/* Outgoing Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="source"
        className="!w-3.5 !h-3.5 !bg-emerald-400 !border-2 !border-slate-900 transition-transform hover:!scale-125 cursor-crosshair"
      />
    </div>
  );
});

TriggerNode.displayName = 'TriggerNode';

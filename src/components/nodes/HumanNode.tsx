import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Users, UserCheck, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { NodeData } from '../../types/workflow';
import { NodeCodeSnippet } from './NodeCodeSnippet';

export const HumanNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as unknown as NodeData;
  const status = nodeData.executionStatus || 'idle';
  const outcomes = nodeData.allowedOutcomes || [
    { actionId: 'admit', label: 'Admit', variant: 'success' },
    { actionId: 'waitlist', label: 'Waitlist', variant: 'warning' },
    { actionId: 'conditional', label: 'Conditional Offer', variant: 'info' },
    { actionId: 'decline', label: 'Decline', variant: 'danger' }
  ];

  return (
    <div
      className={`relative min-w-[310px] max-w-[360px] rounded-xl border bg-slate-900/95 backdrop-blur-md p-4 transition-all duration-300 shadow-xl ${
        selected
          ? 'border-rose-400 ring-2 ring-rose-400/30 shadow-rose-500/20'
          : 'border-rose-600/40 hover:border-rose-500/80 shadow-black/40'
      } ${
        status === 'waiting'
          ? 'border-rose-400 ring-4 ring-rose-500/50 bg-rose-950/40 animate-pulse-glow'
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
        className="!w-3.5 !h-3.5 !bg-rose-400 !border-2 !border-slate-900 transition-transform hover:!scale-125 cursor-crosshair"
      />

      {/* Header Pill & Status */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-[10px] font-semibold uppercase tracking-wider text-rose-400">
          <Users className="w-3 h-3" />
          <span>Human Review</span>
        </div>

        {status === 'waiting' && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/30 border border-rose-400/40 text-rose-200 text-[11px] font-bold animate-pulse">
            <ShieldAlert className="w-3 h-3 text-rose-300" /> Awaiting Action
          </span>
        )}
        {status === 'completed' && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Decided
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex items-start gap-3 mb-2">
        <div className="p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 shrink-0">
          <UserCheck className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-slate-100 leading-snug truncate">
            {nodeData.label || 'Human Review'}
          </h4>
          <p className="text-xs text-rose-300/80 font-medium mt-0.5 truncate">
            Assignee: {nodeData.assignedRole || 'Admissions Committee'}
          </p>
        </div>
      </div>

      {/* Technical Code Snippet */}
      <NodeCodeSnippet nodeType="human" data={nodeData} />

      {/* Decision Outcomes / Branch Ports */}
      <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          <span>Decisions ({outcomes.length})</span>
          {nodeData.timeoutHours && (
            <span className="flex items-center gap-1 text-slate-400 font-normal">
              <Clock className="w-2.5 h-2.5" /> {nodeData.timeoutHours}h SLA
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {outcomes.map((outcome, idx) => (
            <div
              key={outcome.actionId}
              className={`relative flex items-center justify-between p-1.5 rounded-md border text-[11px] font-medium ${
                outcome.variant === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : outcome.variant === 'warning'
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                  : outcome.variant === 'danger'
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  : 'bg-blue-950/40 border-blue-500/40 text-blue-300'
              }`}
            >
              <span className="truncate pr-2">{outcome.label}</span>
              <Handle
                type="source"
                position={Position.Bottom}
                id={outcome.actionId}
                style={{
                  left: `${((idx + 0.5) / outcomes.length) * 100}%`,
                  bottom: '-8px'
                }}
                className={`!w-3 !h-3 !border-2 !border-slate-900 transition-transform hover:!scale-150 cursor-crosshair ${
                  outcome.variant === 'success'
                    ? '!bg-emerald-400'
                    : outcome.variant === 'warning'
                    ? '!bg-amber-400'
                    : outcome.variant === 'danger'
                    ? '!bg-rose-400'
                    : '!bg-blue-400'
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

HumanNode.displayName = 'HumanNode';

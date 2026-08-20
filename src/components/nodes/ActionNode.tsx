import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Mail, MessageSquare, ScanLine, FileCheck, Server, Zap, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { NodeData } from '../../types/workflow';
import { NodeCodeSnippet } from './NodeCodeSnippet';

function getActionIcon(service?: string) {
  switch (service) {
    case 'email':
      return <Mail className="w-5 h-5" />;
    case 'whatsapp':
    case 'sms':
      return <MessageSquare className="w-5 h-5" />;
    case 'ocr_scanner':
      return <ScanLine className="w-5 h-5" />;
    case 'pdf_generator':
      return <FileCheck className="w-5 h-5" />;
    case 'sis_sync':
      return <Server className="w-5 h-5" />;
    default:
      return <Zap className="w-5 h-5" />;
  }
}

export const ActionNode = memo(({ id, data, selected }: NodeProps) => {
  const nodeData = data as unknown as NodeData;
  const status = nodeData.executionStatus || 'idle';

  return (
    <div
      className={`relative min-w-[280px] max-w-[340px] rounded-xl border bg-slate-900/95 backdrop-blur-md p-4 transition-all duration-300 shadow-xl ${
        selected
          ? 'border-blue-400 ring-2 ring-blue-400/30 shadow-blue-500/20'
          : 'border-blue-600/40 hover:border-blue-500/80 shadow-black/40'
      } ${
        status === 'running'
          ? 'border-blue-400 ring-4 ring-blue-500/40 animate-pulse bg-blue-950/20'
          : status === 'completed'
          ? 'border-emerald-500/80 bg-slate-900/95'
          : status === 'failed'
          ? 'border-red-500 bg-red-950/30'
          : ''
      }`}
    >
      {/* Top Incoming Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="!w-3.5 !h-3.5 !bg-blue-400 !border-2 !border-slate-900 transition-transform hover:!scale-125 cursor-crosshair"
      />

      {/* Header Pill & Status */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-[10px] font-semibold uppercase tracking-wider text-blue-400">
          <Zap className="w-3 h-3" />
          <span>Action</span>
        </div>

        {status === 'running' && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-medium animate-pulse">
            <Loader2 className="w-2.5 h-2.5 animate-spin" /> Executing
          </span>
        )}
        {status === 'completed' && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Success
          </span>
        )}
        {status === 'failed' && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[11px] font-medium">
            <AlertTriangle className="w-3 h-3 text-red-400" /> Error
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 shrink-0">
          {getActionIcon(nodeData.actionService)}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-slate-100 leading-snug truncate">
            {nodeData.label || 'Execute Action'}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            {nodeData.recipient || nodeData.sisEndpoint || nodeData.subtitle || 'Automated Step'}
          </p>
        </div>
      </div>

      {/* Technical Code Snippet */}
      <NodeCodeSnippet nodeType="action" data={nodeData} />

      {/* Phase / Footer */}
      {nodeData.phase && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="truncate">{nodeData.phase}</span>
          {nodeData.retryPolicy?.enabled && (
            <span className="text-[10px] text-blue-400/80 font-mono">
              {nodeData.retryPolicy.maxRetries} Retries ({nodeData.retryPolicy.backoff})
            </span>
          )}
        </div>
      )}

      {/* Bottom Outgoing Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="source"
        className="!w-3.5 !h-3.5 !bg-blue-400 !border-2 !border-slate-900 transition-transform hover:!scale-125 cursor-crosshair"
      />
    </div>
  );
});

ActionNode.displayName = 'ActionNode';

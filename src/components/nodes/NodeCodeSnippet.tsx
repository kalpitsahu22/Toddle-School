import React, { useState } from 'react';
import { Code2, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { NodeType, NodeData } from '../../types/workflow';
import { generateNodeCodeSnippet } from '../../engine/codeSnippetGenerator';
import { useWorkflowStore } from '../../store/workflowStore';

interface NodeCodeSnippetProps {
  nodeType: NodeType;
  data: NodeData;
  defaultExpanded?: boolean;
}

export const NodeCodeSnippet: React.FC<NodeCodeSnippetProps> = ({
  nodeType,
  data,
  defaultExpanded = true
}) => {
  const { showCodeSnippets } = useWorkflowStore();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);

  if (!showCodeSnippets) return null;

  const snippet = generateNodeCodeSnippet(nodeType, data);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mt-2.5 rounded-lg bg-slate-950/90 border border-slate-800/90 overflow-hidden shadow-inner text-left">
      {/* Code Header Bar */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="px-2 py-1 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400 cursor-pointer hover:text-slate-200 transition-colors select-none"
      >
        <span className="flex items-center gap-1 font-semibold text-blue-400">
          <Code2 className="w-3 h-3 text-blue-400" />
          <span>Technical Logic</span>
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            title="Copy technical code snippet"
            className="p-0.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </div>
      </div>

      {/* Code Block */}
      {isExpanded && (
        <pre className="p-2 text-[10px] leading-relaxed font-mono overflow-x-auto text-slate-300 whitespace-pre scrollbar-thin selection:bg-blue-500/30">
          <code>{snippet}</code>
        </pre>
      )}
    </div>
  );
};

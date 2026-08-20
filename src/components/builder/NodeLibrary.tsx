import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Mail,
  MessageSquare,
  ScanLine,
  FileCheck,
  Server,
  GitFork,
  Split,
  Clock,
  Users,
  Target,
  Cpu,
  Search,
  Plus,
  GripVertical,
  Trash2,
  Sparkles,
  Send,
  ShieldCheck,
  DollarSign,
  Webhook,
  FileText,
  Layers
} from 'lucide-react';
import { BUILT_IN_NODE_DEFINITIONS, NodeDefinition } from '../../data/nodeDefinitions';
import { useWorkflowStore } from '../../store/workflowStore';
import { NodeType, NodeCategory } from '../../types/workflow';

const CATEGORIES: Array<{ id: string; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'custom', label: '🎨 Custom' },
  { id: 'Trigger', label: 'Triggers' },
  { id: 'Action', label: 'Actions' },
  { id: 'Logic', label: 'Logic' },
  { id: 'Control', label: 'Delays' },
  { id: 'Human', label: 'Human' },
  { id: 'Persistent Goal', label: 'Goals' },
  { id: 'System / SIS', label: 'System' }
];

function getIconComponent(iconName: string) {
  switch (iconName) {
    case 'FileSpreadsheet':
      return <FileSpreadsheet className="w-4 h-4" />;
    case 'Mail':
      return <Mail className="w-4 h-4" />;
    case 'MessageSquare':
      return <MessageSquare className="w-4 h-4" />;
    case 'ScanLine':
      return <ScanLine className="w-4 h-4" />;
    case 'FileCheck':
      return <FileCheck className="w-4 h-4" />;
    case 'Server':
      return <Server className="w-4 h-4" />;
    case 'GitFork':
      return <GitFork className="w-4 h-4" />;
    case 'Split':
      return <Split className="w-4 h-4" />;
    case 'Clock':
      return <Clock className="w-4 h-4" />;
    case 'Users':
      return <Users className="w-4 h-4" />;
    case 'Target':
      return <Target className="w-4 h-4" />;
    case 'Cpu':
      return <Cpu className="w-4 h-4" />;
    case 'Send':
      return <Send className="w-4 h-4" />;
    case 'ShieldCheck':
      return <ShieldCheck className="w-4 h-4" />;
    case 'DollarSign':
      return <DollarSign className="w-4 h-4" />;
    case 'Webhook':
      return <Webhook className="w-4 h-4" />;
    case 'FileText':
      return <FileText className="w-4 h-4" />;
    case 'Layers':
      return <Layers className="w-4 h-4" />;
    case 'Search':
      return <Search className="w-4 h-4" />;
    case 'Sparkles':
    default:
      return <Sparkles className="w-4 h-4" />;
  }
}

export const NodeLibrary: React.FC = () => {
  const {
    addNode,
    customNodeDefinitions,
    deleteCustomNodeDefinition,
    setIsCustomNodeModalOpen
  } = useWorkflowStore();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Combine built-in node definitions + user's custom node definitions
  const allNodeEntries: Array<{ key: string; def: NodeDefinition; isCustom?: boolean }> = [
    ...Object.entries(BUILT_IN_NODE_DEFINITIONS).map(([k, d]) => ({ key: k, def: d, isCustom: false })),
    ...customNodeDefinitions.map((d) => ({ key: d.id || d.subtype, def: d, isCustom: true }))
  ];

  const filteredNodes = allNodeEntries.filter(({ def, isCustom }) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'custom' && isCustom) ||
      def.category === selectedCategory;

    const matchesQuery =
      def.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      def.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      def.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesQuery;
  });

  const handleDragStart = (
    event: React.DragEvent,
    nodeType: NodeType,
    subtype: string
  ) => {
    event.dataTransfer.setData('application/reactflow-type', nodeType);
    event.dataTransfer.setData('application/reactflow-subtype', subtype);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-80 bg-slate-900/95 border-r border-slate-800 flex flex-col h-full z-20 shrink-0 select-none">
      {/* Header & Custom Node Creator Button */}
      <div className="p-4 border-b border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">
              Node Library
            </h3>
            <p className="text-xs text-slate-400">
              Drag cards or compose custom nodes
            </p>
          </div>

          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {filteredNodes.length} items
          </span>
        </div>

        {/* Create Custom Node Trigger Button */}
        <button
          onClick={() => setIsCustomNodeModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Create Custom Node</span>
        </button>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search triggers, actions, custom..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs text-slate-200 placeholder-slate-500 outline-none transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Draggable Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredNodes.map(({ key, def, isCustom }) => (
          <div
            key={key}
            draggable
            onDragStart={(e) => handleDragStart(e, def.type, key)}
            className={`group relative rounded-xl border p-3 transition-all duration-200 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md ${
              isCustom
                ? 'border-indigo-500/40 bg-indigo-950/20 hover:bg-indigo-950/30 hover:border-indigo-400'
                : 'border-slate-800 bg-slate-850/60 hover:bg-slate-800/90 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5 min-w-0">
                <div
                  className={`p-2 rounded-lg ${def.colorTheme?.bg || 'bg-blue-950/40'} ${def.colorTheme?.text || 'text-blue-300'} border ${def.colorTheme?.border || 'border-blue-500/40'} shrink-0 mt-0.5`}
                >
                  {getIconComponent(def.iconName)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded ${def.colorTheme?.badgeBg || 'bg-blue-500/20'} ${def.colorTheme?.badgeText || 'text-blue-300'}`}
                    >
                      {def.category}
                    </span>
                    {isCustom && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                        Custom
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 leading-snug truncate group-hover:text-white">
                    {def.label}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {def.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {isCustom && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete custom node template "${def.label}"?`)) {
                        deleteCustomNodeDefinition(def.id || key);
                      }
                    }}
                    title="Delete custom node template"
                    className="p-1 rounded bg-rose-950/80 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => addNode(def.type, key)}
                  title="Add to canvas"
                  className="p-1 rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <GripVertical className="w-3 h-3" /> Drag onto canvas
              </span>
              <span className="font-mono text-slate-600">{def.type}</span>
            </div>
          </div>
        ))}

        {filteredNodes.length === 0 && (
          <div className="text-center py-10 px-4 text-slate-500 text-xs">
            No matching nodes found for &ldquo;{searchQuery}&rdquo;
          </div>
        )}
      </div>
    </aside>
  );
};

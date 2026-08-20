import React, { useState } from 'react';
import { X, Plus, Sparkles, Copy, FileText } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { INITIAL_WORKFLOWS } from '../../data/exampleWorkflows';

export const CreateWorkflowModal: React.FC = () => {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    createWorkflow,
    workflows
  } = useWorkflowStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startMode, setStartMode] = useState<'blank' | 'template' | 'duplicate'>('template');
  const [selectedTemplateId, setSelectedTemplateId] = useState(INITIAL_WORKFLOWS[0].id);
  const [selectedDuplicateId, setSelectedDuplicateId] = useState(workflows[0]?.id || '');

  if (!isCreateModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createWorkflow({
      name: name || (startMode === 'blank' ? 'Custom Admission Flow' : 'New School Workflow'),
      description,
      startMode,
      templateId: selectedTemplateId,
      duplicateWorkflowId: selectedDuplicateId
    });
    setName('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={() => setIsCreateModalOpen(false)}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Create New Workflow</h3>
            <p className="text-xs text-slate-400">Compose a tailored admission or onboarding graph</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Workflow Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. International Baccalaureate Admission 2026"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800/90 border border-slate-700 focus:border-blue-500 text-xs text-slate-100 outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Customized flow for overseas boarders with automated visa OCR."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800/90 border border-slate-700 focus:border-blue-500 text-xs text-slate-300 outline-none"
            />
          </div>

          {/* Start Mode Options */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Start With
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStartMode('template')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  startMode === 'template'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-md ring-1 ring-blue-500/30'
                    : 'bg-slate-800/60 border-slate-750 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Sparkles className="w-4 h-4 mb-1.5 text-blue-400" />
                <div className="text-xs font-bold">Template</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Pre-built flows</div>
              </button>

              <button
                type="button"
                onClick={() => setStartMode('blank')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  startMode === 'blank'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-md ring-1 ring-blue-500/30'
                    : 'bg-slate-800/60 border-slate-750 text-slate-400 hover:border-slate-600'
                }`}
              >
                <FileText className="w-4 h-4 mb-1.5 text-emerald-400" />
                <div className="text-xs font-bold">Blank Canvas</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Start from scratch</div>
              </button>

              <button
                type="button"
                onClick={() => setStartMode('duplicate')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  startMode === 'duplicate'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-md ring-1 ring-blue-500/30'
                    : 'bg-slate-800/60 border-slate-750 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Copy className="w-4 h-4 mb-1.5 text-purple-400" />
                <div className="text-xs font-bold">Duplicate</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Clone existing flow</div>
              </button>
            </div>
          </div>

          {/* Template Sub-selection */}
          {startMode === 'template' && (
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
              <label className="text-[11px] text-slate-400 block">Select Template</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 outline-none"
              >
                {INITIAL_WORKFLOWS.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name} ({tpl.nodes.length} nodes)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Duplicate Sub-selection */}
          {startMode === 'duplicate' && (
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
              <label className="text-[11px] text-slate-400 block">Select Workflow to Clone</label>
              <select
                value={selectedDuplicateId}
                onChange={(e) => setSelectedDuplicateId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 outline-none"
              >
                {workflows.map((wf) => (
                  <option key={wf.id} value={wf.id}>
                    {wf.name} (v{wf.version})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Submit */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all"
            >
              Create Workflow
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

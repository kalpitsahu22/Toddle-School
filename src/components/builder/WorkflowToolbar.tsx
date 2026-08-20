import React, { useState } from 'react';
import {
  Play,
  Square,
  Sparkles,
  Save,
  CheckCircle,
  Copy,
  Plus,
  Trash2,
  Share2,
  FileCode,
  LayoutGrid,
  BookOpen,
  AlertTriangle,
  RotateCcw,
  ChevronDown,
  Code2,
  Printer,
  FileText
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { printWorkflowSddPdf, downloadWorkflowSddMarkdown } from '../../utils/sddExport';

export const WorkflowToolbar: React.FC = () => {
  const {
    workflows,
    activeWorkflowId,
    setActiveWorkflow,
    saveWorkflow,
    publishWorkflow,
    duplicateWorkflow,
    deleteWorkflow,
    autoLayout,
    isDirty,
    isTestMode,
    setTestMode,
    startExecution,
    pauseExecution,
    isExecuting,
    resetExecution,
    validationResult,
    setIsValidationModalOpen,
    setIsCreateModalOpen,
    setIsArchitectureModalOpen,
    setIsJsonModalOpen,
    resetToDefaults,
    showCodeSnippets,
    setShowCodeSnippets
  } = useWorkflowStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const activeWorkflow = workflows.find((w) => w.id === activeWorkflowId) || workflows[0];

  return (
    <header className="h-16 px-4 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md flex items-center justify-between z-30 shrink-0 select-none">
      {/* Left: Brand & Workflow Selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 pr-3 border-r border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-white">Toddle</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Builder
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Plug-and-Play Workflow Playground</p>
          </div>
        </div>

        {/* Workflow Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-semibold transition-all hover:bg-slate-800"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="max-w-[200px] truncate">{activeWorkflow.name}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-mono">
              v{activeWorkflow.version}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-80 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Select Workflow</span>
                <span className="font-mono text-slate-500">{workflows.length} total</span>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2.5 my-1.5 pr-1 scrollbar-thin">
                {/* Group 1: 9 Core Modular Flows */}
                <div>
                  <div className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-blue-400 bg-blue-950/50 rounded border border-blue-500/20 mb-1 flex items-center justify-between">
                    <span>⚡ 9 Core Admission Phases</span>
                    <span className="font-mono text-[9px] text-blue-300">9 Flows</span>
                  </div>
                  <div className="space-y-0.5">
                    {workflows
                      .filter((w) => w.workflowType === 'modular_phase' || w.name.match(/^\d\./))
                      .map((wf) => (
                        <button
                          key={wf.id}
                          onClick={() => {
                            setActiveWorkflow(wf.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            wf.id === activeWorkflowId
                              ? 'bg-blue-600/25 text-blue-200 border border-blue-500/40 font-semibold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span className="truncate pr-2">{wf.name}</span>
                          <span className="text-[10px] font-mono text-slate-500 shrink-0">
                            {wf.nodes.length} nodes
                          </span>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Group 2: Edge Cases & Customizable Sub-Flowcharts */}
                <div>
                  <div className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-950/40 rounded border border-amber-500/20 mb-1 flex items-center justify-between">
                    <span>🎯 Edge Cases & Sub-Flowcharts</span>
                    <span className="font-mono text-[9px] text-amber-300">6 Scenarios</span>
                  </div>
                  <div className="space-y-0.5">
                    {workflows
                      .filter((w) => w.workflowType === 'sub_scenario' || (w.tags && w.tags.includes('Edge Case')))
                      .map((wf) => (
                        <button
                          key={wf.id}
                          onClick={() => {
                            setActiveWorkflow(wf.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            wf.id === activeWorkflowId
                              ? 'bg-amber-600/25 text-amber-200 border border-amber-500/40 font-semibold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span className="truncate pr-2">{wf.name}</span>
                          <span className="text-[10px] font-mono text-slate-500 shrink-0">
                            {wf.nodes.length} nodes
                          </span>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Group 3: Composed Flagship Master Blueprint */}
                <div>
                  <div className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-950/40 rounded border border-indigo-500/20 mb-1 flex items-center justify-between">
                    <span>🏫 Master Composed Blueprint</span>
                    <span className="font-mono text-[9px] text-indigo-300">9 Phases End-to-End</span>
                  </div>
                  <div className="space-y-0.5">
                    {workflows
                      .filter(
                        (w) =>
                          w.workflowType !== 'modular_phase' &&
                          w.workflowType !== 'sub_scenario' &&
                          !w.name.match(/^\d\./) &&
                          (!w.tags || !w.tags.includes('Edge Case'))
                      )
                      .map((wf) => (
                        <button
                          key={wf.id}
                          onClick={() => {
                            setActiveWorkflow(wf.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            wf.id === activeWorkflowId
                              ? 'bg-indigo-600/25 text-indigo-200 border border-indigo-500/40 font-semibold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span className="truncate pr-2">{wf.name}</span>
                          <span className="text-[10px] font-mono text-slate-500 shrink-0">
                            {wf.nodes.length} nodes
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsCreateModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold shadow-sm"
                >
                  <Plus className="w-3 h-3" /> New Flow
                </button>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    duplicateWorkflow(activeWorkflowId);
                  }}
                  className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-[11px] font-medium border border-slate-700"
                >
                  <Copy className="w-3 h-3" /> Duplicate
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Status Pill */}
        <div className="hidden lg:flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
              activeWorkflow.status === 'published'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            }`}
          >
            {activeWorkflow.status}
          </span>
          {isDirty && (
            <span className="text-[10px] text-amber-400 font-medium animate-pulse">
              ● Unsaved Changes
            </span>
          )}
        </div>
      </div>

      {/* Middle: Canvas Tools */}
      <div className="flex items-center gap-2">
        <button
          onClick={autoLayout}
          title="Auto-organize graph layout using Dagre hierarchy"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-slate-600 text-slate-300 text-xs font-medium transition-all"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Auto-Layout</span>
        </button>

        {/* Technical Code Snippet Toggle */}
        <button
          onClick={() => setShowCodeSnippets(!showCodeSnippets)}
          title="Toggle technical logic code snippets on canvas nodes"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
            showCodeSnippets
              ? 'bg-blue-600/25 border-blue-500/60 text-blue-300 shadow-sm'
              : 'bg-slate-800/80 border-slate-700 hover:border-slate-600 text-slate-400'
          }`}
        >
          <Code2 className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Logic Snippets: {showCodeSnippets ? 'ON' : 'OFF'}</span>
        </button>

        <button
          onClick={() => setIsValidationModalOpen(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            validationResult.isValid
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/50'
              : 'bg-amber-950/40 border-amber-500/50 text-amber-300 hover:bg-amber-950/60 animate-pulse'
          }`}
        >
          {validationResult.isValid ? (
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>
            {validationResult.isValid
              ? 'Valid Graph'
              : `${validationResult.issues.length} Issues`}
          </span>
        </button>
      </div>

      {/* Right: Actions (Save, Test, Publish, SDD) */}
      <div className="flex items-center gap-2">
        {/* SDD Download Button Dropdown */}
        <div className="relative group">
          <button
            onClick={() => printWorkflowSddPdf(activeWorkflow)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600/80 to-indigo-600/80 hover:from-blue-600 hover:to-indigo-600 border border-blue-400/40 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95"
            title="Download full Software Design Document (SDD) for current active flow"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Download SDD</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {/* Quick Dropdown Options */}
          <div className="absolute top-full right-0 mt-1 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-50 hidden group-hover:block hover:block animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-1">
              Export SDD Document
            </div>
            <button
              onClick={() => printWorkflowSddPdf(activeWorkflow)}
              className="w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center gap-2 text-slate-200 hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Printer className="w-4 h-4 text-blue-400 group-hover:text-white" />
              <div>
                <div className="font-bold">Print / Save as PDF</div>
                <div className="text-[10px] opacity-75">Styled printable document with code & diagrams</div>
              </div>
            </button>
            <button
              onClick={() => downloadWorkflowSddMarkdown(activeWorkflow)}
              className="w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center gap-2 text-slate-200 hover:bg-indigo-600 hover:text-white transition-colors"
            >
              <FileText className="w-4 h-4 text-indigo-400 group-hover:text-white" />
              <div>
                <div className="font-bold">Download Markdown (.md)</div>
                <div className="text-[10px] opacity-75">Raw technical markdown spec</div>
              </div>
            </button>
          </div>
        </div>

        <button
          onClick={() => setIsArchitectureModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/40 text-xs font-semibold transition-all shadow-sm"
          title="System Architecture & Interview Design Document"
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">Architecture</span>
        </button>

        <button
          onClick={() => setIsJsonModalOpen(true, 'export')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-slate-600 text-slate-300 text-xs font-medium transition-all"
          title="Export / Import Workflow JSON"
        >
          <FileCode className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">JSON</span>
        </button>

        <button
          onClick={saveWorkflow}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 text-xs font-semibold transition-all"
        >
          <Save className="w-3.5 h-3.5 text-slate-300" />
          <span>Save</span>
        </button>

        {/* Test Workflow Button */}
        {!isTestMode ? (
          <button
            onClick={() => startExecution()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Test Workflow</span>
          </button>
        ) : (
          <button
            onClick={() => setTestMode(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-500/25 transition-all"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop Test</span>
          </button>
        )}

        <button
          onClick={publishWorkflow}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Publish</span>
        </button>
      </div>
    </header>
  );
};

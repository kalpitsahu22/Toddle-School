import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Layers,
  Cpu,
  GitBranch,
  Target,
  ShieldCheck,
  Server,
  Workflow as WorkflowIcon,
  CheckCircle2,
  Printer,
  FileText,
  Download,
  Copy,
  Check,
  Loader2
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import {
  downloadWorkflowSddPdf,
  printWorkflowSddPdf,
  downloadWorkflowSddMarkdown,
  generateWorkflowSddMarkdown
} from '../../utils/sddExport';
import { generateNodeCodeSnippet } from '../../engine/codeSnippetGenerator';

export const ArchitectureModal: React.FC = () => {
  const { isArchitectureModalOpen, setIsArchitectureModalOpen, workflows, activeWorkflowId } = useWorkflowStore();
  const [activeTab, setActiveTab] = useState<'sdd' | 'overview' | 'earlyaction' | 'graph' | 'lifecycle' | 'goals' | 'production'>('sdd');
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const activeWorkflow = workflows.find((w) => w.id === activeWorkflowId) || workflows[0];

  if (!isArchitectureModalOpen) return null;

  const handleCopyMarkdown = () => {
    if (!activeWorkflow) return;
    const md = generateWorkflowSddMarkdown(activeWorkflow);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      await downloadWorkflowSddPdf(activeWorkflow);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 lg:p-8 animate-in fade-in duration-150">
      <div className="w-full max-w-5xl h-[88vh] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>Workflow Builder Architecture & SDD</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                  Active: {activeWorkflow.name}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Plug-and-play visual graph engine, node execution model & SDD document exports
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all disabled:opacity-75"
              title="Download active workflow SDD directly as PDF"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isGeneratingPdf ? 'Generating...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={() => downloadWorkflowSddMarkdown(activeWorkflow)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
              title="Download active workflow SDD as Markdown"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Markdown (.md)</span>
            </button>

            <button
              onClick={() => setIsArchitectureModalOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-800 flex items-center gap-2 bg-slate-950/30 overflow-x-auto">
          {[
            { id: 'sdd', label: '📄 Active Flow SDD Document', icon: FileText, highlight: true },
            { id: 'overview', label: '1. Architecture & 9 Phases', icon: Layers },
            { id: 'earlyaction', label: '2. Early Action Delay Bypass', icon: Cpu },
            { id: 'graph', label: '3. Graph Data Model & JSON', icon: GitBranch },
            { id: 'lifecycle', label: '4. Node & Flow Lifecycle', icon: WorkflowIcon },
            { id: 'goals', label: '5. Goal vs Condition', icon: Target },
            { id: 'production', label: '6. Production Distributed Roadmap', icon: Server }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                } ${tab.highlight ? 'text-blue-300' : ''}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-300 text-xs leading-relaxed">
          {/* TAB: ACTIVE FLOW SDD DOCUMENT */}
          {activeTab === 'sdd' && (
            <div className="space-y-6">
              {/* Document Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900 border border-blue-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10px] uppercase font-bold">
                      Active Specification
                    </span>
                    <span className="text-slate-400 text-xs">
                      {activeWorkflow.nodes.length} Nodes · {activeWorkflow.edges.length} Transitions
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-white mt-1">
                    {activeWorkflow.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {activeWorkflow.description || 'Modular automated admission flow specification.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopyMarkdown}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied MD!' : 'Copy Markdown'}</span>
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all disabled:opacity-75"
                  >
                    {isGeneratingPdf ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>{isGeneratingPdf ? 'Generating...' : 'Download PDF Document'}</span>
                  </button>
                </div>
              </div>

              {/* Node by Node Specification List */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Step-by-Step Node Handlers & Execution Contracts</span>
                  <span className="font-mono text-[10px] text-slate-500">{activeWorkflow.nodes.length} Steps</span>
                </h4>

                <div className="space-y-3">
                  {activeWorkflow.nodes.map((node, index) => {
                    const code = generateNodeCodeSnippet(node.type, node.data);
                    return (
                      <div
                        key={node.id}
                        className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-300 flex items-center justify-center font-mono text-[10px] font-bold">
                              {index + 1}
                            </span>
                            <span className="font-bold text-white text-xs">
                              {node.data.label || 'Step'}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] font-mono text-slate-400 uppercase">
                              {node.type}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-500">{node.id}</span>
                        </div>

                        <p className="text-slate-400 text-xs italic">
                          {node.data.description || 'Process step.'}
                        </p>

                        {/* Technical Code Preview */}
                        <div className="rounded-lg bg-slate-900 border border-slate-800 p-2.5 font-mono text-[11px] text-blue-300 overflow-x-auto">
                          <div className="text-[9px] uppercase font-bold text-slate-500 mb-1">TypeScript Execution Handler</div>
                          <pre className="text-[10px] leading-relaxed text-slate-300">{code}</pre>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: OVERVIEW & 9 DECOUPLED PHASES */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white mb-2">Decoupled Modular Architecture vs. Monolithic Graph</h3>
                <p className="text-slate-300 leading-relaxed">
                  Instead of one single cluttered monolithic graph, the admissions lifecycle is decomposed into <strong className="text-white">9 independent, decoupled modular workflows</strong> plus customizable edge-case sub-flowcharts. 
                  Each modular flow is initiated by its own discrete event trigger and emits downstream events upon completion. 
                  This eliminates operational fragility, prevents asking for redundant information across forms, and allows schools to customize or omit entire phases (e.g. Early Years schools omitting interview phases).
                </p>
              </div>

              {/* 9 Modular Flows Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {[
                  { title: '1. Lead Capture', trigger: 'Web Form Submitted', emit: 'tour.booked / nurtured' },
                  { title: '2. App Submission', trigger: 'Application Submitted', emit: 'application.routed' },
                  { title: '3. Doc Verification', trigger: 'Docs Uploaded', emit: 'documents.verified' },
                  { title: '4. Assessment & Interview', trigger: 'Candidate Qualified', emit: 'interview.completed' },
                  { title: '5. Committee Decision', trigger: 'Rubric Submitted', emit: 'decision.recorded' },
                  { title: '6. Waitlist Promotion', trigger: 'Capacity Available', emit: 'waitlist.promoted' },
                  { title: '7. Offer & Fee Goal', trigger: 'Offer Issued', emit: 'fee.settled' },
                  { title: '8. Post-Offer Onboarding', trigger: 'Deposit Paid', emit: 'onboarding.cleared' },
                  { title: '9. SIS Handover', trigger: 'Onboarding Done', emit: 'student.enrolled' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all">
                    <div className="text-xs font-bold text-white mb-1">{item.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      <span className="text-blue-400">Trigger:</span> {item.trigger}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      <span className="text-emerald-400">Emits:</span> {item.emit}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: EARLY ACTION DELAY BYPASS */}
          {activeTab === 'earlyaction' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Event-Driven Delay Cancellation (Early-Action Bypass)</h3>
              <p>
                In a standard fixed delay (e.g. "Wait 3 Days"), if a parent takes the desired conversion action early (e.g., booking a tour on Day 1), standard drip marketing engines continue sending obsolete reminder emails.
              </p>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-[11px]">
                <div className="text-indigo-400 font-bold">// How Early Action Delay Bypass Works in Toddle Workflow Engine:</div>
                <div className="text-slate-300">
                  1. <span className="text-purple-400">Delay Node</span> starts with <code>allowEarlyActionBypass: true</code> and <code>earlyActionEvents: ['tour.booked']</code>.<br/>
                  2. Engine registers an active event listener on the event bus for that applicant context.<br/>
                  3. If <code>tour.booked</code> is received at hour 4, timer is <strong>immediately aborted</strong>.<br/>
                  4. Engine immediately executes downstream Condition / Action node without waiting remaining 68 hours.
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GRAPH MODEL & JSON */}
          {activeTab === 'graph' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Graph Data Structure & State Machine</h3>
              <p>
                The entire workflow is stored as an immutable directed acyclic graph (DAG) serialization consisting of:
              </p>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                <div><span className="text-blue-400 font-bold">Workflow Object:</span></div>
                <div>&nbsp;&nbsp;id: string, name: string, version: number, status: 'draft' | 'published'</div>
                <div>&nbsp;&nbsp;nodes: WorkflowNode[] (type, position: &#123;x, y&#125;, data: &#123;label, retryPolicy, parameters&#125;)</div>
                <div>&nbsp;&nbsp;edges: WorkflowEdge[] (id, source, target, sourceHandle, label, animated)</div>
              </div>
            </div>
          )}

          {/* TAB 4: LIFECYCLE */}
          {activeTab === 'lifecycle' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Workflow & Node Lifecycle States</h3>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-200">Execution Node States:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-400">idle</div>
                  <div className="p-2 rounded bg-blue-950/60 border border-blue-500/40 text-blue-300">running</div>
                  <div className="p-2 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300">waiting (delay)</div>
                  <div className="p-2 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">completed</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GOAL VS CONDITION */}
          {activeTab === 'goals' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Conceptual Distinction: Goal Node vs. Condition Node</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                    Condition Node (One-Time Evaluation)
                  </div>
                  <p className="text-slate-300">
                    Evaluates state at a single point in time and branches instantly without polling.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-500/30 space-y-2">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-orange-400">
                    Goal Node (Persistent Objective Loop)
                  </div>
                  <p className="text-slate-300">
                    Represents a durable objective that periodically checks status over time (e.g. fee paid within 7 days) with offline bank wire bypass.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PRODUCTION ROADMAP */}
          {activeTab === 'production' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Production-Scale Distributed Architecture</h3>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                <div className="text-center font-bold text-blue-400">FRONTEND WORKFLOW BUILDER (React / Vite)</div>
                <div className="text-center text-slate-500">│ REST / GraphQL API</div>
                <div className="text-center font-bold text-indigo-400">WORKFLOW API GATEWAY (NestJS / Go)</div>
                <div className="text-center text-slate-500">├── PostgreSQL / DynamoDB (Workflow Definitions & Versions)</div>
                <div className="text-center text-slate-500">└── Kafka / AWS EventBridge (Trigger Events)</div>
                <div className="text-center text-slate-500">│</div>
                <div className="text-center font-bold text-emerald-400">DISTRIBUTED ORCHESTRATION ENGINE (Temporal.io / Cadence / Celery)</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

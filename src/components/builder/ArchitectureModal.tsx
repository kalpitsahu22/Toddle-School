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
  CheckCircle2
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

export const ArchitectureModal: React.FC = () => {
  const { isArchitectureModalOpen, setIsArchitectureModalOpen } = useWorkflowStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'earlyaction' | 'graph' | 'lifecycle' | 'goals' | 'production'>('overview');

  if (!isArchitectureModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 lg:p-8 animate-in fade-in duration-150">
      <div className="w-full max-w-5xl h-[85vh] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
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
                  Technical Interview Guide
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Plug-and-play visual graph engine, node execution model & production roadmap
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsArchitectureModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-800 flex items-center gap-2 bg-slate-950/30 overflow-x-auto">
          {[
            { id: 'overview', label: '1. Architecture & Decoupled Flows', icon: Layers },
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
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-300 text-xs leading-relaxed">
          {/* TAB 1: OVERVIEW & DECOUPLED FLOWS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white mb-2">Decoupled Modular Architecture vs. Monolithic Graph</h3>
                <p className="text-slate-300 leading-relaxed">
                  Instead of one single cluttered monolithic graph, the admissions lifecycle is decomposed into <strong className="text-white">7 independent, decoupled modular workflows</strong>. 
                  Each modular flow is initiated by its own discrete event trigger and emits downstream events upon completion. 
                  This eliminates operational fragility, prevents asking for redundant information across forms, and allows schools to customize or omit entire phases (e.g. School B omitting interview phases).
                </p>
              </div>

              {/* 7 Modular Flows Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {[
                  { title: '1. Lead Capture', trigger: 'Web Form Submitted', emit: 'tour.booked / nurtured' },
                  { title: '2. App Submission', trigger: 'Application Submitted', emit: 'application.routed' },
                  { title: '3. Doc Verification', trigger: 'Docs Uploaded', emit: 'documents.verified' },
                  { title: '4. Assessment & Interview', trigger: 'Candidate Qualified', emit: 'interview.completed' },
                  { title: '5. Committee Decision', trigger: 'Rubric Submitted', emit: 'offer.generated' },
                  { title: '6. Fee Collection', trigger: 'Offer Dispatched', emit: 'fee.paid' },
                  { title: '7. SIS Handover', trigger: 'Fee Confirmed', emit: 'student.active_enrolled' }
                ].map((m) => (
                  <div key={m.title} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-xs font-bold text-indigo-300">{m.title}</div>
                    <div className="text-[10px] text-slate-400">Trigger: <span className="text-emerald-400">{m.trigger}</span></div>
                    <div className="text-[10px] text-slate-400">Emits: <span className="text-blue-400 font-mono">{m.emit}</span></div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1">
                <div className="text-indigo-400 font-bold mb-2">SYSTEM FLOW PIPELINE</div>
                <div className="text-slate-400">React UI (Visual Canvas + Node Library + Inspector)</div>
                <div className="text-blue-400 pl-4">↓ Synchronizes state in real-time via Zustand (Auto-persisted to LocalStorage)</div>
                <div className="text-slate-200 pl-4">Workflow State (Decoupled Modular Flows + Composed Blueprints)</div>
                <div className="text-amber-400 pl-8">↓ Static Analysis & Connectivity Validation</div>
                <div className="text-slate-200 pl-8">Graph Validator (Detects disconnected ports, missing triggers, broken edges)</div>
                <div className="text-emerald-400 pl-12">↓ Traverses graph dynamically using state machine</div>
                <div className="text-slate-200 pl-12">Execution Engine (Early action delay cancellation, retry policies, human-in-the-loop pause)</div>
                <div className="text-purple-400 pl-16">↓ Event Bus & Inter-workflow Chaining</div>
                <div className="text-slate-200 pl-16">Emits Event → Triggers Downstream Decoupled Workflow</div>
              </div>
            </div>
          )}

          {/* TAB 2: EARLY ACTION DELAY BYPASS */}
          {activeTab === 'earlyaction' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white mb-2">Early Action Handling & Delay Timer Cancellation</h3>
                <p className="text-slate-300 leading-relaxed">
                  In a real admissions scenario, if a workflow sets a 3-day nurture timer, but the parent books a campus tour or submits the form after 4 hours, forcing the system or user to wait out the remaining 68 hours is counter-productive.
                  Our state-machine engine implements <strong className="text-white">event-driven delay cancellation</strong>: upon receiving an early action event, the delay timer is instantly cancelled and bypassed!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                    Normal Delay Path (Timer Expires)
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Lead Created → Wait 72h Nurture Timer → No early action detected → Timer naturally elapses → Send reminder.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 space-y-2">
                  <div className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    Early Action Bypass (Optimized)
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Lead Created → Wait Timer Active → <strong>Parent books tour early</strong> → ⚡ State machine receives event → Cancels remaining 68h delay → Immediately advances to Tour Confirmation step!
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white mb-2">Consolidated Document Verification (No Frustrating Branches)</h3>
                <p className="text-slate-300 leading-relaxed">
                  Rather than cluttering the workflow with separate yes/no branches for birth cert, passport, transcripts, and ID, we implement a <strong>single-pass consolidated document verification node</strong> with a built-in 48h SLA escalation rule. If any mandatory item is missing after 48h, an officer call task is created in one clean step.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: GRAPH DATA MODEL */}
          {activeTab === 'graph' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Declarative Graph Specification</h3>
              <p>Every workflow is serialized as a lightweight, framework-agnostic JSON graph:</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1">
                  <div className="text-blue-400 font-bold">Workflow Node Model</div>
                  <pre className="text-slate-300 overflow-x-auto">
{`interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' 
      | 'delay' | 'human' | 'goal' | 'system';
  position: { x: number; y: number };
  data: {
    label: string;
    phase?: string;
    category: NodeCategory;
    nodeSubtype?: string;
    actionService?: string;
    recipient?: string;
    conditionRules?: ConditionRule[];
    allowedOutcomes?: HumanOutcome[];
    retryPolicy?: NodeRetryPolicy;
    goalTargetMetric?: string;
    executionStatus?: ExecutionStatus;
  };
}`}
                  </pre>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1">
                  <div className="text-emerald-400 font-bold">Workflow Edge Model</div>
                  <pre className="text-slate-300 overflow-x-auto">
{`interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string; // 'true', 'false', 'admit', 'success'
  targetHandle?: string;
  label?: string;
  animated?: boolean;
  condition?: {
    field?: string;
    operator?: string;
    value?: unknown;
  };
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIFECYCLE */}
          {activeTab === 'lifecycle' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white mb-2">Node Execution Lifecycle</h3>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center">
                  {[
                    { step: '1. Create', desc: 'Drag from library onto canvas' },
                    { step: '2. Configure', desc: 'Set parameters, merge tags & SLAs' },
                    { step: '3. Validate', desc: 'Check ports, branch links & types' },
                    { step: '4. Execute', desc: 'Async evaluate, retry or pause' },
                    { step: '5. Resolve', desc: 'Complete, branch or timeout' }
                  ].map((s) => (
                    <div key={s.step} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-xs font-bold text-indigo-400 mb-1">{s.step}</div>
                      <div className="text-[11px] text-slate-400">{s.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white mb-2">Workflow Versioning Lifecycle</h3>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">DRAFT</span>
                    <span>→ Active edits, adding nodes, modifying branch conditions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">TEST / SIMULATE</span>
                    <span>→ Step-by-step traversal with live applicant context & mock scenarios</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">PUBLISHED (v1, v2...)</span>
                    <span>→ Validates graph integrity, freezes version snapshot, advances version counter</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GOAL VS CONDITION */}
          {activeTab === 'goals' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Conceptual Distinction: Goal Node vs. Condition Node</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                    Condition Node (One-Time Evaluation)
                  </div>
                  <p className="text-slate-300">
                    Evaluates state at a single point in time:
                  </p>
                  <div className="p-3 rounded-lg bg-slate-900 font-mono text-[11px] text-slate-300">
                    IF Grade &gt;= 6 <br/>
                    &nbsp;&nbsp;→ Secondary School Team <br/>
                    ELSE <br/>
                    &nbsp;&nbsp;→ Primary School Team
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Execution never waits; it branches immediately.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-500/30 space-y-2">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-orange-400">
                    Goal Node (Persistent Objective Loop)
                  </div>
                  <p className="text-slate-300">
                    Represents a state objective that requires repeated checking over time:
                  </p>
                  <div className="p-3 rounded-lg bg-slate-900 font-mono text-[11px] text-slate-300">
                    Check Fee Paid: <br/>
                    &nbsp;&nbsp;Paid? → SUCCESS → Advance to Onboarding <br/>
                    &nbsp;&nbsp;Not Paid? → Wait 24h → Send Reminder → Check Again (Max 7) <br/>
                    &nbsp;&nbsp;Max Attempts? → TIMEOUT → Offer Expired
                  </div>
                  <p className="text-[11px] text-emerald-400">
                    First-class edge case: Offline bank wire bypass immediately satisfies the goal.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PRODUCTION ROADMAP */}
          {activeTab === 'production' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Future Production-Scale Distributed Architecture</h3>
              <p>How this frontend prototype seamlessly connects to an enterprise backend execution runtime:</p>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                <div className="text-center font-bold text-blue-400">FRONTEND WORKFLOW BUILDER (React / Vite)</div>
                <div className="text-center text-slate-500">│ REST / GraphQL API</div>
                <div className="text-center font-bold text-indigo-400">WORKFLOW API GATEWAY (NestJS / Go)</div>
                <div className="text-center text-slate-500">├── PostreSQL / DynamoDB (Workflow Definitions & Versions)</div>
                <div className="text-center text-slate-500">└── Kafka / AWS EventBridge (Trigger Events)</div>
                <div className="text-center text-slate-500">│</div>
                <div className="text-center font-bold text-emerald-400">DISTRIBUTED ORCHESTRATION ENGINE (Temporal.io / Cadence / Celery)</div>
                <div className="text-center text-slate-500">├── Action Workers (Email, SMS, SIS Connectors with Idempotency Keys)</div>
                <div className="text-center text-slate-500">├── Delay Timers (Durable Timers & SLA Escalation Queues)</div>
                <div className="text-center text-slate-500">└── Human Task Service (Staff Review Portals & Webhooks)</div>
                <div className="text-center text-slate-500">│</div>
                <div className="text-center font-bold text-cyan-400">AUDIT LOG & EXECUTION STORE (Elasticsearch / ClickHouse)</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

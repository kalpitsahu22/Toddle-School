import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  User,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Zap,
  CreditCard,
  Check,
  ChevronUp,
  ChevronDown,
  Terminal
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { DEFAULT_MOCK_APPLICANTS } from '../../engine/workflowExecutor';

export const ExecutionPanel: React.FC = () => {
  const {
    isTestMode,
    isExecuting,
    executionSpeedMs,
    setExecutionSpeedMs,
    selectedApplicantKey,
    setSelectedApplicantKey,
    executionContext,
    startExecution,
    pauseExecution,
    stepNextExecution,
    resetExecution,
    resolveHumanDecision,
    bypassGoalPaid,
    workflows,
    activeWorkflowId
  } = useWorkflowStore();

  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'variables'>('timeline');

  if (!isTestMode) return null;

  const activeWorkflow = workflows.find((w) => w.id === activeWorkflowId);
  const waitingHumanNode = activeWorkflow?.nodes.find(
    (n) => n.id === executionContext.waitingHumanNodeId
  );
  const waitingGoalNode = activeWorkflow?.nodes.find(
    (n) => n.id === executionContext.waitingGoalNodeId || n.id === executionContext.currentNodeId
  );

  return (
    <div className="border-t border-slate-800 bg-slate-950/95 backdrop-blur-md z-30 shrink-0 shadow-2xl transition-all duration-300">
      {/* Top Bar / Controls */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-800/80">
        {/* Left: Test Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>Test Mode</span>
          </div>

          {/* Play/Pause Button */}
          {!isExecuting ? (
            <button
              onClick={() => {
                if (executionContext.status === 'idle') {
                  startExecution();
                } else {
                  useWorkflowStore.setState({ isExecuting: true });
                }
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{executionContext.status === 'idle' ? 'Run Workflow' : 'Resume'}</span>
            </button>
          ) : (
            <button
              onClick={pauseExecution}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </button>
          )}

          {/* Step Forward */}
          <button
            onClick={stepNextExecution}
            title="Execute next single node"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Step Next</span>
          </button>

          {/* Reset */}
          <button
            onClick={resetExecution}
            title="Reset execution state"
            className="flex items-center gap-1 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Speed Selector */}
          <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-slate-800 text-xs text-slate-400">
            <span>Speed:</span>
            {[
              { label: '0.5x', ms: 2000 },
              { label: '1x', ms: 1200 },
              { label: '2x', ms: 600 }
            ].map((sp) => (
              <button
                key={sp.label}
                onClick={() => setExecutionSpeedMs(sp.ms)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
                  executionSpeedMs === sp.ms
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Middle: Mock Applicant Scenario Switcher */}
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-slate-400 hidden md:inline" />
          <span className="text-xs text-slate-400 hidden md:inline font-medium">Scenario:</span>
          <select
            value={selectedApplicantKey}
            onChange={(e) => setSelectedApplicantKey(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 font-medium outline-none"
          >
            <option value="standard_middle_high">Standard Grade 7 (Sophia Chen)</option>
            <option value="primary_applicant">Primary Grade 3 (Lucas Miller)</option>
            <option value="international_boarding">International Boarding (Alexander Tanaka)</option>
            <option value="missing_docs_scenario">Missing Documents SLA Loop (Emma Watson)</option>
            <option value="offline_bank_wire">Offline Bank Wire (Rohan Sharma)</option>
          </select>
        </div>

        {/* Right: Collapse toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                executionContext.status === 'completed'
                  ? 'bg-emerald-400'
                  : executionContext.status === 'paused_human'
                  ? 'bg-rose-400 animate-ping'
                  : executionContext.status === 'paused_goal'
                  ? 'bg-orange-400 animate-pulse'
                  : executionContext.status === 'running'
                  ? 'bg-blue-400 animate-pulse'
                  : 'bg-slate-500'
              }`}
            />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              {executionContext.status.replace('_', ' ')}
            </span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* EARLY ACTION / DELAY CANCEL BANNER */}
      {isTestMode && activeWorkflow?.nodes.some((n) => n.type === 'delay') && (
        <div className="px-4 py-2 bg-gradient-to-r from-purple-950/70 via-slate-900 to-purple-950/70 border-b border-purple-500/30 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="text-xs text-purple-200">
              <strong>Delay Optimization:</strong> Early action event will immediately cancel delay timer instead of waiting.
            </span>
          </div>
          <button
            onClick={() => useWorkflowStore.getState().triggerEarlyAction()}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate Early Action (e.g. Tour Booked Early)</span>
          </button>
        </div>
      )}

      {/* MODULAR PHASE COMPLETED -> CHAIN DOWNSTREAM FLOW */}
      {executionContext.status === 'completed' && activeWorkflow?.workflowType === 'modular_phase' && (
        <div className="px-4 py-2.5 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border-b border-emerald-500/40 flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Phase Complete: Emitted Event [{activeWorkflow.emittedEventOnComplete || 'phase.completed'}]
              </div>
              <div className="text-xs text-slate-300">
                Trigger next decoupled modular flow in the admissions lifecycle.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeWorkflow.id === 'wf-mod-1-lead-capture' && (
              <button
                onClick={() => useWorkflowStore.getState().triggerNextModularWorkflow('wf-mod-2-app-submission')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
              >
                <span>Trigger 2. Application Submission Flow →</span>
              </button>
            )}
            {activeWorkflow.id === 'wf-mod-2-app-submission' && (
              <button
                onClick={() => useWorkflowStore.getState().triggerNextModularWorkflow('wf-mod-3-doc-verification')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
              >
                <span>Trigger 3. Document Verification Flow →</span>
              </button>
            )}
            {activeWorkflow.id === 'wf-mod-3-doc-verification' && (
              <button
                onClick={() => useWorkflowStore.getState().triggerNextModularWorkflow('wf-mod-4-interview')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
              >
                <span>Trigger 4. Assessment & Interview Flow →</span>
              </button>
            )}
            {activeWorkflow.id === 'wf-mod-4-interview' && (
              <button
                onClick={() => useWorkflowStore.getState().triggerNextModularWorkflow('wf-mod-5-committee-decision')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
              >
                <span>Trigger 5. Committee Decision Flow →</span>
              </button>
            )}
            {activeWorkflow.id === 'wf-mod-5-committee-decision' && (
              <button
                onClick={() => useWorkflowStore.getState().triggerNextModularWorkflow('wf-mod-6-fee-collection')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
              >
                <span>Trigger 6. Fee Collection Flow →</span>
              </button>
            )}
            {activeWorkflow.id === 'wf-mod-6-fee-collection' && (
              <button
                onClick={() => useWorkflowStore.getState().triggerNextModularWorkflow('wf-mod-7-onboarding-handover')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
              >
                <span>Trigger 7. Onboarding & SIS Handover Flow →</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* HUMAN INTERVENTION INTERACTIVE BANNER */}
      {executionContext.status === 'paused_human' && waitingHumanNode && (
        <div className="px-4 py-3 bg-gradient-to-r from-rose-950/80 via-slate-900 to-rose-950/80 border-b border-rose-500/40 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 animate-bounce">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-300">
                  Waiting for Human Review
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-200 font-mono">
                  {waitingHumanNode.data.assignedRole || 'Admissions Committee'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {waitingHumanNode.data.label}: Select an outcome to resume workflow execution.
              </p>
            </div>
          </div>

          {/* Action Outcome Buttons */}
          <div className="flex items-center gap-2">
            {(waitingHumanNode.data.allowedOutcomes || [
              { actionId: 'admit', label: 'Admit Candidate', variant: 'success' },
              { actionId: 'waitlist', label: 'Waitlist', variant: 'warning' },
              { actionId: 'conditional', label: 'Conditional Offer', variant: 'info' },
              { actionId: 'decline', label: 'Decline', variant: 'danger' }
            ]).map((outcome) => (
              <button
                key={outcome.actionId}
                onClick={() => resolveHumanDecision(outcome.actionId)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 ${
                  outcome.variant === 'success'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : outcome.variant === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : outcome.variant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {outcome.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* GOAL NODE PENDING & OFFLINE WIRE BYPASS BANNER */}
      {executionContext.status === 'paused_goal' && (
        <div className="px-4 py-2.5 bg-gradient-to-r from-orange-950/80 via-slate-900 to-orange-950/80 border-b border-orange-500/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-orange-400 animate-spin" />
            <span className="text-xs text-orange-200 font-medium">
              Goal Node Checking Payment Status (Attempt {executionContext.activeGoalAttempts[executionContext.waitingGoalNodeId || ''] || 1}/7)
            </span>
          </div>

          <button
            onClick={bypassGoalPaid}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold shadow-md"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Simulate Offline Wire Confirmation (Bypass)</span>
          </button>
        </div>
      )}

      {/* Expanded Logs & Variable Context */}
      {isExpanded && (
        <div className="h-44 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Left: Execution Timeline Logs */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="px-4 py-1.5 bg-slate-900/60 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                Execution Event Timeline ({executionContext.history.length})
              </span>
              <span className="font-mono text-slate-500 text-[10px]">
                Applicant: {executionContext.applicant.name} ({executionContext.applicant.id})
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 font-mono text-xs">
              {executionContext.history.length === 0 ? (
                <div className="text-slate-600 italic text-center py-6">
                  Ready to execute. Click &ldquo;Run Workflow&rdquo; or &ldquo;Step Next&rdquo; to begin simulation.
                </div>
              ) : (
                executionContext.history.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-2 text-[11px] leading-relaxed"
                  >
                    <span className="text-slate-500 shrink-0">{log.timestamp}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold shrink-0 ${
                        log.status === 'success'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : log.status === 'waiting'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {log.status}
                    </span>
                    <span className="text-slate-200">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Live Applicant Variables Inspector */}
          <div className="w-full md:w-80 flex flex-col h-full overflow-hidden bg-slate-950">
            <div className="px-3 py-1.5 bg-slate-900/60 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              Live State & Variables
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1 text-xs font-mono">
              <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-400 font-bold">{executionContext.applicant.applicationStatus}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                <span className="text-slate-500">Grade Band:</span>
                <span className="text-blue-300">{executionContext.applicant.gradeCategory} (Gr {executionContext.applicant.grade})</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                <span className="text-slate-500">Mandatory Docs:</span>
                <span className={executionContext.applicant.mandatoryDocsValid ? 'text-emerald-400' : 'text-amber-400'}>
                  {executionContext.applicant.mandatoryDocsValid ? 'Valid & Complete' : 'Pending Review'}
                </span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                <span className="text-slate-500">Fee Payment:</span>
                <span className={executionContext.applicant.feePaid ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  {executionContext.applicant.feePaid ? 'PAID ($)' : 'Unpaid'}
                </span>
              </div>
              {executionContext.applicant.studentIdGenerated && (
                <div className="flex justify-between py-0.5 border-b border-slate-800/60">
                  <span className="text-slate-500">SIS Student ID:</span>
                  <span className="text-cyan-400 font-bold">{executionContext.applicant.studentIdGenerated}</span>
                </div>
              )}
              {executionContext.applicant.assignedTeacher && (
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Homeroom:</span>
                  <span className="text-purple-300 truncate max-w-[140px]">{executionContext.applicant.assignedTeacher}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

export const ValidationModal: React.FC = () => {
  const {
    validationResult,
    isValidationModalOpen,
    setIsValidationModalOpen,
    setSelectedNodeId,
    workflows,
    activeWorkflowId
  } = useWorkflowStore();

  if (!isValidationModalOpen) return null;

  const activeWorkflow = workflows.find((w) => w.id === activeWorkflowId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 relative">
        <button
          onClick={() => setIsValidationModalOpen(false)}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              validationResult.isValid
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}
          >
            {validationResult.isValid ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {validationResult.isValid ? 'Workflow Validation Passed' : 'Validation Diagnostics'}
            </h3>
            <p className="text-xs text-slate-400">
              {validationResult.isValid
                ? 'Graph structure is healthy and ready for testing or publishing.'
                : `${validationResult.issues.length} item(s) require your attention.`}
            </p>
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto space-y-2 my-4 pr-1">
          {validationResult.issues.map((issue) => (
            <div
              key={issue.id}
              onClick={() => {
                if (issue.nodeId) {
                  setSelectedNodeId(issue.nodeId);
                  setIsValidationModalOpen(false);
                }
              }}
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                issue.nodeId ? 'cursor-pointer hover:scale-[1.01]' : ''
              } ${
                issue.type === 'error'
                  ? 'bg-red-950/30 border-red-500/40 text-red-200'
                  : issue.type === 'warning'
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                  : 'bg-blue-950/30 border-blue-500/40 text-blue-200'
              }`}
            >
              {issue.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{issue.message}</div>
                {issue.nodeId && (
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Click to jump to node in Inspector
                  </div>
                )}
              </div>
            </div>
          ))}

          {validationResult.issues.length === 0 && (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs">
              ✓ Trigger node verified <br />
              ✓ All edge links resolved <br />
              ✓ Condition branching verified <br />
              ✓ Action parameters valid
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => setIsValidationModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};

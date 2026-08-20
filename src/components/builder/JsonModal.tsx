import React, { useState, useEffect } from 'react';
import { X, Copy, Download, Upload, Check } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

export const JsonModal: React.FC = () => {
  const {
    isJsonModalOpen,
    jsonModalMode,
    setIsJsonModalOpen,
    exportWorkflowJson,
    importWorkflowJson
  } = useWorkflowStore();

  const [jsonText, setJsonText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isJsonModalOpen && jsonModalMode === 'export') {
      setJsonText(exportWorkflowJson());
    } else if (isJsonModalOpen && jsonModalMode === 'import') {
      setJsonText('');
    }
  }, [isJsonModalOpen, jsonModalMode, exportWorkflowJson]);

  if (!isJsonModalOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!jsonText.trim()) return;
    importWorkflowJson(jsonText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-3xl h-[75vh] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h3 className="text-sm font-bold text-white">
              {jsonModalMode === 'export' ? 'Export Workflow JSON' : 'Import Workflow JSON'}
            </h3>
            <p className="text-xs text-slate-400">
              {jsonModalMode === 'export'
                ? 'Portable graph definition with full node configurations and edges'
                : 'Paste a workflow JSON definition below to import into your workspace'}
            </p>
          </div>
          <button
            onClick={() => setIsJsonModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Textarea */}
        <div className="flex-1 p-4 bg-slate-950">
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            readOnly={jsonModalMode === 'export'}
            placeholder="Paste workflow JSON here..."
            className="w-full h-full p-4 rounded-xl bg-slate-900 border border-slate-850 text-xs font-mono text-slate-200 outline-none resize-none selection:bg-blue-600 selection:text-white focus:border-blue-500"
          />
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
          <span className="text-xs text-slate-500 font-mono">
            {jsonText ? `${(new Blob([jsonText]).size / 1024).toFixed(1)} KB` : '0 KB'}
          </span>

          <div className="flex items-center gap-2">
            {jsonModalMode === 'export' ? (
              <>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .json</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleImport}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import Graph</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

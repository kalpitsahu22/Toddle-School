import React, { useState } from 'react';
import {
  X,
  Plus,
  Sparkles,
  Layers,
  Trash2,
  Mail,
  MessageSquare,
  Send,
  ShieldCheck,
  DollarSign,
  Webhook,
  FileText,
  Clock,
  Users,
  Target,
  Cpu,
  Search,
  Check,
  Bookmark
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { NodeType, NodeCategory } from '../../types/workflow';
import { NodeDefinition, COLOR_THEME_PRESETS } from '../../data/nodeDefinitions';

const AVAILABLE_ICONS = [
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Mail', icon: Mail },
  { name: 'MessageSquare', icon: MessageSquare },
  { name: 'Send', icon: Send },
  { name: 'ShieldCheck', icon: ShieldCheck },
  { name: 'DollarSign', icon: DollarSign },
  { name: 'Webhook', icon: Webhook },
  { name: 'FileText', icon: FileText },
  { name: 'Clock', icon: Clock },
  { name: 'Users', icon: Users },
  { name: 'Target', icon: Target },
  { name: 'Cpu', icon: Cpu },
  { name: 'Layers', icon: Layers },
  { name: 'Search', icon: Search }
];

const COLOR_OPTIONS = [
  { id: 'blue', label: 'Blue', color: '#3B82F6' },
  { id: 'emerald', label: 'Emerald', color: '#10B981' },
  { id: 'indigo', label: 'Indigo', color: '#6366F1' },
  { id: 'purple', label: 'Purple', color: '#8B5CF6' },
  { id: 'rose', label: 'Rose', color: '#F43F5E' },
  { id: 'amber', label: 'Amber', color: '#F59E0B' },
  { id: 'orange', label: 'Orange', color: '#F97316' },
  { id: 'cyan', label: 'Cyan', color: '#06B6D4' },
  { id: 'teal', label: 'Teal', color: '#14B8A6' }
];

interface CustomPreset {
  name: string;
  type: NodeType;
  category: NodeCategory;
  label: string;
  description: string;
  iconName: string;
  color: string;
  serviceType?: string;
  recipient?: string;
  subject?: string;
  bodyContent?: string;
  endpoint?: string;
  branches?: Array<{ id: string; label: string; color: string }>;
}

const CUSTOM_NODE_PRESETS: CustomPreset[] = [
  {
    name: '🎓 Merit Scholarship Review',
    type: 'human',
    category: 'Human',
    label: 'Merit Scholarship Committee Review',
    description: 'Evaluates applicant academic & athletic portfolio for 25%, 50%, or 100% tuition grant.',
    iconName: 'DollarSign',
    color: 'amber',
    branches: [
      { id: 'scholarship_100', label: 'Full 100% Merit Award', color: '#10B981' },
      { id: 'scholarship_50', label: 'Partial 50% Tuition Grant', color: '#3B82F6' },
      { id: 'standard_admission', label: 'Standard Full-Fee Admission', color: '#64748B' }
    ]
  },
  {
    name: '🏢 Hostel & Boarding Allocation',
    type: 'system',
    category: 'System / SIS',
    label: 'Hostel & Room Allocation System',
    description: 'Allocates residential hall, dormitory wing, and room keys in housing management system.',
    iconName: 'Cpu',
    color: 'teal',
    endpoint: 'https://api.toddleschool.com/v1/boarding/allocations',
    bodyContent: 'Assign dormitory room, provision biometric dorm access pass, and allocate resident tutor.'
  },
  {
    name: '📱 WhatsApp Interview Reminder',
    type: 'action',
    category: 'Action',
    label: 'Parent Interview Booking WhatsApp',
    description: 'Sends instant multi-channel WhatsApp reminder with calendar integration and parking guide.',
    iconName: 'MessageSquare',
    color: 'blue',
    serviceType: 'whatsapp',
    recipient: '{{applicant.parentPhone}}',
    subject: 'Interview Tomorrow at Toddle Academy',
    bodyContent: 'Reminder: Interview for {{applicant.name}} is scheduled tomorrow at 10:00 AM. Campus gate map: https://toddle.school/map'
  },
  {
    name: '🌐 State Education Compliance API',
    type: 'action',
    category: 'Action',
    label: 'State Compliance Webhook Dispatch',
    description: 'Dispatches mandatory state student enrollment census telemetry.',
    iconName: 'Webhook',
    color: 'indigo',
    serviceType: 'webhook',
    endpoint: 'https://api.state.edu/v2/census/enrollment-sync',
    recipient: 'compliance@toddle.school',
    subject: 'Compliance Census Dispatched'
  },
  {
    name: '🔀 English Language Proficiency Router',
    type: 'condition',
    category: 'Logic',
    label: 'English Proficiency Level Router',
    description: 'Branches candidate based on CEFR / TOEFL Junior language assessment results.',
    iconName: 'GitFork',
    color: 'purple',
    branches: [
      { id: 'cefr_c1', label: 'Advanced English (Direct DP)', color: '#10B981' },
      { id: 'cefr_b2', label: 'Intermediate (EAL Support)', color: '#3B82F6' },
      { id: 'intensive_eal', label: 'Intensive English Immersion', color: '#F59E0B' }
    ]
  }
];

export const CustomNodeCreatorModal: React.FC = () => {
  const { isCustomNodeModalOpen, setIsCustomNodeModalOpen, addCustomNodeDefinition } = useWorkflowStore();

  const [label, setLabel] = useState('Merit Scholarship Committee Review');
  const [type, setType] = useState<NodeType>('human');
  const [category, setCategory] = useState<NodeCategory>('Human');
  const [description, setDescription] = useState('Evaluates applicant academic & athletic portfolio for 25%, 50%, or 100% tuition grant.');
  const [iconName, setIconName] = useState('DollarSign');
  const [selectedColor, setSelectedColor] = useState('amber');

  // Custom handles/branches for condition or human nodes
  const [branches, setBranches] = useState<Array<{ id: string; label: string; color: string }>>([
    { id: 'scholarship_100', label: 'Full 100% Merit Award', color: '#10B981' },
    { id: 'scholarship_50', label: 'Partial 50% Tuition Grant', color: '#3B82F6' },
    { id: 'standard_admission', label: 'Standard Full-Fee Admission', color: '#64748B' }
  ]);

  // Default Action/Trigger Config
  const [serviceType, setServiceType] = useState('email');
  const [endpoint, setEndpoint] = useState('https://api.toddleschool.com/v1/scholarships');
  const [recipient, setRecipient] = useState('{{applicant.email}}');
  const [subject, setSubject] = useState('Merit Scholarship Committee Review');
  const [bodyContent, setBodyContent] = useState('Evaluate student portfolio and academic recommendations.');

  if (!isCustomNodeModalOpen) return null;

  const loadPreset = (preset: CustomPreset) => {
    setType(preset.type);
    setCategory(preset.category);
    setLabel(preset.label);
    setDescription(preset.description);
    setIconName(preset.iconName);
    setSelectedColor(preset.color);
    if (preset.serviceType) setServiceType(preset.serviceType);
    if (preset.recipient) setRecipient(preset.recipient);
    if (preset.subject) setSubject(preset.subject);
    if (preset.bodyContent) setBodyContent(preset.bodyContent);
    if (preset.endpoint) setEndpoint(preset.endpoint);
    if (preset.branches) setBranches(preset.branches);
  };

  const handleAddBranch = () => {
    const nextIdx = branches.length + 1;
    setBranches([
      ...branches,
      { id: `branch_${nextIdx}`, label: `Branch ${nextIdx}`, color: '#3B82F6' }
    ]);
  };

  const handleRemoveBranch = (index: number) => {
    if (branches.length <= 1) return;
    setBranches(branches.filter((_, i) => i !== index));
  };

  const handleBranchChange = (index: number, key: 'label' | 'id', val: string) => {
    const updated = [...branches];
    updated[index] = { ...updated[index], [key]: val };
    setBranches(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    const theme = COLOR_THEME_PRESETS[selectedColor] || COLOR_THEME_PRESETS.blue;
    const subtypeId = `custom_${type}_${Date.now()}`;

    let defaultHandles: any[] = [];
    const defaultConfig: Record<string, unknown> = {
      label,
      description: description || `Custom user-defined ${type} step.`,
      phase: 'Phase — Custom Step'
    };

    if (type === 'trigger') {
      defaultHandles = [{ id: 'source', type: 'source', position: 'bottom' }];
      defaultConfig.triggerEvent = label;
      defaultConfig.formName = label;
    } else if (type === 'condition') {
      defaultHandles = [
        { id: 'target', type: 'target', position: 'top' },
        ...branches.map((b) => ({
          id: b.id,
          type: 'source',
          label: b.label,
          position: 'bottom',
          color: b.color
        }))
      ];
      defaultConfig.branches = branches.map((b) => ({
        handleId: b.id,
        label: b.label,
        color: b.color
      }));
      defaultConfig.conditionRules = [
        { field: 'applicant.grade', operator: 'greater_than_or_equal', value: 1 }
      ];
    } else if (type === 'human') {
      defaultHandles = [
        { id: 'target', type: 'target', position: 'top' },
        ...branches.map((b) => ({
          id: b.id,
          type: 'source',
          label: b.label,
          position: 'bottom',
          color: b.color
        }))
      ];
      defaultConfig.humanTaskTitle = label;
      defaultConfig.assignedRole = 'Scholarship & Review Committee';
      defaultConfig.timeoutHours = 48;
      defaultConfig.allowedOutcomes = branches.map((b) => ({
        actionId: b.id,
        label: b.label,
        variant: 'success'
      }));
    } else if (type === 'delay') {
      defaultHandles = [
        { id: 'target', type: 'target', position: 'top' },
        { id: 'source', type: 'source', position: 'bottom' }
      ];
      defaultConfig.delayDuration = 24;
      defaultConfig.delayUnit = 'hours';
      defaultConfig.allowEarlyActionBypass = true;
    } else if (type === 'goal') {
      defaultHandles = [
        { id: 'target', type: 'target', position: 'top' },
        { id: 'success', type: 'source', label: 'Goal Satisfied', position: 'bottom', color: '#10B981' },
        { id: 'timeout', type: 'source', label: 'Expired', position: 'right', color: '#EF4444' }
      ];
      defaultConfig.goalTargetMetric = 'fee_paid';
      defaultConfig.goalCheckIntervalHours = 24;
      defaultConfig.goalMaxAttempts = 5;
      defaultConfig.goalFastTrackBypass = true;
    } else {
      // Action / System
      defaultHandles = [
        { id: 'target', type: 'target', position: 'top' },
        { id: 'source', type: 'source', position: 'bottom' }
      ];
      defaultConfig.actionService = serviceType;
      defaultConfig.recipient = recipient;
      defaultConfig.subject = subject || label;
      defaultConfig.bodyContent = bodyContent;
      defaultConfig.sisEndpoint = endpoint;
      defaultConfig.retryPolicy = {
        enabled: true,
        maxRetries: 3,
        retryDelaySeconds: 5,
        backoff: 'exponential',
        onFinalFailure: 'route_to_fallback'
      };
    }

    const newDef: NodeDefinition = {
      id: subtypeId,
      type,
      subtype: subtypeId,
      label,
      category,
      description: description || `Custom user-defined ${type} step.`,
      iconName,
      colorTheme: theme,
      defaultHandles,
      defaultConfig
    };

    addCustomNodeDefinition(newDef);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create Custom Playground Node</h3>
              <p className="text-xs text-slate-400">Define custom triggers, actions, branching logic, and icons</p>
            </div>
          </div>
          <button
            onClick={() => setIsCustomNodeModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Quick Demo Example Presets */}
          <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-blue-400" />
                Example Presets (Click to Auto-fill Demo Data)
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CUSTOM_NODE_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => loadPreset(preset)}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-900/40 text-slate-200 border border-slate-700 hover:border-blue-500/50 transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Node Type Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Node Type Classification
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {[
                { type: 'human' as NodeType, cat: 'Human' as NodeCategory, label: 'Human Review' },
                { type: 'action' as NodeType, cat: 'Action' as NodeCategory, label: 'Action' },
                { type: 'trigger' as NodeType, cat: 'Trigger' as NodeCategory, label: 'Trigger' },
                { type: 'condition' as NodeType, cat: 'Logic' as NodeCategory, label: 'Condition' },
                { type: 'delay' as NodeType, cat: 'Control' as NodeCategory, label: 'Delay' },
                { type: 'goal' as NodeType, cat: 'Persistent Goal' as NodeCategory, label: 'Goal Loop' },
                { type: 'system' as NodeType, cat: 'System / SIS' as NodeCategory, label: 'System / SIS' }
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => {
                    setType(item.type);
                    setCategory(item.cat);
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all ${
                    type === item.type
                      ? 'bg-blue-600/25 border-blue-500 text-blue-300 ring-1 ring-blue-500/40 shadow-sm'
                      : 'bg-slate-800/60 border-slate-750 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Label & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Node Title / Label *
              </label>
              <input
                type="text"
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Merit Scholarship Review"
                className="w-full px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 focus:border-blue-500 text-xs text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Category Tag
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                placeholder="e.g. Finance, Human Review..."
                className="w-full px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 focus:border-blue-500 text-xs text-slate-300 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Description / Business Purpose
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Evaluates candidate merit scholarship portfolio against academic criteria."
              className="w-full px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 focus:border-blue-500 text-xs text-slate-300 outline-none"
            />
          </div>

          {/* Icon & Color Palette Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            {/* Icon Picker */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Icon Representation
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-800">
                {AVAILABLE_ICONS.map((item) => {
                  const IconComp = item.icon;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setIconName(item.name)}
                      className={`p-2 rounded-lg border transition-all ${
                        iconName === item.name
                          ? 'bg-blue-600/30 border-blue-500 text-blue-300 ring-1 ring-blue-500/40'
                          : 'bg-slate-800/60 border-slate-750 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Accent Picker */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Color Accent Theme
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColor(c.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      selectedColor === c.id
                        ? 'bg-slate-800 border-slate-600 text-white ring-1 ring-blue-500/40'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CUSTOM BRANCHES (FOR CONDITIONS OR HUMAN DECISIONS) */}
          {(type === 'condition' || type === 'human') && (
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Custom Output Branches & Decision Ports ({branches.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddBranch}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Branch
                </button>
              </div>

              <div className="space-y-2">
                {branches.map((b, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-xl border border-slate-700/80"
                  >
                    <span className="text-xs font-mono text-slate-500 w-6">#{idx + 1}</span>
                    <input
                      type="text"
                      value={b.label}
                      onChange={(e) => handleBranchChange(idx, 'label', e.target.value)}
                      placeholder="Branch Label (e.g. Full 100% Merit Award)"
                      className="flex-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
                    />
                    <input
                      type="text"
                      value={b.id}
                      onChange={(e) => handleBranchChange(idx, 'id', e.target.value)}
                      placeholder="Handle ID"
                      className="w-28 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-400 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveBranch(idx)}
                      disabled={branches.length <= 1}
                      className="p-1 text-slate-500 hover:text-rose-400 disabled:opacity-30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTION SPECIFIC CONFIG */}
          {type === 'action' && (
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-blue-400 block">
                Action Service Configuration
              </label>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Service</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200"
                  >
                    <option value="email">Personalized Email</option>
                    <option value="whatsapp">WhatsApp / SMS</option>
                    <option value="webhook">External Webhook / API</option>
                    <option value="task_creator">Staff Task Notification</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Recipient / Target</label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="{{applicant.email}}"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Subject / Notification Title</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Merit Scholarship Committee Notification"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Message Body Template</label>
                <textarea
                  rows={3}
                  value={bodyContent}
                  onChange={(e) => setBodyContent(e.target.value)}
                  placeholder="e.g. Dear {{applicant.parentName}}, your scholarship application for {{applicant.name}} is under review."
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 resize-none font-sans"
                />
              </div>

              {serviceType === 'webhook' && (
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">API Endpoint URL</label>
                  <input
                    type="text"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="https://api.school.edu/v1/webhook"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 font-mono"
                  />
                </div>
              )}
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCustomNodeModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Create & Add to Library</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

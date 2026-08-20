import React, { useState } from 'react';
import {
  X,
  Trash2,
  AlertCircle,
  Sparkles,
  Settings,
  Mail,
  Server,
  GitFork,
  Clock,
  Users,
  Target,
  Plus,
  ArrowRight,
  ShieldAlert,
  Eye,
  CheckCircle,
  FileSpreadsheet,
  Layers,
  Cpu,
  Code2
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';
import { FieldMapping, NodeData } from '../../types/workflow';
import { interpolateVariables } from '../../engine/nodeExecutor';
import { DEFAULT_MOCK_APPLICANTS } from '../../engine/workflowExecutor';
import { generateNodeCodeSnippet } from '../../engine/codeSnippetGenerator';

const AVAILABLE_MERGE_VARS = [
  { tag: '{{applicant.id}}', label: 'ID' },
  { tag: '{{applicant.name}}', label: 'Student' },
  { tag: '{{applicant.parentName}}', label: 'Guardian' },
  { tag: '{{applicant.email}}', label: 'Email' },
  { tag: '{{applicant.phone}}', label: 'Phone' },
  { tag: '{{applicant.grade}}', label: 'Grade' },
  { tag: '{{applicant.campus}}', label: 'Campus' }
];

const DEMO_TEMPLATES = {
  welcome_email: {
    label: 'Welcome & Portal',
    subject: 'Welcome to Toddle Academy | Application {{applicant.id}} Received',
    bodyContent: 'Dear {{applicant.parentName}},\n\nThank you for submitting {{applicant.name}}\'s application for Grade {{applicant.grade}} at {{applicant.campus}}.\n\nYour live status tracking link: https://admissions.toddle.school/portal/{{applicant.id}}\n\nWarm regards,\nToddle Admissions Team'
  },
  interview_invite: {
    label: 'Interview Slot',
    subject: 'Schedule Your Faculty Interview for {{applicant.name}}',
    bodyContent: 'Dear {{applicant.parentName}},\n\n{{applicant.name}} has been cleared for the Grade {{applicant.grade}} faculty interview.\n\nPlease select your preferred slot: https://admissions.toddle.school/schedule/{{applicant.id}}'
  },
  offer_letter: {
    label: 'Offer Letter',
    subject: 'Official Offer of Admission — Toddle Academy (Ref: {{applicant.id}})',
    bodyContent: 'Dear {{applicant.parentName}},\n\nWe are delighted to extend an official Offer of Admission for {{applicant.name}} into Grade {{applicant.grade}}!\n\nReview your offer letter and secure your seat: https://admissions.toddle.school/offers/{{applicant.id}}'
  },
  docs_reminder: {
    label: 'Missing Docs SLA',
    subject: 'Action Required: Incomplete Documents for {{applicant.name}}',
    bodyContent: 'Dear {{applicant.parentName}},\n\nOur admissions desk is currently reviewing {{applicant.name}}\'s file. Please re-upload missing transcripts to avoid delays: https://admissions.toddle.school/portal/{{applicant.id}}'
  },
  whatsapp_reminder: {
    label: '24h Reminder',
    subject: 'Interview Tomorrow at Toddle Academy',
    bodyContent: 'Reminder: Interview for {{applicant.name}} is tomorrow at 10:00 AM. Campus map & gate pass: https://toddle.school/map'
  }
};

export const ConfigurationPanel: React.FC = () => {
  const {
    workflows,
    activeWorkflowId,
    selectedNodeId,
    setSelectedNodeId,
    updateNodeData,
    deleteNode,
    validationResult,
    selectedApplicantKey
  } = useWorkflowStore();

  const [showLivePreview, setShowLivePreview] = useState(true);
  const [justAutoFilled, setJustAutoFilled] = useState(false);

  const activeWorkflow = workflows.find((w) => w.id === activeWorkflowId);
  const selectedNode = activeWorkflow?.nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <aside className="w-96 bg-slate-900/95 border-l border-slate-800 p-6 flex flex-col items-center justify-center text-center text-slate-500 h-full z-20 shrink-0 select-none">
        <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center mb-3 text-slate-400">
          <Settings className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-300 mb-1">Inspector</h4>
        <p className="text-xs text-slate-500 max-w-[220px]">
          Click any node on the canvas to configure parameters, merge variables, SLA policies, and branches.
        </p>
      </aside>
    );
  }

  const { data, type, id } = selectedNode;
  const nodeIssues = validationResult.issues.filter((i) => i.nodeId === id);

  const currentMockApplicant =
    DEFAULT_MOCK_APPLICANTS[selectedApplicantKey] || DEFAULT_MOCK_APPLICANTS.standard_middle_high;

  const handleAddFieldMapping = () => {
    const current = data.fieldMappings || [];
    updateNodeData(id, {
      fieldMappings: [
        ...current,
        { sourceField: 'customField', targetField: 'custom_field', transform: 'none' }
      ]
    });
  };

  const handleUpdateFieldMapping = (index: number, updated: Partial<FieldMapping>) => {
    const current = [...(data.fieldMappings || [])];
    current[index] = { ...current[index], ...updated };
    updateNodeData(id, { fieldMappings: current });
  };

  const handleRemoveFieldMapping = (index: number) => {
    const current = (data.fieldMappings || []).filter((_, i) => i !== index);
    updateNodeData(id, { fieldMappings: current });
  };

  const insertMergeVariable = (tag: string, targetField: 'recipient' | 'subject' | 'bodyContent') => {
    const currentVal = (data[targetField] as string) || '';
    updateNodeData(id, {
      [targetField]: currentVal ? `${currentVal} ${tag}` : tag
    });
  };

  const applyTemplate = (tpl: { subject: string; bodyContent: string }) => {
    updateNodeData(id, {
      subject: tpl.subject,
      bodyContent: tpl.bodyContent
    });
  };

  const handleAutoFillDemo = () => {
    let demoData: Partial<NodeData> = {};

    if (type === 'trigger') {
      demoData = {
        label: data.label || 'Online Application Submitted',
        phase: data.phase || 'Phase 1 — Lead Capture & Intake',
        description: 'Fires immediately when an admission application or web enquiry form is submitted. Deduplicates record in CRM.',
        triggerEvent: data.triggerEvent || 'Form Submitted',
        formName: data.formName || 'Toddle Online Admission Portal 2026-27'
      };
    } else if (type === 'action') {
      if (data.actionService === 'whatsapp') {
        demoData = {
          label: data.label || '24h SMS & WhatsApp Reminder',
          phase: data.phase || 'Phase 4 — Assessment & Interview',
          description: 'Multi-channel SMS and WhatsApp alert sent 24h prior to scheduled assessment slot.',
          actionService: 'whatsapp',
          recipient: '{{applicant.parentPhone}}',
          subject: '24h Assessment Reminder: Tomorrow at Toddle Academy',
          bodyContent: 'Reminder: Assessment interview for {{applicant.name}} is scheduled tomorrow at 10:00 AM. Campus gate map: https://toddle.school/map',
          retryPolicy: { enabled: true, maxRetries: 2, retryDelaySeconds: 3, backoff: 'fixed', onFinalFailure: 'ignore' }
        };
      } else if (data.actionService === 'ocr_scanner') {
        demoData = {
          label: data.label || 'AI OCR Document Scan',
          phase: data.phase || 'Phase 2 — Application Submission & Routing',
          description: 'Scans passport, birth certificate and school transcripts to verify legibility and extract date of birth and GPA.',
          actionService: 'ocr_scanner',
          retryPolicy: { enabled: true, maxRetries: 2, retryDelaySeconds: 4, backoff: 'fixed', onFinalFailure: 'route_to_fallback' }
        };
      } else if (data.actionService === 'pdf_generator') {
        demoData = {
          label: data.label || 'Generate Official Offer PDF & Link',
          phase: data.phase || 'Phase 5 — Admissions Committee & Offer',
          description: 'Generates legally binding digital acceptance letter and unique payment invoice.',
          actionService: 'pdf_generator',
          recipient: '{{applicant.email}}',
          subject: 'Official Offer of Admission — Toddle Academy (Ref: {{applicant.id}})',
          bodyContent: 'Dear {{applicant.parentName}},\n\nWe are delighted to extend an official Offer of Admission for {{applicant.name}} into Grade {{applicant.grade}} at Toddle Academy!\n\nPlease review your offer letter and complete seat confirmation deposit within 7 days: https://admissions.toddle.school/offers/{{applicant.id}}'
        };
      } else if (data.actionService === 'sis_sync') {
        demoData = {
          label: data.label || 'Sync to School SIS / ERP',
          phase: data.phase || 'Phase 7 — SIS Handover & Provisioning',
          description: 'Transfers fully validated applicant record into core School Information System (PowerSchool / Toddle Core SIS).',
          actionService: 'sis_sync',
          sisSystemName: 'Toddle Core SIS / PowerSchool ERP',
          sisEndpoint: 'https://api.toddleschool.com/v1/sis/students',
          fieldMappings: [
            { sourceField: 'firstName', targetField: 'first_name', transform: 'none' },
            { sourceField: 'lastName', targetField: 'last_name', transform: 'none' },
            { sourceField: 'dateOfBirth', targetField: 'dob', transform: 'format_date' },
            { sourceField: 'email', targetField: 'student_email', transform: 'lowercase' },
            { sourceField: 'grade', targetField: 'enrolled_grade', transform: 'to_number' },
            { sourceField: 'campus', targetField: 'campus_code', transform: 'none' },
            { sourceField: 'parentName', targetField: 'primary_guardian_name', transform: 'none' },
            { sourceField: 'parentPhone', targetField: 'emergency_contact', transform: 'none' }
          ]
        };
      } else {
        demoData = {
          label: data.label || 'Send Personalized Email',
          phase: data.phase || 'Phase 1 — Lead Capture & Nurturing',
          description: 'Sends personalized email with merge variables to the applicant or guardian.',
          actionService: 'email',
          recipient: '{{applicant.email}}',
          subject: 'Welcome to Toddle Academy | Application {{applicant.id}} Received',
          bodyContent: 'Dear {{applicant.parentName}},\n\nThank you for submitting {{applicant.name}}\'s application for Grade {{applicant.grade}} at {{applicant.campus}}.\n\nYour application status is live at: https://admissions.toddle.school/portal/{{applicant.id}}\n\nWarm regards,\nToddle Admissions Office',
          retryPolicy: { enabled: true, maxRetries: 3, retryDelaySeconds: 5, backoff: 'exponential', onFinalFailure: 'route_to_fallback' }
        };
      }
    } else if (type === 'condition') {
      demoData = {
        label: data.label || 'Route by Grade Band & Category',
        phase: data.phase || 'Phase 2 — Application Submission & Routing',
        description: 'Multi-branching decision evaluating student criteria and grade category.',
        conditionRules: [
          { field: 'applicant.gradeCategory', operator: 'equals', value: 'Middle / High School' }
        ],
        branches: [
          { handleId: 'primary', label: 'Primary (Gr K-5)', color: '#3B82F6', description: 'Primary Admissions Team' },
          { handleId: 'secondary', label: 'Middle/High (Gr 6-12)', color: '#8B5CF6', description: 'Secondary & IB Coordinator' },
          { handleId: 'boarding', label: 'Boarding / Overseas', color: '#06B6D4', description: 'International Lead' }
        ]
      };
    } else if (type === 'delay') {
      demoData = {
        label: data.label || 'Wait 3 Days (With Early Booking Bypass)',
        phase: data.phase || 'Phase 1 — Lead Capture & Nurturing',
        description: 'Pauses workflow execution to give applicant digest time. If applicant takes early action (e.g. books tour), delay is skipped immediately.',
        delayDuration: 72,
        delayUnit: 'hours',
        delayType: 'fixed_duration',
        allowEarlyActionBypass: true,
        earlyActionEvents: ['tour.booked', 'application.started']
      };
    } else if (type === 'human') {
      demoData = {
        label: data.label || 'Admissions Committee Decision',
        phase: data.phase || 'Phase 5 — Committee Decision',
        description: 'Requires holistic evaluation review by the Admissions Committee and Academic Head.',
        humanTaskTitle: 'Review Holistic Evaluation Rubric & Determine Outcome',
        assignedRole: 'Admissions Committee & Academic Head',
        timeoutHours: 72,
        allowedOutcomes: [
          { actionId: 'admit', label: 'Admit Candidate', variant: 'success', nextStatus: 'Offered' },
          { actionId: 'waitlist', label: 'Place on Waitlist', variant: 'warning', nextStatus: 'Waitlisted' },
          { actionId: 'conditional', label: 'Conditional Offer', variant: 'info', nextStatus: 'Conditional Offer' },
          { actionId: 'decline', label: 'Decline Application', variant: 'danger', nextStatus: 'Declined' }
        ]
      };
    } else if (type === 'goal') {
      demoData = {
        label: data.label || 'Goal: Admission Fee Paid within 7 Days',
        phase: data.phase || 'Phase 6 — Fee Collection & Enrollment',
        description: 'Persistent polling loop monitoring admission confirmation fee. Supports fast-track manual offline bank wire bypass.',
        goalTargetMetric: 'fee_paid',
        goalCheckIntervalHours: 24,
        goalMaxAttempts: 7,
        goalSuccessBehavior: 'continue_workflow',
        goalTimeoutBehavior: 'set_offer_expired',
        goalFastTrackBypass: true
      };
    } else if (type === 'system') {
      demoData = {
        label: data.label || 'Provision Accounts, Timetable & Homeroom Teacher',
        phase: data.phase || 'Phase 7 — SIS Handover & Provisioning',
        description: 'Automates homeroom allocation, bus route assignment, and provisions student & parent portal accounts.',
        actionService: 'task_creator',
        sisEndpoint: 'https://api.toddleschool.com/v1/provisioning',
        bodyContent: 'Provision student LMS credentials, assign homeroom teacher, generate student ID card, and schedule first day timetable.'
      };
    }

    updateNodeData(id, demoData);
    setJustAutoFilled(true);
    setTimeout(() => setJustAutoFilled(false), 2000);
  };

  return (
    <aside className="w-96 bg-slate-900/95 border-l border-slate-800 flex flex-col h-full z-20 shrink-0 select-none">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Configuration
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                {type}
              </span>
            </div>
            <span className="text-xs font-bold text-slate-100 truncate block max-w-[180px]">
              {data.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* 1-Click Auto Fill Demo Data */}
          <button
            onClick={handleAutoFillDemo}
            title="Auto-fill complete mock example data for this node"
            className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg border font-semibold transition-all ${
              justAutoFilled
                ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                : 'bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/40 text-blue-300'
            }`}
          >
            {justAutoFilled ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Sparkles className="w-3.5 h-3.5 text-blue-400" />}
            <span>{justAutoFilled ? 'Filled!' : 'Demo Data'}</span>
          </button>

          <button
            onClick={() => deleteNode(id)}
            title="Delete node"
            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 hover:border hover:border-rose-500/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedNodeId(null)}
            title="Close inspector"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Validation Warnings for this node */}
      {nodeIssues.length > 0 && (
        <div className="p-3 bg-amber-950/40 border-b border-amber-500/30 space-y-1">
          {nodeIssues.map((issue) => (
            <div key={issue.id} className="flex items-start gap-1.5 text-xs text-amber-300">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{issue.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* General Info */}
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Step Title
            </label>
            <input
              type="text"
              value={data.label || ''}
              onChange={(e) => updateNodeData(id, { label: e.target.value })}
              placeholder="e.g. Send Personalized Email"
              className="w-full px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 focus:border-blue-500 text-xs text-slate-100 outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Phase / Category
            </label>
            <input
              type="text"
              value={data.phase || ''}
              onChange={(e) => updateNodeData(id, { phase: e.target.value })}
              placeholder="e.g. Phase 2 — Application Submission & Routing"
              className="w-full px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 focus:border-blue-500 text-xs text-slate-300 outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Description & Business Context
            </label>
            <textarea
              rows={2}
              value={data.description || ''}
              onChange={(e) => updateNodeData(id, { description: e.target.value })}
              placeholder="e.g. Dispatches instant confirmation email with unique applicant portal magic link and counselor contact info."
              className="w-full px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 focus:border-blue-500 text-xs text-slate-300 outline-none resize-none"
            />
          </div>
        </div>

        {/* TRIGGER CONFIGURATION */}
        {type === 'trigger' && (
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5" /> Trigger Parameters
            </h4>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Trigger Event</label>
              <select
                value={data.triggerEvent || 'Form Submitted'}
                onChange={(e) => updateNodeData(id, { triggerEvent: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200"
              >
                <option value="Form Submitted">Form Submitted</option>
                <option value="Application Updated">Application Updated</option>
                <option value="Documents Uploaded">Documents Uploaded</option>
                <option value="Seat Available">Waitlist Seat Available</option>
                <option value="Fee Confirmed">Fee Confirmed</option>
                <option value="External Webhook">External Webhook Event</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Attached Form Name / Source</label>
              <input
                type="text"
                value={data.formName || ''}
                onChange={(e) => updateNodeData(id, { formName: e.target.value })}
                placeholder="e.g. Toddle Online Admission Portal 2026-27"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200"
              />
            </div>
          </div>
        )}

        {/* ACTION CONFIGURATION */}
        {type === 'action' && (
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Action Parameters
            </h4>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Action Type</label>
              <select
                value={data.actionService || 'email'}
                onChange={(e) => updateNodeData(id, { actionService: e.target.value as any })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200"
              >
                <option value="email">Send Personalized Email</option>
                <option value="whatsapp">Send WhatsApp / SMS Alert</option>
                <option value="ocr_scanner">AI OCR Document Scan</option>
                <option value="pdf_generator">Generate Offer Letter PDF</option>
                <option value="sis_sync">Sync to School SIS / ERP</option>
              </select>
            </div>

            {/* Email / WhatsApp Specific Fields */}
            {(data.actionService === 'email' || data.actionService === 'whatsapp') && (
              <>
                {/* Quick Demo Templates */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Sample Templates
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(DEMO_TEMPLATES).map(([key, tpl]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => applyTemplate(tpl)}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors"
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-slate-400">Recipient</label>
                    <div className="flex gap-1">
                      {AVAILABLE_MERGE_VARS.slice(3, 5).map((v) => (
                        <button
                          key={v.tag}
                          type="button"
                          onClick={() => insertMergeVariable(v.tag, 'recipient')}
                          className="text-[9px] px-1 py-0.5 rounded bg-blue-900/60 text-blue-300 hover:bg-blue-800 font-mono"
                        >
                          {v.tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={data.recipient || ''}
                    onChange={(e) => updateNodeData(id, { recipient: e.target.value })}
                    placeholder="{{applicant.email}}"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-slate-400">Subject</label>
                    <div className="flex gap-1">
                      {AVAILABLE_MERGE_VARS.slice(0, 2).map((v) => (
                        <button
                          key={v.tag}
                          type="button"
                          onClick={() => insertMergeVariable(v.tag, 'subject')}
                          className="text-[9px] px-1 py-0.5 rounded bg-blue-900/60 text-blue-300 hover:bg-blue-800 font-mono"
                        >
                          {v.tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={data.subject || ''}
                    onChange={(e) => updateNodeData(id, { subject: e.target.value })}
                    placeholder="e.g. Welcome to Toddle Academy | Application {{applicant.id}} Received"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-slate-400">Template / Message Body</label>
                    <div className="flex gap-1">
                      {AVAILABLE_MERGE_VARS.map((v) => (
                        <button
                          key={v.tag}
                          type="button"
                          onClick={() => insertMergeVariable(v.tag, 'bodyContent')}
                          className="text-[9px] px-1 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 font-mono"
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    value={data.bodyContent || ''}
                    onChange={(e) => updateNodeData(id, { bodyContent: e.target.value })}
                    placeholder="e.g. Dear {{applicant.parentName}},\n\nThank you for submitting {{applicant.name}}'s application for Grade {{applicant.grade}} at {{applicant.campus}}..."
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 resize-none font-sans leading-relaxed"
                  />
                </div>

                {/* Live Interpolation Preview */}
                <div className="pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setShowLivePreview(!showLivePreview)}
                    className="flex items-center justify-between w-full text-[10px] uppercase font-semibold text-slate-400 hover:text-slate-200"
                  >
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-blue-400" />
                      Live Preview ({currentMockApplicant.name})
                    </span>
                    <span>{showLivePreview ? 'Hide' : 'Show'}</span>
                  </button>

                  {showLivePreview && (
                    <div className="mt-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] space-y-1.5">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase font-mono block">TO:</span>
                        <div className="text-slate-300 font-mono text-[10px]">
                          {interpolateVariables(data.recipient || '{{applicant.email}}', currentMockApplicant)}
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase font-mono block">SUBJECT:</span>
                        <div className="text-blue-300 font-semibold text-[11px]">
                          {interpolateVariables(data.subject || 'Welcome to Toddle Academy', currentMockApplicant)}
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase font-mono block">BODY:</span>
                        <div className="text-slate-300 whitespace-pre-line text-[10px] bg-slate-900/60 p-2 rounded border border-slate-800/60">
                          {interpolateVariables(
                            data.bodyContent ||
                              'Dear {{applicant.parentName}},\n\nThank you for submitting {{applicant.name}}\'s application for Grade {{applicant.grade}}.',
                            currentMockApplicant
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* SIS Sync Field Mappings Table */}
            {data.actionService === 'sis_sync' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">SIS System Name</label>
                  <input
                    type="text"
                    value={data.sisSystemName || 'Toddle Core SIS / PowerSchool ERP'}
                    onChange={(e) => updateNodeData(id, { sisSystemName: e.target.value })}
                    placeholder="Toddle Core SIS / PowerSchool ERP"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">SIS Endpoint API</label>
                  <input
                    type="text"
                    value={data.sisEndpoint || ''}
                    onChange={(e) => updateNodeData(id, { sisEndpoint: e.target.value })}
                    placeholder="https://api.toddleschool.com/v1/sis/students"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Field Mapping Schema
                    </label>
                    <button
                      onClick={handleAddFieldMapping}
                      className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      <Plus className="w-3 h-3" /> Add Mapping
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {(data.fieldMappings || [
                      { sourceField: 'firstName', targetField: 'first_name', transform: 'none' },
                      { sourceField: 'lastName', targetField: 'last_name', transform: 'none' },
                      { sourceField: 'email', targetField: 'student_email', transform: 'lowercase' },
                      { sourceField: 'grade', targetField: 'enrolled_grade', transform: 'to_number' }
                    ]).map((mapping, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/80 text-[11px]">
                        <input
                          type="text"
                          value={mapping.sourceField}
                          onChange={(e) => handleUpdateFieldMapping(idx, { sourceField: e.target.value })}
                          className="w-1/2 bg-slate-900 px-2 py-1 rounded border border-slate-700 text-slate-200 font-mono text-[10px]"
                        />
                        <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                        <input
                          type="text"
                          value={mapping.targetField}
                          onChange={(e) => handleUpdateFieldMapping(idx, { targetField: e.target.value })}
                          className="w-1/2 bg-slate-900 px-2 py-1 rounded border border-slate-700 text-slate-200 font-mono text-[10px]"
                        />
                        <button
                          onClick={() => handleRemoveFieldMapping(idx)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Async Retry Policy */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Async Resilience Policy
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Max Retries</span>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={data.retryPolicy?.maxRetries ?? 3}
                    onChange={(e) =>
                      updateNodeData(id, {
                        retryPolicy: {
                          enabled: true,
                          maxRetries: Number(e.target.value),
                          retryDelaySeconds: data.retryPolicy?.retryDelaySeconds || 5,
                          backoff: data.retryPolicy?.backoff || 'exponential',
                          onFinalFailure: data.retryPolicy?.onFinalFailure || 'stop_workflow'
                        }
                      })
                    }
                    className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Retry Delay (s)</span>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={data.retryPolicy?.retryDelaySeconds ?? 5}
                    onChange={(e) =>
                      updateNodeData(id, {
                        retryPolicy: {
                          enabled: true,
                          maxRetries: data.retryPolicy?.maxRetries || 3,
                          retryDelaySeconds: Number(e.target.value),
                          backoff: data.retryPolicy?.backoff || 'exponential',
                          onFinalFailure: data.retryPolicy?.onFinalFailure || 'stop_workflow'
                        }
                      })
                    }
                    className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONDITION CONFIGURATION */}
        {type === 'condition' && (
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <GitFork className="w-3.5 h-3.5" /> Logic & Evaluation Rules
            </h4>

            {data.conditionRules && data.conditionRules.length > 0 && (
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Evaluation Field</label>
                  <input
                    type="text"
                    value={data.conditionRules[0].field}
                    onChange={(e) => {
                      const rules = [...(data.conditionRules || [])];
                      rules[0] = { ...rules[0], field: e.target.value };
                      updateNodeData(id, { conditionRules: rules });
                    }}
                    placeholder="applicant.gradeCategory"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Operator</label>
                    <select
                      value={data.conditionRules[0].operator}
                      onChange={(e) => {
                        const rules = [...(data.conditionRules || [])];
                        rules[0] = { ...rules[0], operator: e.target.value };
                        updateNodeData(id, { conditionRules: rules });
                      }}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200"
                    >
                      <option value="equals">equals (==)</option>
                      <option value="not_equals">not equals (!=)</option>
                      <option value="greater_than">&gt; greater than</option>
                      <option value="less_than">&lt; less than</option>
                      <option value="greater_than_or_equal">&gt;= greater or equal</option>
                      <option value="less_than_or_equal">&lt;= less or equal</option>
                      <option value="contains">contains</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Compare Value</label>
                    <input
                      type="text"
                      value={String(data.conditionRules[0].value)}
                      onChange={(e) => {
                        const rules = [...(data.conditionRules || [])];
                        rules[0] = { ...rules[0], value: e.target.value };
                        updateNodeData(id, { conditionRules: rules });
                      }}
                      placeholder="Middle / High School"
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DELAY CONFIGURATION */}
        {type === 'delay' && (
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Delay & SLA Parameters
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Duration</label>
                <input
                  type="number"
                  min={1}
                  value={data.delayDuration || 48}
                  onChange={(e) => updateNodeData(id, { delayDuration: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Unit</label>
                <select
                  value={data.delayUnit || 'hours'}
                  onChange={(e) => updateNodeData(id, { delayUnit: e.target.value as any })}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Delay Timing Type</label>
              <select
                value={data.delayType || 'fixed_duration'}
                onChange={(e) => updateNodeData(id, { delayType: e.target.value as any })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200"
              >
                <option value="fixed_duration">Fixed Duration Window</option>
                <option value="date_anchored">Date Anchored (e.g. 24h Before Interview)</option>
                <option value="sla_window">SLA Timeout Escalation</option>
              </select>
            </div>
          </div>
        )}

        {/* HUMAN INTERVENTION CONFIGURATION */}
        {type === 'human' && (
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Human Review & Outcomes
            </h4>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Task Title</label>
              <input
                type="text"
                value={data.humanTaskTitle || ''}
                onChange={(e) => updateNodeData(id, { humanTaskTitle: e.target.value })}
                placeholder="e.g. Admissions Committee Decision & Rubric Review"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Assigned Role</label>
              <select
                value={data.assignedRole || 'Admissions Committee & Academic Head'}
                onChange={(e) => updateNodeData(id, { assignedRole: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200"
              >
                <option value="Admissions Committee & Academic Head">Admissions Committee & Head</option>
                <option value="Lead Principal">Lead Principal</option>
                <option value="Admissions Officer & Counselor">Admissions Officer & Counselor</option>
                <option value="Bursar & Finance Desk">Bursar & Finance Desk</option>
                <option value="International Admissions Lead">International Admissions Lead</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">SLA Timeout (Hours)</label>
              <input
                type="number"
                value={data.timeoutHours || 72}
                onChange={(e) => updateNodeData(id, { timeoutHours: Number(e.target.value) })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 font-mono"
              />
            </div>
          </div>
        )}

        {/* GOAL CONFIGURATION */}
        {type === 'goal' && (
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> Goal Objective Settings
            </h4>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Target Metric Objective</label>
              <select
                value={data.goalTargetMetric || 'fee_paid'}
                onChange={(e) => updateNodeData(id, { goalTargetMetric: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200"
              >
                <option value="fee_paid">Admission Fee Paid ($)</option>
                <option value="mandatory_docs_uploaded">Mandatory Documents Complete</option>
                <option value="onboarding_forms_submitted">Medical & Transport Forms Submitted</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Check Interval (Hours)</label>
                <input
                  type="number"
                  value={data.goalCheckIntervalHours || 24}
                  onChange={(e) => updateNodeData(id, { goalCheckIntervalHours: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Max Attempts</label>
                <input
                  type="number"
                  value={data.goalMaxAttempts || 7}
                  onChange={(e) => updateNodeData(id, { goalMaxAttempts: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* SYSTEM TASK CONFIGURATION */}
        {type === 'system' && (
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> System Handover Parameters
            </h4>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Provisioning Endpoint API</label>
              <input
                type="text"
                value={data.sisEndpoint || 'https://api.toddleschool.com/v1/provisioning'}
                onChange={(e) => updateNodeData(id, { sisEndpoint: e.target.value })}
                placeholder="https://api.toddleschool.com/v1/provisioning"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Provisioning Tasks & Summary</label>
              <textarea
                rows={3}
                value={data.bodyContent || 'Provision student LMS credentials, assign homeroom teacher, generate student ID card, and schedule first day timetable.'}
                onChange={(e) => updateNodeData(id, { bodyContent: e.target.value })}
                placeholder="Provision student LMS credentials, assign homeroom teacher, generate student ID card, and schedule first day timetable."
                className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 resize-none font-sans"
              />
            </div>
          </div>
        )}

        {/* TECHNICAL CODE SNIPPET / LOGIC INSPECTION */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-blue-400" />
              Technical Execution Logic
            </h4>
          </div>
          <div className="rounded-lg bg-slate-950 border border-slate-800 p-2.5 overflow-hidden">
            <pre className="text-[10px] leading-relaxed font-mono text-blue-200/90 whitespace-pre overflow-x-auto scrollbar-thin">
              <code>{generateNodeCodeSnippet(type, data)}</code>
            </pre>
          </div>
        </div>
      </div>
    </aside>
  );
};

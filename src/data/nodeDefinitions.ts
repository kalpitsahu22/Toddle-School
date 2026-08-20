import { NodeType, NodeCategory } from '../types/workflow';

export interface CustomNodeHandle {
  id: string;
  type: 'source' | 'target';
  label?: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  color?: string;
}

export interface NodeDefinition {
  id?: string;
  type: NodeType;
  subtype: string;
  label: string;
  category: NodeCategory;
  description: string;
  iconName: string;
  isCustom?: boolean;
  colorTheme: {
    bg: string;
    border: string;
    text: string;
    glow: string;
    badgeBg: string;
    badgeText: string;
  };
  defaultHandles: Array<{
    id: string;
    type: 'source' | 'target';
    label?: string;
    position: 'top' | 'bottom' | 'left' | 'right';
    color?: string;
  }>;
  defaultConfig: Record<string, unknown>;
}

export const COLOR_THEME_PRESETS: Record<string, NodeDefinition['colorTheme']> = {
  emerald: {
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-500/50',
    text: 'text-emerald-300',
    glow: 'shadow-emerald-500/20',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-300'
  },
  blue: {
    bg: 'bg-blue-950/40',
    border: 'border-blue-500/50',
    text: 'text-blue-300',
    glow: 'shadow-blue-500/20',
    badgeBg: 'bg-blue-500/20',
    badgeText: 'text-blue-300'
  },
  indigo: {
    bg: 'bg-indigo-950/40',
    border: 'border-indigo-500/50',
    text: 'text-indigo-300',
    glow: 'shadow-indigo-500/20',
    badgeBg: 'bg-indigo-500/20',
    badgeText: 'text-indigo-300'
  },
  amber: {
    bg: 'bg-amber-950/40',
    border: 'border-amber-500/50',
    text: 'text-amber-300',
    glow: 'shadow-amber-500/20',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-300'
  },
  purple: {
    bg: 'bg-purple-950/40',
    border: 'border-purple-500/50',
    text: 'text-purple-300',
    glow: 'shadow-purple-500/20',
    badgeBg: 'bg-purple-500/20',
    badgeText: 'text-purple-300'
  },
  rose: {
    bg: 'bg-rose-950/40',
    border: 'border-rose-500/50',
    text: 'text-rose-300',
    glow: 'shadow-rose-500/20',
    badgeBg: 'bg-rose-500/20',
    badgeText: 'text-rose-300'
  },
  orange: {
    bg: 'bg-orange-950/40',
    border: 'border-orange-500/50',
    text: 'text-orange-300',
    glow: 'shadow-orange-500/20',
    badgeBg: 'bg-orange-500/20',
    badgeText: 'text-orange-300'
  },
  cyan: {
    bg: 'bg-cyan-950/40',
    border: 'border-cyan-500/50',
    text: 'text-cyan-300',
    glow: 'shadow-cyan-500/20',
    badgeBg: 'bg-cyan-500/20',
    badgeText: 'text-cyan-300'
  },
  teal: {
    bg: 'bg-teal-950/40',
    border: 'border-teal-500/50',
    text: 'text-teal-300',
    glow: 'shadow-teal-500/20',
    badgeBg: 'bg-teal-500/20',
    badgeText: 'text-teal-300'
  }
};

export const BUILT_IN_NODE_DEFINITIONS: Record<string, NodeDefinition> = {
  // ===================== TRIGGERS =====================
  trigger_form_submitted: {
    type: 'trigger',
    subtype: 'form_submitted',
    label: 'Form Submitted',
    category: 'Trigger',
    description: 'Fires immediately when an admission application or web enquiry form is submitted.',
    iconName: 'FileSpreadsheet',
    colorTheme: COLOR_THEME_PRESETS.emerald,
    defaultHandles: [
      { id: 'source', type: 'source', position: 'bottom' }
    ],
    defaultConfig: {
      phase: 'Phase 1 — Lead Capture & Enquiry',
      description: 'Fires immediately when an admission application or web enquiry form is submitted. Deduplicates student record in CRM.',
      triggerEvent: 'Form Submitted',
      formName: 'Toddle Online Admission Portal 2026-27',
      payloadSchema: [
        { key: 'firstName', label: 'First Name', type: 'string', sample: 'Sophia' },
        { key: 'lastName', label: 'Last Name', type: 'string', sample: 'Chen' },
        { key: 'dateOfBirth', label: 'Date of Birth', type: 'date', sample: '2012-04-15' },
        { key: 'email', label: 'Applicant/Parent Email', type: 'string', sample: 'marcus.chen@example.com' },
        { key: 'phone', label: 'Contact Phone', type: 'string', sample: '+1 (555) 349-2810' },
        { key: 'grade', label: 'Applying Grade', type: 'number', sample: '7' },
        { key: 'category', label: 'Student Category', type: 'string', sample: 'Middle / High School' },
        { key: 'nationality', label: 'Nationality', type: 'string', sample: 'United States' },
        { key: 'campus', label: 'Selected Campus', type: 'string', sample: 'North Valley Campus' }
      ]
    }
  },

  trigger_docs_uploaded: {
    type: 'trigger',
    subtype: 'docs_uploaded',
    label: 'Documents Uploaded',
    category: 'Trigger',
    description: 'Fires when an applicant uploads required verification documents.',
    iconName: 'UploadCloud',
    colorTheme: COLOR_THEME_PRESETS.emerald,
    defaultHandles: [
      { id: 'source', type: 'source', position: 'bottom' }
    ],
    defaultConfig: {
      phase: 'Phase 3 — Document Verification',
      description: 'Triggered as soon as parent completes document bundle upload in the portal.',
      triggerEvent: 'Documents Uploaded',
      formName: 'Mandatory Document & Transcripts Portal 2026'
    }
  },

  trigger_seat_available: {
    type: 'trigger',
    subtype: 'seat_available',
    label: 'Waitlist Seat Available',
    category: 'Trigger',
    description: 'Fires when a seat opens up in a previously filled grade/campus combination.',
    iconName: 'UserCheck',
    colorTheme: COLOR_THEME_PRESETS.emerald,
    defaultHandles: [
      { id: 'source', type: 'source', position: 'bottom' }
    ],
    defaultConfig: {
      phase: 'Phase 6 — Waitlist Promotion',
      description: 'Fires when an existing enrolled student withdraws or a capacity expansion is approved.',
      triggerEvent: 'Seat Available',
      formName: 'Waitlist Auto-Promotion Event Handler'
    }
  },

  // ===================== ACTIONS =====================
  action_send_email: {
    type: 'action',
    subtype: 'send_email',
    label: 'Send Personalized Email',
    category: 'Action',
    description: 'Sends a personalized email using merge variables to the applicant or guardian.',
    iconName: 'Mail',
    colorTheme: COLOR_THEME_PRESETS.blue,
    defaultHandles: [
      { id: 'target', type: 'target', position: 'top' },
      { id: 'source', type: 'source', position: 'bottom' }
    ],
    defaultConfig: {
      phase: 'Phase 1 — Lead Capture & Nurturing',
      description: 'Sends immediate branded confirmation with portal credentials and admissions counselor details.',
      actionService: 'email',
      recipient: '{{applicant.email}}',
      templateId: 'tpl_admission_welcome',
      subject: 'Welcome to Toddle Academy | Application {{applicant.id}} Received',
      bodyContent: 'Dear {{applicant.parentName}},\n\nThank you for submitting {{applicant.name}}\'s application for Grade {{applicant.grade}} at {{applicant.campus}}.\n\nYour application status and document checklist are available live at:\nhttps://admissions.toddle.school/portal/{{applicant.id}}\n\nWarm regards,\nToddle Admissions Office',
      retryPolicy: {
        enabled: true,
        maxRetries: 3,
        retryDelaySeconds: 5,
        backoff: 'exponential',
        onFinalFailure: 'route_to_fallback'
      }
    }
  },

  action_send_whatsapp: {
    type: 'action',
    subtype: 'send_whatsapp',
    label: 'Send WhatsApp / SMS',
    category: 'Action',
    description: 'Sends instant multi-channel WhatsApp and SMS alerts for time-sensitive notifications.',
    iconName: 'MessageSquare',
    colorTheme: COLOR_THEME_PRESETS.blue,
    defaultHandles: [
      { id: 'target', type: 'target', position: 'top' },
      { id: 'source', type: 'source', position: 'bottom' }
    ],
    defaultConfig: {
      phase: 'Phase 4 — Assessment & Interview',
      description: 'Multi-channel SMS and WhatsApp alert sent 24h prior to scheduled assessment slot.',
      actionService: 'whatsapp',
      recipient: '{{applicant.parentPhone}}',
      templateId: 'tpl_interview_reminder_24h',
      subject: 'Interview Reminder: Tomorrow at Toddle Academy',
      bodyContent: 'Reminder: Assessment interview for {{applicant.name}} is scheduled tomorrow at 10:00 AM. Campus gate map: https://toddle.school/map',
      retryPolicy: {
        enabled: true,
        maxRetries: 2,
        retryDelaySeconds: 3,
        backoff: 'fixed',
        onFinalFailure: 'ignore'
      }
    }
  },

  action_ai_ocr_scan: {
    type: 'action',
    subtype: 'ai_ocr_scan',
    label: 'AI OCR Document Scan',
    category: 'Action',
    description: 'Pre-validates file readability, extracts key fields via OCR before staff opens the file.',
    iconName: 'ScanLine',
    colorTheme: COLOR_THEME_PRESETS.indigo,
    defaultHandles: [
      { id: 'target', type: 'target', position: 'top' },
      { id: 'source', type: 'source', position: 'bottom' }
    ],
    defaultConfig: {
      phase: 'Phase 2 — Application Submission & Routing',
      description: 'Scans passport, birth certificate and school transcripts to verify legibility and extract date of birth and GPA.',
      actionService: 'ocr_scanner',
      retryPolicy: {
        enabled: true,
        maxRetries: 2,
        retryDelaySeconds: 4,
        backoff: 'fixed',
        onFinalFailure: 'route_to_fallback'
      }
    }
  },

  action_generate_offer_pdf: {
    type: 'action',
    subtype: 'generate_offer_pdf',
    label: 'Generate Offer PDF & Link',
    category: 'Action',
    description: 'Generates official digital offer letter PDF with 7-day payment link attached.',
    iconName: 'FileCheck',
    colorTheme: COLOR_THEME_PRESETS.blue,
    defaultHandles: [
      { id: 'target', type: 'target', position: 'top' },
      { id: 'source', type: 'source', position: 'bottom' }
    ],
    defaultConfig: {
      phase: 'Phase 5 — Admissions Committee & Offer',
      description: 'Generates legally binding digital acceptance letter and unique payment invoice.',
      actionService: 'pdf_generator',
      templateId: 'tpl_official_offer_letter_v2',
      recipient: '{{applicant.email}}',
      subject: 'Official Offer of Admission — Toddle Academy (Ref: {{applicant.id}})',
      bodyContent: 'Dear {{applicant.parentName}},\n\nWe are delighted to extend an official Offer of Admission for {{applicant.name}} into Grade {{applicant.grade}} at Toddle Academy!\n\nPlease review your offer letter and complete seat confirmation deposit within 7 days: https://admissions.toddle.school/offers/{{applicant.id}}\n\nWarm congratulations,\nAdmissions Committee',
      retryPolicy: {
        enabled: true,
        maxRetries: 3,
        retryDelaySeconds: 5,
        backoff: 'exponential',
        onFinalFailure: 'route_to_fallback'
      }
    }
  },

  action_sync_sis: {
    type: 'action',
    subtype: 'sync_sis',
    label: 'Sync to SIS / ERP',
    category: 'Action',
    description: 'Syncs student and family profile to school core SIS/ERP and provisions accounts.',
    iconName: 'Server',
    colorTheme: COLOR_THEME_PRESETS.cyan,
    defaultHandles: [
      { id: 'target', type: 'target', position: 'top' },
      { id: 'source', type: 'source', position: 'bottom' }
    ],
    defaultConfig: {
      phase: 'Phase 7 — SIS Handover & Provisioning',
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
      ],
      retryPolicy: {
        enabled: true,
        maxRetries: 3,
        retryDelaySeconds: 10,
        backoff: 'exponential',
        onFinalFailure: 'route_to_fallback'
      }
    }
  },

  // ===================== LOGIC / CONDITIONS =====================
  condition_grade_router: {
    type: 'condition',
    subtype: 'grade_router',
    label: 'Route by Grade & Category',
    category: 'Logic',
    description: 'Multi-branching decision based on grade band and student profile.',
    iconName: 'GitFork',
    colorTheme: COLOR_THEME_PRESETS.amber,
    defaultHandles: [
      { id: 'target', type: 'target', position: 'top' },
      { id: 'primary', type: 'source', label: 'Primary (Gr K-5)', position: 'bottom', color: '#3B82F6' },
      { id: 'secondary', type: 'source', label: 'Middle/High (Gr 6-12)', position: 'bottom', color: '#8B5CF6' },
      { id: 'boarding', type: 'source', label: 'Boarding / Overseas', position: 'bottom', color: '#06B6D4' }
    ],
    defaultConfig: {
      phase: 'Phase 2 — Application Submission & Routing',
      description: 'Evaluates applicant grade category to route application to appropriate department coordinator queue.',
      conditionRules: [
        { field: 'applicant.gradeCategory', operator: 'equals', value: 'Middle / High School' }
      ],
      branches: [
        { handleId: 'primary', label: 'Primary (Gr K-5)', color: '#3B82F6', description: 'Route to Primary Admissions Team' },
        { handleId: 'secondary', label: 'Middle/High (Gr 6-12)', color: '#8B5CF6', description: 'Route to Secondary & IB Coordinator' },
        { handleId: 'boarding', label: 'Boarding / Overseas', color: '#06B6D4', description: 'Route to International Admissions Lead' }
      ]
    }
  },

  condition_boolean: {
    type: 'condition',
    subtype: 'boolean_check',
    label: 'Condition (IF / ELSE)',
    category: 'Logic',
    description: 'Evaluates dynamic rule and branches into TRUE and FALSE paths.',
    iconName: 'Split',
    colorTheme: COLOR_THEME_PRESETS.amber,
    defaultHandles: [
      { id: 'target', type: 'target', position: 'top' },
      { id: 'true', type: 'source', label: 'TRUE / YES', position: 'bottom', color: '#10B981' },
      { id: 'false', type: 'source', label: 'FALSE / NO', position: 'bottom', color: '#EF4444' }
    ],
    defaultConfig: {
      phase: 'Phase 3 — Document Verification',
      description: 'Single-pass validation check evaluating whether all mandatory documents and criteria are satisfied.',
      conditionRules: [
        { field: 'applicant.mandatoryDocsValid', operator: 'equals', value: true }
      ],
      branches: [
        { handleId: 'true', label: 'TRUE / YES', color: '#10B981', description: 'Documents verified and complete' },
        { handleId: 'false', label: 'FALSE / NO', color: '#EF4444', description: 'Missing or invalid documents (SLA alert)' }
      ]
    }
  },

  // ===================== DELAY / SLA =====================
  delay_sla_timer: {
    type: 'delay',
    subtype: 'delay_timer',
    label: 'Delay / SLA Window',
    category: 'Control',
    description: 'Waits for duration or anchors to a relative date. Supports immediate early action bypass.',
    iconName: 'Clock',
    colorTheme: COLOR_THEME_PRESETS.purple,
    defaultHandles: [
      { id: 'target', type: 'target', position: 'top' },
      { id: 'source', type: 'source', label: 'Resume', position: 'bottom' }
    ],
    defaultConfig: {
      phase: 'Phase 1 — Lead Capture & Nurturing',
      description: 'Pauses workflow execution to give applicant digest time. If applicant takes early action (e.g. books tour), delay is skipped immediately.',
      delayDuration: 48,
      delayUnit: 'hours',
      delayType: 'fixed_duration',
      allowEarlyActionBypass: true,
      earlyActionEvents: ['tour.booked', 'application.started']
    }
  },

  // ===================== HUMAN INTERVENTION =====================
  human_decision: {
    type: 'human',
    subtype: 'human_decision',
    label: 'Admissions Committee Decision',
    category: 'Human',
    description: 'Pauses workflow execution until authorized staff reviews the rubric and selects an outcome.',
    iconName: 'Users',
    colorTheme: COLOR_THEME_PRESETS.rose,
    defaultHandles: [
      { id: 'target', type: 'target', position: 'top' },
      { id: 'admit', type: 'source', label: 'Admit', position: 'bottom', color: '#10B981' },
      { id: 'waitlist', type: 'source', label: 'Waitlist', position: 'bottom', color: '#F59E0B' },
      { id: 'conditional', type: 'source', label: 'Conditional Offer', position: 'bottom', color: '#3B82F6' },
      { id: 'decline', type: 'source', label: 'Decline', position: 'bottom', color: '#EF4444' }
    ],
    defaultConfig: {
      phase: 'Phase 5 — Committee Decision',
      description: 'Requires holistic evaluation review by the Admissions Committee and Academic Head.',
      humanTaskTitle: 'Admissions Committee Decision & Rubric Review',
      assignedRole: 'Admissions Committee & Academic Head',
      timeoutHours: 72,
      allowedOutcomes: [
        { actionId: 'admit', label: 'Admit Candidate', variant: 'success', nextStatus: 'Offered' },
        { actionId: 'waitlist', label: 'Place on Waitlist', variant: 'warning', nextStatus: 'Waitlisted' },
        { actionId: 'conditional', label: 'Conditional Offer', variant: 'info', nextStatus: 'Conditional Offer' },
        { actionId: 'decline', label: 'Decline Application', variant: 'danger', nextStatus: 'Declined' }
      ]
    }
  },

  // ===================== PERSISTENT GOAL =====================
  goal_node: {
    type: 'goal',
    subtype: 'persistent_goal',
    label: 'Goal: Fee Payment',
    category: 'Persistent Goal',
    description: 'Persistent objective that repeatedly checks condition over time rather than a one-time pass/fail.',
    iconName: 'Target',
    colorTheme: COLOR_THEME_PRESETS.orange,
    defaultHandles: [
      { id: 'target', type: 'target', position: 'top' },
      { id: 'success', type: 'source', label: 'Goal Satisfied (Paid)', position: 'bottom', color: '#10B981' },
      { id: 'timeout', type: 'source', label: 'Goal Expired / Unpaid', position: 'right', color: '#EF4444' }
    ],
    defaultConfig: {
      phase: 'Phase 6 — Fee Collection & Enrollment',
      description: 'Persistent polling loop monitoring admission confirmation fee. Supports fast-track manual offline bank wire bypass.',
      goalTargetMetric: 'fee_paid',
      goalCheckIntervalHours: 24,
      goalMaxAttempts: 7,
      goalSuccessBehavior: 'continue_workflow',
      goalTimeoutBehavior: 'set_offer_expired',
      goalFastTrackBypass: true
    }
  },

  // ===================== SYSTEM / HANDOVER =====================
  system_task: {
    type: 'system',
    subtype: 'system_task',
    label: 'System: Provision Accounts & Timetable',
    category: 'System / SIS',
    description: 'Automates homeroom allocation, bus route assignment, and provisions student & parent accounts.',
    iconName: 'Cpu',
    colorTheme: COLOR_THEME_PRESETS.teal,
    defaultHandles: [
      { id: 'target', type: 'target', position: 'top' },
      { id: 'source', type: 'source', position: 'bottom' }
    ],
    defaultConfig: {
      phase: 'Phase 7 — SIS Handover & Provisioning',
      description: 'Automates homeroom allocation, bus route assignment, and provisions student & parent portal accounts.',
      actionService: 'task_creator',
      sisEndpoint: 'https://api.toddleschool.com/v1/provisioning',
      bodyContent: 'Provision student LMS credentials, assign homeroom teacher, generate student ID card, and schedule first day timetable.'
    }
  }
};

export const NODE_DEFINITIONS = BUILT_IN_NODE_DEFINITIONS;

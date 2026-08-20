import { Workflow, WorkflowNode, WorkflowEdge } from '../types/workflow';

// ============================================================================
// 9 MODULAR DECOUPLED WORKFLOWS (Matching 9 Standard Admission Phases)
// ============================================================================

/**
 * Modular Flow 1: Lead Capture & Enquiry Nurturing
 */
export const MODULAR_FLOW_1_LEAD_CAPTURE: Workflow = {
  id: 'wf-mod-1-lead-capture',
  name: '1. Phase 1 — Lead Capture & Enquiry Nurturing',
  description: 'Triggered when a prospective parent submits a website inquiry. Features immediate AI prospectus dispatch and early tour booking delay cancellation.',
  category: 'enquiry',
  workflowType: 'modular_phase',
  emittedEventOnComplete: 'lead.nurtured_or_tour_booked',
  version: 1,
  status: 'published',
  createdAt: '2026-08-20T10:00:00.000Z',
  updatedAt: '2026-08-20T10:00:00.000Z',
  tags: ['Modular Phase', 'Phase 1', 'Lead Gen'],
  nodes: [
    {
      id: 'm1-node-trigger',
      type: 'trigger',
      position: { x: 350, y: 50 },
      data: {
        label: 'Website Enquiry Form Submitted',
        subtitle: 'Phase 1 Entry Trigger',
        category: 'Trigger',
        phase: 'Phase 1 — Lead Capture & Enquiry',
        nodeSubtype: 'form_submitted',
        triggerEvent: 'Enquiry Form Submitted',
        formName: 'Toddle Web Enquiry & Prospectus Form 2026',
        description: 'Prospective family enquiry captured. Lead profile generated and deduplicated in CRM.',
        payloadSchema: [
          { key: 'firstName', label: 'First Name', type: 'string', sample: 'Sophia' },
          { key: 'lastName', label: 'Last Name', type: 'string', sample: 'Chen' },
          { key: 'email', label: 'Parent Email', type: 'string', sample: 'marcus.chen@example.com' },
          { key: 'phone', label: 'Contact Phone', type: 'string', sample: '+1 (555) 349-2810' },
          { key: 'grade', label: 'Target Grade', type: 'number', sample: '7' },
          { key: 'campus', label: 'Preferred Campus', type: 'string', sample: 'North Valley Campus' }
        ]
      }
    },
    {
      id: 'm1-node-prospectus',
      type: 'action',
      position: { x: 350, y: 400 },
      data: {
        label: 'AI Personalized Prospectus & Virtual Tour',
        subtitle: 'Automated Immediate Response',
        category: 'Action',
        phase: 'Phase 1 — Lead Capture & Enquiry',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: '{{applicant.email}}',
        subject: 'Welcome to Toddle Academy | Prospectus & Campus Tour for {{applicant.name}}',
        bodyContent: 'Dear {{applicant.parentName}},\n\nThank you for your interest in Toddle Academy for {{applicant.name}} (Grade {{applicant.grade}} at {{applicant.campus}}).\n\nWe have prepared a personalized digital prospectus highlighting our IB Continuum curriculum, athletics, and STEAM maker spaces: https://admissions.toddle.school/explore/{{applicant.id}}\n\nWarm regards,\nToddle Admissions Team',
        retryPolicy: {
          enabled: true,
          maxRetries: 3,
          retryDelaySeconds: 5,
          backoff: 'exponential',
          onFinalFailure: 'route_to_fallback'
        }
      }
    },
    {
      id: 'm1-node-delay',
      type: 'delay',
      position: { x: 350, y: 760 },
      data: {
        label: 'Wait 3 Days (With Early Booking Bypass)',
        subtitle: 'Nurture Window',
        category: 'Control',
        phase: 'Phase 1 — Lead Capture & Enquiry',
        nodeSubtype: 'delay_timer',
        delayDuration: 72,
        delayUnit: 'hours',
        delayType: 'fixed_duration',
        allowEarlyActionBypass: true,
        earlyActionEvents: ['tour.booked', 'application.started'],
        description: 'Gives the family time to review. If parent books a campus tour early, the 3-day delay is instantly bypassed!'
      }
    },
    {
      id: 'm1-node-tour-check',
      type: 'condition',
      position: { x: 350, y: 1120 },
      data: {
        label: 'Campus Tour Booked?',
        subtitle: 'Engagement Fork',
        category: 'Logic',
        phase: 'Phase 1 — Lead Capture & Enquiry',
        nodeSubtype: 'boolean_check',
        description: 'Checks CRM event logs to see if parent scheduled a personalized campus walkthrough.',
        conditionRules: [
          { field: 'applicant.tourBooked', operator: 'equals', value: true }
        ],
        branches: [
          { handleId: 'true', label: 'Tour Booked (YES)', color: '#10B981', description: 'Schedule admissions counselor meeting' },
          { handleId: 'false', label: 'Not Yet Booked (NO)', color: '#F59E0B', description: 'Send digital nurture highlights' }
        ]
      }
    },
    {
      id: 'm1-node-confirm-tour',
      type: 'action',
      position: { x: 150, y: 1540 },
      data: {
        label: 'Schedule Open Day & Assign Counselor',
        subtitle: 'High-Intent Routing',
        category: 'Action',
        phase: 'Phase 1 — Lead Capture & Enquiry',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: '{{applicant.email}}',
        subject: 'Campus Tour Confirmed | Dedicated Counselor Assigned for {{applicant.name}}',
        bodyContent: 'Dear {{applicant.parentName}},\n\nYour campus tour for {{applicant.name}} is confirmed for next Tuesday at 10:00 AM at {{applicant.campus}}.\n\nYour dedicated Admissions Counselor, Sarah Jenkins, will meet you at the Welcome Pavilion.',
        retryPolicy: {
          enabled: true,
          maxRetries: 3,
          retryDelaySeconds: 5,
          backoff: 'exponential',
          onFinalFailure: 'route_to_fallback'
        }
      }
    },
    {
      id: 'm1-node-nurture-email',
      type: 'action',
      position: { x: 550, y: 1540 },
      data: {
        label: 'Send Value Highlights & Video Testimonials',
        subtitle: 'Automated Nurturing',
        category: 'Action',
        phase: 'Phase 1 — Lead Capture & Enquiry',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: '{{applicant.email}}',
        subject: 'Discover Academic Excellence & Student Life at Toddle Academy',
        bodyContent: 'Dear {{applicant.parentName}},\n\nHere is a quick look at why families choose Toddle Academy for Grade {{applicant.grade}}:\n\n• 100% IB Diploma Pass Rate\n• 1:8 Faculty-to-Student Mentorship\n• 40+ Extracurricular Arts & Sports Clubs\n\nReady to apply? Start your application in 5 minutes: https://admissions.toddle.school/apply/{{applicant.id}}',
        retryPolicy: {
          enabled: true,
          maxRetries: 3,
          retryDelaySeconds: 5,
          backoff: 'exponential',
          onFinalFailure: 'route_to_fallback'
        }
      }
    }
  ],
  edges: [
    { id: 'm1-e1', source: 'm1-node-trigger', target: 'm1-node-prospectus', animated: true },
    { id: 'm1-e2', source: 'm1-node-prospectus', target: 'm1-node-delay', animated: true },
    { id: 'm1-e3', source: 'm1-node-delay', target: 'm1-node-tour-check', animated: true },
    { id: 'm1-e4-true', source: 'm1-node-tour-check', sourceHandle: 'true', target: 'm1-node-confirm-tour', label: 'Tour Booked', animated: true },
    { id: 'm1-e4-false', source: 'm1-node-tour-check', sourceHandle: 'false', target: 'm1-node-nurture-email', label: 'Not Yet Booked', animated: true }
  ]
};

/**
 * Modular Flow 2: Application Submission & Staff Routing
 */
export const MODULAR_FLOW_2_APP_SUBMISSION: Workflow = {
  id: 'wf-mod-2-app-submission',
  name: '2. Phase 2 — Application Submission & Staff Routing',
  description: 'Triggers when a formal application form is submitted. Routes candidate to Primary, Secondary, or International Boarding admissions desk.',
  category: 'application',
  workflowType: 'modular_phase',
  emittedEventOnComplete: 'application.routed',
  version: 1,
  status: 'published',
  createdAt: '2026-08-20T10:00:00.000Z',
  updatedAt: '2026-08-20T10:00:00.000Z',
  tags: ['Modular Phase', 'Phase 2', 'Intelligent Routing'],
  nodes: [
    {
      id: 'm2-node-trigger',
      type: 'trigger',
      position: { x: 350, y: 50 },
      data: {
        label: 'Formal Admission Application Submitted',
        subtitle: 'Phase 2 Entry Trigger',
        category: 'Trigger',
        phase: 'Phase 2 — Application Submission & Routing',
        nodeSubtype: 'form_submitted',
        triggerEvent: 'Application Form Submitted',
        formName: 'Toddle Full Admission Application 2026',
        description: 'Complete student dossier, parent statements, and medical disclosures ingested.',
        payloadSchema: [
          { key: 'applicantId', label: 'Application ID', type: 'string', sample: 'APP-2026-7841' },
          { key: 'studentName', label: 'Student Name', type: 'string', sample: 'Sophia Chen' },
          { key: 'gradeCategory', label: 'Grade Category', type: 'string', sample: 'Middle / High School' },
          { key: 'boardingRequired', label: 'Boarding Required', type: 'boolean', sample: 'false' }
        ]
      }
    },
    {
      id: 'm2-node-portal-pin',
      type: 'action',
      position: { x: 350, y: 400 },
      data: {
        label: 'Send Application Receipt & Parent Portal Access',
        subtitle: 'Secure Credential Handshake',
        category: 'Action',
        phase: 'Phase 2 — Application Submission & Routing',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: '{{applicant.email}}',
        subject: 'Application {{applicant.id}} Received | Parent Portal Access for {{applicant.name}}',
        bodyContent: 'Dear {{applicant.parentName}},\n\nThank you for submitting {{applicant.name}}\'s formal application for Grade {{applicant.grade}}.\n\nYour application status tracking portal: https://admissions.toddle.school/portal/{{applicant.id}}\nApplication PIN: 8492\n\nPlease log in to upload required transcripts and identification.',
        retryPolicy: {
          enabled: true,
          maxRetries: 3,
          retryDelaySeconds: 5,
          backoff: 'exponential',
          onFinalFailure: 'route_to_fallback'
        }
      }
    },
    {
      id: 'm2-node-grade-router',
      type: 'condition',
      position: { x: 350, y: 760 },
      data: {
        label: 'Route by Grade Band & Campus Category',
        subtitle: 'Dynamic Department Fork',
        category: 'Logic',
        phase: 'Phase 2 — Application Submission & Routing',
        nodeSubtype: 'grade_router',
        description: 'Evaluates applicant grade to assign the appropriate specialized admissions officer team.',
        conditionRules: [
          { field: 'applicant.gradeCategory', operator: 'equals', value: 'Middle / High School' }
        ],
        branches: [
          { handleId: 'secondary', label: 'Secondary (Gr 6-12)', color: '#8B5CF6', description: 'Middle & High School IB Coordinator' },
          { handleId: 'primary', label: 'Primary (Gr K-5)', color: '#3B82F6', description: 'Primary Years Coordinator' },
          { handleId: 'boarding', label: 'Boarding / Overseas', color: '#06B6D4', description: 'International Boarding Desk' }
        ]
      }
    },
    {
      id: 'm2-node-route-secondary',
      type: 'action',
      position: { x: 100, y: 1180 },
      data: {
        label: 'Assign to Secondary & IB Admissions Team',
        subtitle: 'Staff Task Notification',
        category: 'Action',
        phase: 'Phase 2 — Application Submission & Routing',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: 'secondary-admissions@toddle.school',
        subject: 'New High School Applicant Dossier: {{applicant.name}} (Grade {{applicant.grade}})',
        bodyContent: 'A new secondary school candidate has applied:\nName: {{applicant.name}}\nGrade: {{applicant.grade}}\nCampus: {{applicant.campus}}\n\nDossier URL: https://staff.toddle.school/review/{{applicant.id}}',
        retryPolicy: { enabled: true, maxRetries: 2, retryDelaySeconds: 5, backoff: 'fixed', onFinalFailure: 'ignore' }
      }
    },
    {
      id: 'm2-node-route-primary',
      type: 'action',
      position: { x: 450, y: 1180 },
      data: {
        label: 'Assign to Primary Years Team',
        subtitle: 'Staff Task Notification',
        category: 'Action',
        phase: 'Phase 2 — Application Submission & Routing',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: 'primary-admissions@toddle.school',
        subject: 'New Primary Years Applicant: {{applicant.name}} (Grade {{applicant.grade}})',
        bodyContent: 'A new primary school candidate has applied for Grade {{applicant.grade}}. Please schedule observation slot upon document clearance.',
        retryPolicy: { enabled: true, maxRetries: 2, retryDelaySeconds: 5, backoff: 'fixed', onFinalFailure: 'ignore' }
      }
    },
    {
      id: 'm2-node-route-boarding',
      type: 'action',
      position: { x: 800, y: 1180 },
      data: {
        label: 'Assign to International Boarding Lead',
        subtitle: 'Visa & Residential Handshake',
        category: 'Action',
        phase: 'Phase 2 — Application Submission & Routing',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: 'boarding-desk@toddle.school',
        subject: 'International Boarding Dossier: {{applicant.name}} (Grade {{applicant.grade}})',
        bodyContent: 'International candidate applied. Requires visa eligibility check and dormitory allocation review.',
        retryPolicy: { enabled: true, maxRetries: 2, retryDelaySeconds: 5, backoff: 'fixed', onFinalFailure: 'ignore' }
      }
    }
  ],
  edges: [
    { id: 'm2-e1', source: 'm2-node-trigger', target: 'm2-node-portal-pin', animated: true },
    { id: 'm2-e2', source: 'm2-node-portal-pin', target: 'm2-node-grade-router', animated: true },
    { id: 'm2-e3-sec', source: 'm2-node-grade-router', sourceHandle: 'secondary', target: 'm2-node-route-secondary', label: 'Secondary (Gr 6-12)', animated: true },
    { id: 'm2-e3-pri', source: 'm2-node-grade-router', sourceHandle: 'primary', target: 'm2-node-route-primary', label: 'Primary (Gr K-5)', animated: true },
    { id: 'm2-e3-brd', source: 'm2-node-grade-router', sourceHandle: 'boarding', target: 'm2-node-route-boarding', label: 'Boarding / Overseas', animated: true }
  ]
};

/**
 * Modular Flow 3: Document Verification & SLA Escalation
 */
export const MODULAR_FLOW_3_DOC_VERIFICATION: Workflow = {
  id: 'wf-mod-3-doc-verification',
  name: '3. Phase 3 — Document Verification & SLA Escalation',
  description: 'AI OCR scans uploaded transcripts and age proof. Features a consolidated single-pass rule check and 48h SLA phone outreach escalation.',
  category: 'verification',
  workflowType: 'modular_phase',
  emittedEventOnComplete: 'documents.verified_and_cleared',
  version: 1,
  status: 'published',
  createdAt: '2026-08-20T10:00:00.000Z',
  updatedAt: '2026-08-20T10:00:00.000Z',
  tags: ['Modular Phase', 'Phase 3', 'OCR & Verification'],
  nodes: [
    {
      id: 'm3-node-trigger',
      type: 'trigger',
      position: { x: 350, y: 50 },
      data: {
        label: 'Mandatory Document Bundle Uploaded',
        subtitle: 'Phase 3 Entry Trigger',
        category: 'Trigger',
        phase: 'Phase 3 — Document Verification',
        nodeSubtype: 'docs_uploaded',
        triggerEvent: 'Documents Uploaded',
        formName: 'Mandatory Document & Transcripts Portal 2026',
        description: 'Fires when parent uploads transcripts, age proof, and identification bundle into portal.'
      }
    },
    {
      id: 'm3-node-ocr',
      type: 'action',
      position: { x: 350, y: 400 },
      data: {
        label: 'AI OCR Document Extraction & Pre-Check',
        subtitle: 'Automated OCR Verification',
        category: 'Action',
        phase: 'Phase 3 — Document Verification',
        nodeSubtype: 'ai_ocr_scan',
        actionService: 'ocr_scanner',
        description: 'Scans uploaded PDF/images, validates birth date consistency and extracts previous 2-year GPA scores.',
        retryPolicy: {
          enabled: true,
          maxRetries: 2,
          retryDelaySeconds: 4,
          backoff: 'fixed',
          onFinalFailure: 'route_to_fallback'
        }
      }
    },
    {
      id: 'm3-node-checklist',
      type: 'condition',
      position: { x: 350, y: 760 },
      data: {
        label: 'All Mandatory Documents Complete & Valid?',
        subtitle: 'Single-Pass Verification Rule',
        category: 'Logic',
        phase: 'Phase 3 — Document Verification',
        nodeSubtype: 'boolean_check',
        description: 'Consolidated check verifying Birth Certificate, 2-Year Report Cards, and Guardian Photo ID.',
        documentChecklist: [
          { id: 'doc-birth-cert', name: 'Birth Certificate / Age Proof', mandatory: true, status: 'verified' },
          { id: 'doc-transcripts', name: 'Academic Transcripts (Last 2 Years)', mandatory: true, status: 'verified' },
          { id: 'doc-id-passport', name: 'Parent/Guardian Photo ID', mandatory: true, status: 'verified' }
        ],
        conditionRules: [
          { field: 'applicant.mandatoryDocsValid', operator: 'equals', value: true }
        ],
        branches: [
          { handleId: 'true', label: 'All Docs Clear (YES)', color: '#10B981', description: 'Proceed to assessment scheduling' },
          { handleId: 'false', label: 'Missing / Illegible Docs (NO)', color: '#EF4444', description: 'Escalate to 48h officer outreach' }
        ]
      }
    },
    {
      id: 'm3-node-success-email',
      type: 'action',
      position: { x: 150, y: 1180 },
      data: {
        label: 'Notify Document Clearance Verified',
        subtitle: 'Assessment Clearance',
        category: 'Action',
        phase: 'Phase 3 — Document Verification',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: '{{applicant.email}}',
        subject: 'Document Clearance Confirmed | Next Step: Faculty Interview for {{applicant.name}}',
        bodyContent: 'Dear {{applicant.parentName}},\n\nAll submitted documents for {{applicant.name}} have been verified by our admissions registrar.\n\nYour file has been cleared for the academic assessment and faculty interview.',
        retryPolicy: { enabled: true, maxRetries: 3, retryDelaySeconds: 5, backoff: 'exponential', onFinalFailure: 'route_to_fallback' }
      }
    },
    {
      id: 'm3-node-escalate-human',
      type: 'human',
      position: { x: 550, y: 1180 },
      data: {
        label: '48h SLA Escalation: Officer Calls Parent',
        subtitle: 'Human Recovery Task',
        category: 'Human',
        phase: 'Phase 3 — Document Verification',
        nodeSubtype: 'human_decision',
        humanTaskTitle: '48h SLA Phone Outreach & Document Recovery',
        assignedRole: 'Admissions Officer & Counselor',
        timeoutHours: 48,
        description: 'Admissions officer contacts parent via phone to assist with missing transcript upload.',
        allowedOutcomes: [
          { actionId: 'resolved', label: 'Parent Uploaded Required Docs', variant: 'success', nextStatus: 'Documents Verified' },
          { actionId: 'exception', label: 'Principal Approved Exemption', variant: 'warning', nextStatus: 'Documents Verified' },
          { actionId: 'withdraw', label: 'Mark Application Inactive', variant: 'danger', nextStatus: 'Withdrawn' }
        ]
      }
    }
  ],
  edges: [
    { id: 'm3-e1', source: 'm3-node-trigger', target: 'm3-node-ocr', animated: true },
    { id: 'm3-e2', source: 'm3-node-ocr', target: 'm3-node-checklist', animated: true },
    { id: 'm3-e3-true', source: 'm3-node-checklist', sourceHandle: 'true', target: 'm3-node-success-email', label: 'Docs Clear', animated: true },
    { id: 'm3-e3-false', source: 'm3-node-checklist', sourceHandle: 'false', target: 'm3-node-escalate-human', label: 'Missing Docs', animated: true }
  ]
};

/**
 * Modular Flow 4: Assessment & Faculty Interview
 */
export const MODULAR_FLOW_4_INTERVIEW: Workflow = {
  id: 'wf-mod-4-interview',
  name: '4. Phase 4 — Assessment & Faculty Interview',
  description: 'Synchronizes staff calendar booking, date-anchored 24h WhatsApp reminders, and faculty rubric submission.',
  category: 'interview',
  workflowType: 'modular_phase',
  emittedEventOnComplete: 'interview.completed_and_scored',
  version: 1,
  status: 'published',
  createdAt: '2026-08-20T10:00:00.000Z',
  updatedAt: '2026-08-20T10:00:00.000Z',
  tags: ['Modular Phase', 'Phase 4', 'Faculty Assessment'],
  nodes: [
    {
      id: 'm4-node-trigger',
      type: 'trigger',
      position: { x: 350, y: 50 },
      data: {
        label: 'Qualified for Faculty Assessment',
        subtitle: 'Phase 4 Entry Trigger',
        category: 'Trigger',
        phase: 'Phase 4 — Assessment & Interview',
        nodeSubtype: 'form_submitted',
        triggerEvent: 'Qualified for Interview',
        formName: 'Assessment Eligibility Event',
        description: 'Fires when application passes document verification gate and candidate qualifies for interview.'
      }
    },
    {
      id: 'm4-node-calendar',
      type: 'action',
      position: { x: 350, y: 400 },
      data: {
        label: 'Staff Calendar Sync & Self-Booking Link',
        subtitle: 'Frictionless Slot Booking',
        category: 'Action',
        phase: 'Phase 4 — Assessment & Interview',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: '{{applicant.email}}',
        subject: 'Select Your Admission Interview Slot for {{applicant.name}}',
        bodyContent: 'Dear {{applicant.parentName}},\n\nPlease select an interview slot with our academic faculty for {{applicant.name}} (Grade {{applicant.grade}}):\nhttps://admissions.toddle.school/schedule/{{applicant.id}}\n\nSlots are synchronized live with faculty calendars.',
        retryPolicy: {
          enabled: true,
          maxRetries: 3,
          retryDelaySeconds: 5,
          backoff: 'exponential',
          onFinalFailure: 'route_to_fallback'
        }
      }
    },
    {
      id: 'm4-node-delay',
      type: 'delay',
      position: { x: 350, y: 760 },
      data: {
        label: 'Wait Until 24h Before Interview',
        subtitle: 'Date-Anchored Delay',
        category: 'Control',
        phase: 'Phase 4 — Assessment & Interview',
        nodeSubtype: 'delay_timer',
        delayDuration: 24,
        delayUnit: 'hours',
        delayType: 'date_anchored',
        dateAnchorOffset: '24h_before_interview',
        description: 'Dynamic date-anchored timer pauses workflow until precisely 24 hours prior to the booked slot.'
      }
    },
    {
      id: 'm4-node-whatsapp',
      type: 'action',
      position: { x: 350, y: 1120 },
      data: {
        label: '24h Multi-Channel SMS & WhatsApp Reminder',
        subtitle: 'Zero No-Show Safeguard',
        category: 'Action',
        phase: 'Phase 4 — Assessment & Interview',
        nodeSubtype: 'send_whatsapp',
        actionService: 'whatsapp',
        recipient: '{{applicant.parentPhone}}',
        subject: '24h Assessment Reminder: Tomorrow at Toddle Academy',
        bodyContent: 'Reminder: Assessment interview for {{applicant.name}} is scheduled tomorrow at 10:00 AM. Campus map & check-in QR: https://toddle.school/map',
        retryPolicy: {
          enabled: true,
          maxRetries: 2,
          retryDelaySeconds: 3,
          backoff: 'fixed',
          onFinalFailure: 'ignore'
        }
      }
    },
    {
      id: 'm4-node-rubric',
      type: 'action',
      position: { x: 350, y: 1480 },
      data: {
        label: 'Faculty Conducts Interview & Submits Structured Rubric',
        subtitle: 'Standardized Scoring',
        category: 'Action',
        phase: 'Phase 4 — Assessment & Interview',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: 'faculty-evaluators@toddle.school',
        subject: 'Evaluation Completed: {{applicant.name}} (Grade {{applicant.grade}})',
        bodyContent: 'Faculty assessment complete for {{applicant.name}}. Structured rubric score recorded in student dossier. Dispatched to Admissions Committee.',
        retryPolicy: {
          enabled: true,
          maxRetries: 3,
          retryDelaySeconds: 5,
          backoff: 'exponential',
          onFinalFailure: 'route_to_fallback'
        }
      }
    }
  ],
  edges: [
    { id: 'm4-e1', source: 'm4-node-trigger', target: 'm4-node-calendar', animated: true },
    { id: 'm4-e2', source: 'm4-node-calendar', target: 'm4-node-delay', animated: true },
    { id: 'm4-e3', source: 'm4-node-delay', target: 'm4-node-whatsapp', animated: true },
    { id: 'm4-e4', source: 'm4-node-whatsapp', target: 'm4-node-rubric', animated: true }
  ]
};

/**
 * Modular Flow 5: Committee Evaluation & Human Sign-off
 */
export const MODULAR_FLOW_5_COMMITTEE: Workflow = {
  id: 'wf-mod-5-committee-decision',
  name: '5. Phase 5 — Committee Evaluation & Human Sign-off',
  description: 'Committee reviews evaluation rubric and selects outcome (Admit, Waitlist, Conditional, Decline). Generates official decision notification.',
  category: 'admission',
  workflowType: 'modular_phase',
  emittedEventOnComplete: 'decision.recorded',
  version: 1,
  status: 'published',
  createdAt: '2026-08-20T10:00:00.000Z',
  updatedAt: '2026-08-20T10:00:00.000Z',
  tags: ['Modular Phase', 'Phase 5', 'Committee & Decision'],
  nodes: [
    {
      id: 'm5-node-trigger',
      type: 'trigger',
      position: { x: 350, y: 50 },
      data: {
        label: 'Interview Rubric Submitted',
        subtitle: 'Phase 5 Entry Trigger',
        category: 'Trigger',
        phase: 'Phase 5 — Committee Decision',
        nodeSubtype: 'form_submitted',
        triggerEvent: 'Interview Complete',
        formName: 'Faculty Assessment Rubric Submission',
        description: 'Fires as soon as faculty evaluator submits final interview score and feedback notes.'
      }
    },
    {
      id: 'm5-node-human-committee',
      type: 'human',
      position: { x: 350, y: 400 },
      data: {
        label: 'Admissions Committee Decision Gate',
        subtitle: 'Human Rubric Sign-off',
        category: 'Human',
        phase: 'Phase 5 — Committee Decision',
        nodeSubtype: 'human_decision',
        humanTaskTitle: 'Review Holistic Evaluation Rubric & Determine Outcome',
        assignedRole: 'Admissions Committee & Academic Head',
        timeoutHours: 72,
        description: 'Committee reviews transcripts, rubric scores, and campus capacity before choosing official outcome.',
        allowedOutcomes: [
          { actionId: 'admit', label: 'Admit Candidate', variant: 'success', nextStatus: 'Offered' },
          { actionId: 'conditional', label: 'Conditional Offer', variant: 'info', nextStatus: 'Conditional Offer' },
          { actionId: 'waitlist', label: 'Place on Waitlist', variant: 'warning', nextStatus: 'Waitlisted' },
          { actionId: 'decline', label: 'Decline Application', variant: 'danger', nextStatus: 'Declined' }
        ]
      }
    },
    {
      id: 'm5-node-offer-action',
      type: 'action',
      position: { x: 100, y: 820 },
      data: {
        label: 'Issue Formal Offer of Admission',
        subtitle: 'Direct Offer Notification',
        category: 'Action',
        phase: 'Phase 5 — Committee Decision',
        nodeSubtype: 'generate_offer_pdf',
        actionService: 'pdf_generator',
        recipient: '{{applicant.email}}',
        subject: 'Congratulations! Official Offer of Admission to Toddle Academy for {{applicant.name}}',
        bodyContent: 'Dear {{applicant.parentName}},\n\nOn behalf of the Admissions Committee, we are thrilled to offer {{applicant.name}} admission to Grade {{applicant.grade}} at Toddle Academy!',
        retryPolicy: { enabled: true, maxRetries: 3, retryDelaySeconds: 5, backoff: 'exponential', onFinalFailure: 'route_to_fallback' }
      }
    },
    {
      id: 'm5-node-waitlist-action',
      type: 'action',
      position: { x: 450, y: 820 },
      data: {
        label: 'Notify Waitlist Placement & Rank',
        subtitle: 'Waitlist Notification',
        category: 'Action',
        phase: 'Phase 5 — Committee Decision',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: '{{applicant.email}}',
        subject: 'Toddle Academy Admission Update: Waitlist Placement for {{applicant.name}}',
        bodyContent: 'Dear {{applicant.parentName}},\n\nThank you for completing the interview for {{applicant.name}}. While academically qualified, our Grade {{applicant.grade}} cohort is currently at capacity. {{applicant.name}} has been placed on our priority waitlist.',
        retryPolicy: { enabled: true, maxRetries: 2, retryDelaySeconds: 5, backoff: 'fixed', onFinalFailure: 'ignore' }
      }
    },
    {
      id: 'm5-node-decline-action',
      type: 'action',
      position: { x: 800, y: 820 },
      data: {
        label: 'Send Empathetic Regret Notice',
        subtitle: 'Decline Notification',
        category: 'Action',
        phase: 'Phase 5 — Committee Decision',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: '{{applicant.email}}',
        subject: 'Toddle Academy Admissions Decision regarding {{applicant.name}}',
        bodyContent: 'Dear {{applicant.parentName}},\n\nThank you for your interest in Toddle Academy. Due to high competition, we are unable to offer admission to {{applicant.name}} for the upcoming academic year.',
        retryPolicy: { enabled: true, maxRetries: 2, retryDelaySeconds: 5, backoff: 'fixed', onFinalFailure: 'ignore' }
      }
    }
  ],
  edges: [
    { id: 'm5-e1', source: 'm5-node-trigger', target: 'm5-node-human-committee', animated: true },
    { id: 'm5-e2-admit', source: 'm5-node-human-committee', sourceHandle: 'admit', target: 'm5-node-offer-action', label: 'Admitted', animated: true },
    { id: 'm5-e2-cond', source: 'm5-node-human-committee', sourceHandle: 'conditional', target: 'm5-node-offer-action', label: 'Conditional', animated: true },
    { id: 'm5-e2-wait', source: 'm5-node-human-committee', sourceHandle: 'waitlist', target: 'm5-node-waitlist-action', label: 'Waitlist', animated: true },
    { id: 'm5-e2-dec', source: 'm5-node-human-committee', sourceHandle: 'decline', target: 'm5-node-decline-action', label: 'Decline', animated: true }
  ]
};

/**
 * Modular Flow 6: Waitlist Promotion & Capacity Management (NEW)
 */
export const MODULAR_FLOW_6_WAITLIST_PROMOTION: Workflow = {
  id: 'wf-mod-6-waitlist-promotion',
  name: '6. Phase 6 — Waitlist Promotion & Capacity Management',
  description: 'Triggered when an admitted seat opens up due to withdrawal or offer expiry. Evaluates waitlist priority rank and issues an expedited 48h offer.',
  category: 'waitlist',
  workflowType: 'modular_phase',
  emittedEventOnComplete: 'waitlist.promoted_and_offered',
  version: 1,
  status: 'published',
  createdAt: '2026-08-20T10:00:00.000Z',
  updatedAt: '2026-08-20T10:00:00.000Z',
  tags: ['Modular Phase', 'Phase 6', 'Waitlist & Capacity'],
  nodes: [
    {
      id: 'm6-node-trigger',
      type: 'trigger',
      position: { x: 350, y: 50 },
      data: {
        label: 'Waitlist Seat Capacity Available Event',
        subtitle: 'Phase 6 Entry Trigger',
        category: 'Trigger',
        phase: 'Phase 6 — Waitlist Promotion',
        nodeSubtype: 'seat_available',
        triggerEvent: 'Seat Capacity Available',
        formName: 'Auto-Promotion Capacity Event Handler',
        description: 'Fires when an enrolled student relocates or an admitted offer expires after 7 days.'
      }
    },
    {
      id: 'm6-node-rank-check',
      type: 'condition',
      position: { x: 350, y: 400 },
      data: {
        label: 'Waitlist Priority Rank Evaluation',
        subtitle: 'Merit & Sibling Preference',
        category: 'Logic',
        phase: 'Phase 6 — Waitlist Promotion',
        nodeSubtype: 'boolean_check',
        description: 'Verifies if candidate is Rank #1 on the active Grade queue.',
        conditionRules: [
          { field: 'applicant.waitlistRank', operator: 'equals', value: 1 }
        ],
        branches: [
          { handleId: 'rank_one', label: 'Rank #1 Candidate (Promote)', color: '#10B981', description: 'Immediate auto-promotion' },
          { handleId: 'rank_other', label: 'Rank #2+ (Keep Active)', color: '#64748B', description: 'Maintain queue order' }
        ]
      }
    },
    {
      id: 'm6-node-urgent-offer',
      type: 'action',
      position: { x: 150, y: 760 },
      data: {
        label: 'Expedited 48h Seat Offer Dispatched',
        subtitle: 'Urgent Seat Release',
        category: 'Action',
        phase: 'Phase 6 — Waitlist Promotion',
        nodeSubtype: 'generate_offer_pdf',
        actionService: 'pdf_generator',
        recipient: '{{applicant.email}}',
        subject: 'GREAT NEWS: Seat Available! Expedited Offer for {{applicant.name}}',
        bodyContent: 'Dear {{applicant.parentName}},\n\nA seat has opened up for Grade {{applicant.grade}} at Toddle Academy!\n\nAs our #1 waitlisted candidate, {{applicant.name}} has been promoted to full admission. Please secure your seat within 48 hours: https://admissions.toddle.school/offers/{{applicant.id}}',
        retryPolicy: { enabled: true, maxRetries: 3, retryDelaySeconds: 5, backoff: 'exponential', onFinalFailure: 'route_to_fallback' }
      }
    },
    {
      id: 'm6-node-sms-alert',
      type: 'action',
      position: { x: 150, y: 1120 },
      data: {
        label: 'Urgent WhatsApp Alert: 48h Window to Accept',
        subtitle: 'Instant Multi-Channel Alert',
        category: 'Action',
        phase: 'Phase 6 — Waitlist Promotion',
        nodeSubtype: 'send_whatsapp',
        actionService: 'whatsapp',
        recipient: '{{applicant.parentPhone}}',
        subject: 'URGENT: Toddle Academy Seat Offer Released',
        bodyContent: 'Seat Open! Offer of Admission issued for {{applicant.name}}. 48-hour acceptance window expires Friday at 5:00 PM: https://admissions.toddle.school/offers/{{applicant.id}}',
        retryPolicy: { enabled: true, maxRetries: 2, retryDelaySeconds: 3, backoff: 'fixed', onFinalFailure: 'ignore' }
      }
    },
    {
      id: 'm6-node-maintain-queue',
      type: 'action',
      position: { x: 550, y: 760 },
      data: {
        label: 'Send Monthly Queue Status Update',
        subtitle: 'Waitlist Nurture',
        category: 'Action',
        phase: 'Phase 6 — Waitlist Promotion',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: '{{applicant.email}}',
        subject: 'Toddle Academy Waitlist Status Update for {{applicant.name}}',
        bodyContent: 'Dear {{applicant.parentName}},\n\n{{applicant.name}} remains actively considered on our Grade {{applicant.grade}} waitlist. We will notify you immediately if additional capacity becomes available.',
        retryPolicy: { enabled: true, maxRetries: 2, retryDelaySeconds: 5, backoff: 'fixed', onFinalFailure: 'ignore' }
      }
    }
  ],
  edges: [
    { id: 'm6-e1', source: 'm6-node-trigger', target: 'm6-node-rank-check', animated: true },
    { id: 'm6-e2-r1', source: 'm6-node-rank-check', sourceHandle: 'rank_one', target: 'm6-node-urgent-offer', label: 'Rank #1 Promoted', animated: true },
    { id: 'm6-e2-other', source: 'm6-node-rank-check', sourceHandle: 'rank_other', target: 'm6-node-maintain-queue', label: 'Rank #2+ Kept Active', animated: true },
    { id: 'm6-e3', source: 'm6-node-urgent-offer', target: 'm6-node-sms-alert', animated: true }
  ]
};

/**
 * Modular Flow 7: Offer Letter & Persistent Fee Goal Loop
 */
export const MODULAR_FLOW_7_OFFER_FEE_GOAL: Workflow = {
  id: 'wf-mod-7-offer-fee-goal',
  name: '7. Phase 7 — Offer Letter & Persistent Fee Goal',
  description: 'Dispatches digital PDF offer letter and initiates a persistent 24h polling loop (max 7 days) with offline bank wire bypass support.',
  category: 'fee_collection',
  workflowType: 'modular_phase',
  emittedEventOnComplete: 'fee.settled_and_confirmed',
  version: 1,
  status: 'published',
  createdAt: '2026-08-20T10:00:00.000Z',
  updatedAt: '2026-08-20T10:00:00.000Z',
  tags: ['Modular Phase', 'Phase 7', 'Fee Goal Loop'],
  nodes: [
    {
      id: 'm7-node-trigger',
      type: 'trigger',
      position: { x: 350, y: 50 },
      data: {
        label: 'Official Admission Offer Issued',
        subtitle: 'Phase 7 Entry Trigger',
        category: 'Trigger',
        phase: 'Phase 7 — Offer & Fee Reminders',
        nodeSubtype: 'form_submitted',
        triggerEvent: 'Offer Issued',
        formName: 'Admission Offer Dispatched Webhook',
        description: 'Triggered when committee decision outputs an unconditional or conditional offer.'
      }
    },
    {
      id: 'm7-node-offer-pdf',
      type: 'action',
      position: { x: 350, y: 400 },
      data: {
        label: 'Generate Digital Offer PDF & Secure Payment Link',
        subtitle: 'Digital Offer Pack',
        category: 'Action',
        phase: 'Phase 7 — Offer & Fee Reminders',
        nodeSubtype: 'generate_offer_pdf',
        actionService: 'pdf_generator',
        recipient: '{{applicant.email}}',
        subject: 'Official Offer of Admission — Toddle Academy (Ref: {{applicant.id}})',
        bodyContent: 'Dear {{applicant.parentName}},\n\nCongratulations! We are thrilled to offer {{applicant.name}} admission into Grade {{applicant.grade}}.\n\nReview your digital acceptance contract and complete seat deposit: https://admissions.toddle.school/offers/{{applicant.id}}',
        retryPolicy: { enabled: true, maxRetries: 3, retryDelaySeconds: 5, backoff: 'exponential', onFinalFailure: 'route_to_fallback' }
      }
    },
    {
      id: 'm7-node-goal-fee',
      type: 'goal',
      position: { x: 350, y: 760 },
      data: {
        label: 'Goal: Admission Fee Paid within 7 Days',
        subtitle: 'Persistent Polling Objective',
        category: 'Persistent Goal',
        phase: 'Phase 7 — Offer & Fee Reminders',
        nodeSubtype: 'persistent_goal',
        goalTargetMetric: 'fee_paid',
        goalCheckIntervalHours: 24,
        goalMaxAttempts: 7,
        goalSuccessBehavior: 'continue_workflow',
        goalTimeoutBehavior: 'set_offer_expired',
        goalFastTrackBypass: true,
        description: 'Persistent loop checking ledger every 24h. Manual bank wire bypass instantly clears this goal.'
      }
    },
    {
      id: 'm7-node-paid-success',
      type: 'action',
      position: { x: 150, y: 1180 },
      data: {
        label: 'Payment Confirmed & Seat Locked Receipt',
        subtitle: 'Enrollment Confirmed',
        category: 'Action',
        phase: 'Phase 7 — Offer & Fee Reminders',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: '{{applicant.email}}',
        subject: 'Seat Confirmed! Enrollment Deposit Received for {{applicant.name}}',
        bodyContent: 'Dear {{applicant.parentName}},\n\nYour enrollment deposit of $2,500 has been verified! {{applicant.name}}\'s seat in Grade {{applicant.grade}} is locked.',
        retryPolicy: { enabled: true, maxRetries: 3, retryDelaySeconds: 5, backoff: 'exponential', onFinalFailure: 'route_to_fallback' }
      }
    },
    {
      id: 'm7-node-expired-escalate',
      type: 'action',
      position: { x: 550, y: 1180 },
      data: {
        label: 'Offer Expired & Capacity Reclaimed',
        subtitle: '7-Day Deadline Elapsed',
        category: 'Action',
        phase: 'Phase 7 — Offer & Fee Reminders',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: 'bursar@toddle.school',
        subject: 'Offer Expired: Reclaiming Grade {{applicant.grade}} Seat for {{applicant.name}}',
        bodyContent: 'Candidate {{applicant.name}} did not deposit within the 7-day window. Seat capacity released to waitlist engine.',
        retryPolicy: { enabled: true, maxRetries: 2, retryDelaySeconds: 5, backoff: 'fixed', onFinalFailure: 'ignore' }
      }
    }
  ],
  edges: [
    { id: 'm7-e1', source: 'm7-node-trigger', target: 'm7-node-offer-pdf', animated: true },
    { id: 'm7-e2', source: 'm7-node-offer-pdf', target: 'm7-node-goal-fee', animated: true },
    { id: 'm7-e3-paid', source: 'm7-node-goal-fee', sourceHandle: 'success', target: 'm7-node-paid-success', label: 'Deposit Paid', animated: true },
    { id: 'm7-e3-expired', source: 'm7-node-goal-fee', sourceHandle: 'timeout', target: 'm7-node-expired-escalate', label: '7 Days Expired', animated: true }
  ]
};

/**
 * Modular Flow 8: Post-Offer Acceptance & Onboarding (NEW)
 */
export const MODULAR_FLOW_8_POST_OFFER_ONBOARDING: Workflow = {
  id: 'wf-mod-8-post-offer-onboarding',
  name: '8. Phase 8 — Post-Offer Acceptance & Onboarding',
  description: 'Collects student medical history, dietary allergies, and bus transport routing requests prior to institutional SIS handover.',
  category: 'onboarding',
  workflowType: 'modular_phase',
  emittedEventOnComplete: 'onboarding.forms_completed',
  version: 1,
  status: 'published',
  createdAt: '2026-08-20T10:00:00.000Z',
  updatedAt: '2026-08-20T10:00:00.000Z',
  tags: ['Modular Phase', 'Phase 8', 'Medical & Transport Onboarding'],
  nodes: [
    {
      id: 'm8-node-trigger',
      type: 'trigger',
      position: { x: 350, y: 50 },
      data: {
        label: 'Deposit Confirmed & Onboarding Started',
        subtitle: 'Phase 8 Entry Trigger',
        category: 'Trigger',
        phase: 'Phase 8 — Post-Offer Onboarding',
        nodeSubtype: 'form_submitted',
        triggerEvent: 'Deposit Confirmed',
        formName: 'Onboarding Initialization Webhook',
        description: 'Fires immediately upon fee confirmation to begin student logistics configuration.'
      }
    },
    {
      id: 'm8-node-onboarding-forms',
      type: 'action',
      position: { x: 350, y: 400 },
      data: {
        label: 'Send Medical & Bus Transport Intake Portal',
        subtitle: 'Student Logistics Intake',
        category: 'Action',
        phase: 'Phase 8 — Post-Offer Onboarding',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: '{{applicant.email}}',
        subject: 'Student Onboarding: Complete Medical History & Bus Transport Request for {{applicant.name}}',
        bodyContent: 'Dear {{applicant.parentName}},\n\nWelcome to Toddle Academy! To prepare {{applicant.name}}\'s first day, please complete:\n1. Medical & Allergy Declaration\n2. School Bus Transport Route Selection\n3. Uniform Size Fitting Guide\n\nLink: https://admissions.toddle.school/onboarding/{{applicant.id}}',
        retryPolicy: { enabled: true, maxRetries: 3, retryDelaySeconds: 5, backoff: 'exponential', onFinalFailure: 'route_to_fallback' }
      }
    },
    {
      id: 'm8-node-medical-check',
      type: 'condition',
      position: { x: 350, y: 760 },
      data: {
        label: 'Severe Allergy / Medical Alert Flagged?',
        subtitle: 'Health Safety Protocol',
        category: 'Logic',
        phase: 'Phase 8 — Post-Offer Onboarding',
        nodeSubtype: 'boolean_check',
        description: 'Checks if parent reported severe asthma, peanut allergy, or EpiPen requirement.',
        conditionRules: [
          { field: 'applicant.hasMedicalAlert', operator: 'equals', value: true }
        ],
        branches: [
          { handleId: 'medical_flag', label: 'Medical Alert (Alert Nurse)', color: '#F43F5E', description: 'Send priority alert to School Clinic' },
          { handleId: 'medical_clear', label: 'Standard Health Profile', color: '#10B981', description: 'Standard health record' }
        ]
      }
    },
    {
      id: 'm8-node-alert-nurse',
      type: 'action',
      position: { x: 150, y: 1180 },
      data: {
        label: 'Dispatch Priority Alert to School Health Clinic',
        subtitle: 'Medical Safety Handover',
        category: 'Action',
        phase: 'Phase 8 — Post-Offer Onboarding',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: 'nurse-station@toddle.school',
        subject: 'PRIORITY MEDICAL ALERT: New Enrollee {{applicant.name}} (Grade {{applicant.grade}})',
        bodyContent: 'School Nurse Notice: Newly enrolled student {{applicant.name}} has a flagged medical requirement. Dietary plan and emergency action protocol initiated.',
        retryPolicy: { enabled: true, maxRetries: 3, retryDelaySeconds: 5, backoff: 'exponential', onFinalFailure: 'route_to_fallback' }
      }
    },
    {
      id: 'm8-node-transport-sync',
      type: 'action',
      position: { x: 550, y: 1180 },
      data: {
        label: 'Assign Bus Route & Issue Parent Transport Pass',
        subtitle: 'Transportation Setup',
        category: 'Action',
        phase: 'Phase 8 — Post-Offer Onboarding',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: '{{applicant.email}}',
        subject: 'Toddle Academy School Bus Route & Morning Pick-Up Stop Assigned',
        bodyContent: 'Dear {{applicant.parentName}},\n\n{{applicant.name}}\'s bus pass has been assigned to Route #4 (North Valley Express). Pick-up scheduled at 7:42 AM at Maple Street Stop.',
        retryPolicy: { enabled: true, maxRetries: 3, retryDelaySeconds: 5, backoff: 'exponential', onFinalFailure: 'route_to_fallback' }
      }
    }
  ],
  edges: [
    { id: 'm8-e1', source: 'm8-node-trigger', target: 'm8-node-onboarding-forms', animated: true },
    { id: 'm8-e2', source: 'm8-node-onboarding-forms', target: 'm8-node-medical-check', animated: true },
    { id: 'm8-e3-med', source: 'm8-node-medical-check', sourceHandle: 'medical_flag', target: 'm8-node-alert-nurse', label: 'Medical Alert', animated: true },
    { id: 'm8-e3-std', source: 'm8-node-medical-check', sourceHandle: 'medical_clear', target: 'm8-node-transport-sync', label: 'Standard', animated: true },
    { id: 'm8-e4-nurse-to-trans', source: 'm8-node-alert-nurse', target: 'm8-node-transport-sync', animated: true }
  ]
};

/**
 * Modular Flow 9: SIS/LMS Handover & Provisioning
 */
export const MODULAR_FLOW_9_SIS_PROVISIONING: Workflow = {
  id: 'wf-mod-9-sis-provisioning',
  name: '9. Phase 9 — SIS/LMS Handover & Provisioning',
  description: 'Enterprise REST sync to PowerSchool / Core SIS. Provisions student LMS accounts, assigns homeroom teacher, and issues welcome kit.',
  category: 'sis_integration',
  workflowType: 'modular_phase',
  emittedEventOnComplete: 'student.active_enrolled_and_provisioned',
  version: 1,
  status: 'published',
  createdAt: '2026-08-20T10:00:00.000Z',
  updatedAt: '2026-08-20T10:00:00.000Z',
  tags: ['Modular Phase', 'Phase 9', 'Enterprise SIS Handover'],
  nodes: [
    {
      id: 'm9-node-trigger',
      type: 'trigger',
      position: { x: 350, y: 50 },
      data: {
        label: 'Onboarding Checklist Completed Webhook',
        subtitle: 'Phase 9 Entry Trigger',
        category: 'Trigger',
        phase: 'Phase 9 — LMS & SIS Handover',
        nodeSubtype: 'form_submitted',
        triggerEvent: 'Onboarding Complete',
        formName: 'Onboarding Clearance Event',
        description: 'Triggered when all student medical, transport, and financial steps are satisfied.'
      }
    },
    {
      id: 'm9-node-sis-sync',
      type: 'action',
      position: { x: 350, y: 400 },
      data: {
        label: 'Sync Student & Family Profile to SIS / PowerSchool ERP',
        subtitle: 'Enterprise SIS Handshake',
        category: 'Action',
        phase: 'Phase 9 — LMS & SIS Handover',
        nodeSubtype: 'sync_sis',
        actionService: 'sis_sync',
        sisSystemName: 'Toddle Core SIS / PowerSchool ERP',
        sisEndpoint: 'https://api.toddleschool.com/v1/sis/students',
        description: 'Transfers fully validated applicant record into core School Information System.',
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
    {
      id: 'm9-node-provision',
      type: 'system',
      position: { x: 350, y: 760 },
      data: {
        label: 'Provision LMS Credentials, Timetable & Homeroom Teacher',
        subtitle: 'Terminal State — Student Active Enrolled',
        category: 'System / SIS',
        phase: 'Phase 9 — LMS & SIS Handover',
        nodeSubtype: 'system_task',
        sisEndpoint: 'https://api.toddleschool.com/v1/provisioning',
        bodyContent: 'Provision student LMS credentials, assign homeroom teacher, generate student ID card, and schedule first day timetable.',
        description: 'Provisions student portal, assigns homeroom teacher, sends orientation invite, and cancels all reminders.'
      }
    },
    {
      id: 'm9-node-welcome-kit',
      type: 'action',
      position: { x: 350, y: 1120 },
      data: {
        label: 'Dispatch First Day Welcome Kit & Uniform Guide',
        subtitle: 'Orientation Pack',
        category: 'Action',
        phase: 'Phase 9 — LMS & SIS Handover',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: '{{applicant.email}}',
        subject: 'Welcome to the Toddle Family! Your First Day Guide & Uniform Details',
        bodyContent: 'Dear {{applicant.parentName}},\n\n{{applicant.name}}\'s student account is live! Homeroom Teacher: Mr. David Miller (Room 204).\n\nFirst Day Orientation: August 28th at 9:00 AM. See you on campus!',
        retryPolicy: { enabled: true, maxRetries: 3, retryDelaySeconds: 5, backoff: 'exponential', onFinalFailure: 'route_to_fallback' }
      }
    }
  ],
  edges: [
    { id: 'm9-e1', source: 'm9-node-trigger', target: 'm9-node-sis-sync', animated: true },
    { id: 'm9-e2', source: 'm9-node-sis-sync', target: 'm9-node-provision', animated: true },
    { id: 'm9-e3', source: 'm9-node-provision', target: 'm9-node-welcome-kit', animated: true }
  ]
};

// ============================================================================
// EDGE CASES & CUSTOMIZABLE SCHOOL SUB-FLOWCHARTS / TEMPLATES
// ============================================================================

/**
 * Edge Case 1: No-Interview Direct Admission Track (Early Years / Sibling Fast-Track)
 * Rationale: For Kindergarten, Nursery, or verified legacy sibling applicants where faculty interviews are not conducted.
 */
export const NO_INTERVIEW_FAST_TRACK_WORKFLOW: Workflow = {
  id: 'wf-edge-no-interview-direct',
  name: '🎯 No-Interview Direct Track (Early Years & Sibling Fast-Track)',
  description: 'Customizable edge case for schools with no faculty interview process. Automatically moves from Document Clearance directly to Instant Offer PDF.',
  category: 'custom',
  workflowType: 'sub_scenario',
  version: 1,
  status: 'published',
  createdAt: '2026-08-20T10:00:00.000Z',
  updatedAt: '2026-08-20T10:00:00.000Z',
  tags: ['Edge Case', 'No Interview', 'Early Years', 'Sibling Fast-Track'],
  nodes: [
    {
      id: 'ni-node-1',
      type: 'trigger',
      position: { x: 350, y: 50 },
      data: {
        label: 'Early Years / Sibling Application Submitted',
        subtitle: 'Entry Trigger',
        category: 'Trigger',
        phase: 'Phase 1 — Direct Application',
        nodeSubtype: 'form_submitted',
        triggerEvent: 'Application Submitted',
        formName: 'Direct Admission Form (No Interview Required)',
        description: 'Ingests applicant profile for grades with waived interview requirements.'
      }
    },
    {
      id: 'ni-node-2',
      type: 'action',
      position: { x: 350, y: 400 },
      data: {
        label: 'AI OCR Age Proof & Immunization Scan',
        subtitle: 'Automated Health & Age Check',
        category: 'Action',
        phase: 'Phase 2 — Verification',
        nodeSubtype: 'ai_ocr_scan',
        actionService: 'ocr_scanner',
        description: 'Validates birth certificate and mandatory immunization records.'
      }
    },
    {
      id: 'ni-node-3',
      type: 'condition',
      position: { x: 350, y: 760 },
      data: {
        label: 'Age Eligibility & Sibling Verification',
        subtitle: 'Automated Clearance Rule',
        category: 'Logic',
        phase: 'Phase 3 — Rule Check',
        nodeSubtype: 'boolean_check',
        description: 'Bypasses interview when student meets age threshold and sibling status is verified.',
        conditionRules: [
          { field: 'applicant.ageEligible', operator: 'equals', value: true }
        ],
        branches: [
          { handleId: 'eligible', label: 'Eligible (Direct Offer)', color: '#10B981', description: 'Issue instant offer' },
          { handleId: 'manual', label: 'Requires Manual Check', color: '#F59E0B', description: 'Registrar review' }
        ]
      }
    },
    {
      id: 'ni-node-4',
      type: 'action',
      position: { x: 150, y: 1180 },
      data: {
        label: 'Generate Instant Digital Offer Letter PDF',
        subtitle: 'Direct Offer Dispatched',
        category: 'Action',
        phase: 'Phase 4 — Direct Offer',
        nodeSubtype: 'generate_offer_pdf',
        actionService: 'pdf_generator',
        recipient: '{{applicant.email}}',
        subject: 'Direct Offer of Admission — Toddle Early Learning Academy',
        bodyContent: 'Dear {{applicant.parentName}},\n\nWe are pleased to offer {{applicant.name}} direct admission to our Early Years program at Toddle Academy!',
        retryPolicy: { enabled: true, maxRetries: 3, retryDelaySeconds: 5, backoff: 'exponential', onFinalFailure: 'route_to_fallback' }
      }
    },
    {
      id: 'ni-node-5',
      type: 'goal',
      position: { x: 150, y: 1540 },
      data: {
        label: 'Goal: Tuition Deposit Paid (7-Day Loop)',
        subtitle: 'Persistent Fee Objective',
        category: 'Persistent Goal',
        phase: 'Phase 5 — Fee Confirmation',
        nodeSubtype: 'persistent_goal',
        goalTargetMetric: 'fee_paid',
        goalCheckIntervalHours: 24,
        goalMaxAttempts: 7,
        goalFastTrackBypass: true,
        description: 'Monitors deposit settlement with offline wire transfer bypass.'
      }
    }
  ],
  edges: [
    { id: 'ni-e1', source: 'ni-node-1', target: 'ni-node-2', animated: true },
    { id: 'ni-e2', source: 'ni-node-2', target: 'ni-node-3', animated: true },
    { id: 'ni-e3-ok', source: 'ni-node-3', sourceHandle: 'eligible', target: 'ni-node-4', label: 'Direct Offer', animated: true },
    { id: 'ni-e4', source: 'ni-node-4', target: 'ni-node-5', animated: true }
  ]
};

/**
 * Edge Case 2: Merit Scholarship & Bursary Assessment Track
 * Rationale: For candidates applying for 25%, 50%, or 100% merit or athletic grants.
 */
export const MERIT_SCHOLARSHIP_WORKFLOW: Workflow = {
  id: 'wf-edge-merit-scholarship',
  name: '🎓 Merit Scholarship & Financial Aid Evaluation Track',
  description: 'Specialized workflow for evaluating candidate academic & athletic portfolios with multi-tier scholarship grant branching (100%, 50%, Standard).',
  category: 'custom',
  workflowType: 'sub_scenario',
  version: 1,
  status: 'published',
  createdAt: '2026-08-20T10:00:00.000Z',
  updatedAt: '2026-08-20T10:00:00.000Z',
  tags: ['Edge Case', 'Scholarship', 'Financial Aid', 'Bursary'],
  nodes: [
    {
      id: 'ms-node-1',
      type: 'trigger',
      position: { x: 350, y: 50 },
      data: {
        label: 'Scholarship & Portfolio Application Ingested',
        subtitle: 'Entry Trigger',
        category: 'Trigger',
        phase: 'Phase 1 — Scholarship Intake',
        nodeSubtype: 'form_submitted',
        triggerEvent: 'Scholarship Application',
        formName: 'Toddle Academic & Athletic Excellence Grant 2026',
        description: 'Candidate submits standardized test scores, portfolio, and recommendation letters.'
      }
    },
    {
      id: 'ms-node-2',
      type: 'action',
      position: { x: 350, y: 400 },
      data: {
        label: 'AI Merit Score Benchmark & GPA Calculation',
        subtitle: 'Automated Pre-Screening',
        category: 'Action',
        phase: 'Phase 2 — Merit Benchmarking',
        nodeSubtype: 'ai_ocr_scan',
        actionService: 'ocr_scanner',
        description: 'Extracts SAT/SSAT percentiles and validates minimum 3.85 GPA requirement.'
      }
    },
    {
      id: 'ms-node-3',
      type: 'human',
      position: { x: 350, y: 760 },
      data: {
        label: 'Scholarship Committee Panel Review',
        subtitle: 'Human Review Gate',
        category: 'Human',
        phase: 'Phase 3 — Committee Deliberation',
        nodeSubtype: 'human_decision',
        humanTaskTitle: 'Merit Scholarship Panel Evaluation',
        assignedRole: 'Scholarship Committee & Bursar',
        timeoutHours: 48,
        description: 'Committee awards tuition grant based on academic merit and available endowment funds.',
        allowedOutcomes: [
          { actionId: 'scholarship_100', label: 'Full 100% Merit Award', variant: 'success', nextStatus: '100% Scholarship' },
          { actionId: 'scholarship_50', label: 'Partial 50% Tuition Grant', variant: 'info', nextStatus: '50% Scholarship' },
          { actionId: 'standard_admission', label: 'Standard Full-Fee Offer', variant: 'warning', nextStatus: 'Standard Offer' }
        ]
      }
    },
    {
      id: 'ms-node-offer-100',
      type: 'action',
      position: { x: 100, y: 1180 },
      data: {
        label: 'Issue 100% Full Scholarship Award Letter',
        subtitle: '100% Tuition Grant',
        category: 'Action',
        phase: 'Phase 4 — Award Offer',
        nodeSubtype: 'generate_offer_pdf',
        actionService: 'pdf_generator',
        recipient: '{{applicant.email}}',
        subject: 'CONGRATULATIONS: 100% Merit Scholarship Awarded — Toddle Academy',
        bodyContent: 'Dear {{applicant.parentName}},\n\nWe are thrilled to award {{applicant.name}} the prestigious 100% Toddle Global Scholars Merit Award!',
        retryPolicy: { enabled: true, maxRetries: 3, retryDelaySeconds: 5, backoff: 'exponential', onFinalFailure: 'route_to_fallback' }
      }
    },
    {
      id: 'ms-node-offer-50',
      type: 'action',
      position: { x: 450, y: 1180 },
      data: {
        label: 'Issue 50% Partial Tuition Grant Letter',
        subtitle: '50% Tuition Grant',
        category: 'Action',
        phase: 'Phase 4 — Award Offer',
        nodeSubtype: 'generate_offer_pdf',
        actionService: 'pdf_generator',
        recipient: '{{applicant.email}}',
        subject: '50% Academic Grant Awarded — Toddle Academy',
        bodyContent: 'Dear {{applicant.parentName}},\n\nWe are pleased to award {{applicant.name}} a 50% tuition reduction grant for Grade {{applicant.grade}}.',
        retryPolicy: { enabled: true, maxRetries: 3, retryDelaySeconds: 5, backoff: 'exponential', onFinalFailure: 'route_to_fallback' }
      }
    },
    {
      id: 'ms-node-offer-std',
      type: 'action',
      position: { x: 800, y: 1180 },
      data: {
        label: 'Issue Standard Full-Fee Offer Letter',
        subtitle: 'Standard Admission',
        category: 'Action',
        phase: 'Phase 4 — Standard Offer',
        nodeSubtype: 'generate_offer_pdf',
        actionService: 'pdf_generator',
        recipient: '{{applicant.email}}',
        subject: 'Offer of Admission — Toddle Academy',
        bodyContent: 'Dear {{applicant.parentName}},\n\nWhile scholarship funds were limited, we are delighted to offer {{applicant.name}} standard admission to Grade {{applicant.grade}}.',
        retryPolicy: { enabled: true, maxRetries: 3, retryDelaySeconds: 5, backoff: 'exponential', onFinalFailure: 'route_to_fallback' }
      }
    }
  ],
  edges: [
    { id: 'ms-e1', source: 'ms-node-1', target: 'ms-node-2', animated: true },
    { id: 'ms-e2', source: 'ms-node-2', target: 'ms-node-3', animated: true },
    { id: 'ms-e3-100', source: 'ms-node-3', sourceHandle: 'scholarship_100', target: 'ms-node-offer-100', label: '100% Award', animated: true },
    { id: 'ms-e3-50', source: 'ms-node-3', sourceHandle: 'scholarship_50', target: 'ms-node-offer-50', label: '50% Grant', animated: true },
    { id: 'ms-e3-std', source: 'ms-node-3', sourceHandle: 'standard_admission', target: 'ms-node-offer-std', label: 'Standard Fee', animated: true }
  ]
};

/**
 * Edge Case 3: Waitlist Auto-Promotion & Seat Capacity Reclaim Track
 */
export const WAITLIST_CAPACITY_MANAGEMENT_WORKFLOW: Workflow = {
  id: 'wf-edge-waitlist-reclaim',
  name: '⚡ Waitlist Auto-Promotion & Seat Capacity Reclaim Track',
  description: 'Automates capacity reclaim when 7-day offer expires and auto-promotes the next waitlist candidate with 48h deadline.',
  category: 'custom',
  workflowType: 'sub_scenario',
  version: 1,
  status: 'published',
  createdAt: '2026-08-20T10:00:00.000Z',
  updatedAt: '2026-08-20T10:00:00.000Z',
  tags: ['Edge Case', 'Waitlist', 'Capacity Reclaim', 'Auto-Promotion'],
  nodes: [
    {
      id: 'wr-node-1',
      type: 'trigger',
      position: { x: 350, y: 50 },
      data: {
        label: 'Seat Reclaim Event: Offer Expired or Withdrawn',
        subtitle: 'Capacity Reclaim Trigger',
        category: 'Trigger',
        phase: 'Phase 1 — Capacity Event',
        nodeSubtype: 'seat_available',
        triggerEvent: 'Seat Reclaimed',
        formName: 'Automated Seat Capacity Reclaim Event',
        description: 'Fires when a previous offer passes the 7-day window or family formally declines.'
      }
    },
    {
      id: 'wr-node-2',
      type: 'condition',
      position: { x: 350, y: 400 },
      data: {
        label: 'Evaluate Waitlist Queue Hierarchy',
        subtitle: 'Rank #1 Selection',
        category: 'Logic',
        phase: 'Phase 2 — Queue Evaluation',
        nodeSubtype: 'boolean_check',
        description: 'Identifies highest-priority candidate based on application date, legacy score, and grade fit.',
        conditionRules: [
          { field: 'applicant.waitlistRank', operator: 'equals', value: 1 }
        ],
        branches: [
          { handleId: 'promote', label: 'Auto-Promote Candidate', color: '#10B981', description: 'Promote immediately' },
          { handleId: 'empty_queue', label: 'No Waitlist (Open to Public)', color: '#64748B', description: 'Open public seats' }
        ]
      }
    },
    {
      id: 'wr-node-3',
      type: 'action',
      position: { x: 150, y: 760 },
      data: {
        label: 'Dispatch Urgent 48h Offer PDF',
        subtitle: 'Time-Critical Offer',
        category: 'Action',
        phase: 'Phase 3 — Expedited Offer',
        nodeSubtype: 'generate_offer_pdf',
        actionService: 'pdf_generator',
        recipient: '{{applicant.email}}',
        subject: 'URGENT SEAT RELEASE: 48h Offer of Admission for {{applicant.name}}',
        bodyContent: 'Dear {{applicant.parentName}},\n\nA seat in Grade {{applicant.grade}} has been released! As our top waitlisted applicant, {{applicant.name}} has 48 hours to secure this placement.',
        retryPolicy: { enabled: true, maxRetries: 3, retryDelaySeconds: 5, backoff: 'exponential', onFinalFailure: 'route_to_fallback' }
      }
    },
    {
      id: 'wr-node-4',
      type: 'action',
      position: { x: 150, y: 1120 },
      data: {
        label: 'Multi-Channel SMS & WhatsApp Alert',
        subtitle: 'Instant Mobile Alert',
        category: 'Action',
        phase: 'Phase 4 — Notification',
        nodeSubtype: 'send_whatsapp',
        actionService: 'whatsapp',
        recipient: '{{applicant.parentPhone}}',
        subject: 'Toddle Academy Seat Released: 48h Acceptance Window',
        bodyContent: 'Seat Open! Offer letter issued for {{applicant.name}}. 48-hour acceptance window active: https://admissions.toddle.school/offers/{{applicant.id}}'
      }
    }
  ],
  edges: [
    { id: 'wr-e1', source: 'wr-node-1', target: 'wr-node-2', animated: true },
    { id: 'wr-e2-p', source: 'wr-node-2', sourceHandle: 'promote', target: 'wr-node-3', label: 'Auto-Promote', animated: true },
    { id: 'wr-e3', source: 'wr-node-3', target: 'wr-node-4', animated: true }
  ]
};

/**
 * Edge Case 4: International Student Visa & Boarding Allocation Track
 */
export const INTERNATIONAL_BOARDING_VISA_WORKFLOW: Workflow = {
  id: 'wf-edge-international-boarding',
  name: '🌐 International Student Visa & Boarding Allocation Track',
  description: 'Specialized track for overseas boarding students covering Form I-20 visa sponsorship, dormitory room keys, and English proficiency (EAL) checks.',
  category: 'custom',
  workflowType: 'sub_scenario',
  version: 1,
  status: 'published',
  createdAt: '2026-08-20T10:00:00.000Z',
  updatedAt: '2026-08-20T10:00:00.000Z',
  tags: ['Edge Case', 'International', 'Boarding', 'Visa I-20', 'EAL'],
  nodes: [
    {
      id: 'ib-node-1',
      type: 'trigger',
      position: { x: 350, y: 50 },
      data: {
        label: 'International Boarding Application Submitted',
        subtitle: 'Entry Trigger',
        category: 'Trigger',
        phase: 'Phase 1 — Overseas Intake',
        nodeSubtype: 'form_submitted',
        triggerEvent: 'International Intake',
        formName: 'International Student & Boarding Application 2026',
        description: 'Ingests passport copy, guardian affidavit, and country of citizenship.'
      }
    },
    {
      id: 'ib-node-2',
      type: 'condition',
      position: { x: 350, y: 400 },
      data: {
        label: 'English Language Proficiency Check (CEFR)',
        subtitle: 'Language Assessment',
        category: 'Logic',
        phase: 'Phase 2 — Language Evaluation',
        nodeSubtype: 'boolean_check',
        description: 'Routes candidate to direct IB Diploma or Intensive English Immersion (EAL).',
        conditionRules: [
          { field: 'applicant.cefrScore', operator: 'greater_than_or_equal', value: 80 }
        ],
        branches: [
          { handleId: 'fluent', label: 'Advanced English (Direct DP)', color: '#10B981', description: 'Direct academic enrollment' },
          { handleId: 'eal_support', label: 'Requires EAL Language Support', color: '#3B82F6', description: 'Assign EAL specialist' }
        ]
      }
    },
    {
      id: 'ib-node-3',
      type: 'action',
      position: { x: 350, y: 760 },
      data: {
        label: 'Generate Form I-20 Visa Certificate & Housing Offer',
        subtitle: 'Visa Sponsorship Package',
        category: 'Action',
        phase: 'Phase 3 — Visa & Dormitory',
        nodeSubtype: 'generate_offer_pdf',
        actionService: 'pdf_generator',
        recipient: '{{applicant.email}}',
        subject: 'Official Form I-20 Visa Sponsorship & Residential Hall Allocation: {{applicant.name}}',
        bodyContent: 'Dear {{applicant.parentName}},\n\nAttached is {{applicant.name}}\'s Form I-20 Visa Certificate and Boarding Room Allocation (East Hall, Wing B).',
        retryPolicy: { enabled: true, maxRetries: 3, retryDelaySeconds: 5, backoff: 'exponential', onFinalFailure: 'route_to_fallback' }
      }
    },
    {
      id: 'ib-node-4',
      type: 'system',
      position: { x: 350, y: 1120 },
      data: {
        label: 'Sync to International SEVIS System & Dormitory Key Allocation',
        subtitle: 'Terminal State — International Enrolled',
        category: 'System / SIS',
        phase: 'Phase 4 — SIS Handover',
        nodeSubtype: 'system_task',
        sisEndpoint: 'https://api.toddleschool.com/v1/sis/international',
        bodyContent: 'Provisions SEVIS student ID, registers guardian in immigration portal, and issues biometric dorm access pass.'
      }
    }
  ],
  edges: [
    { id: 'ib-e1', source: 'ib-node-1', target: 'ib-node-2', animated: true },
    { id: 'ib-e2-f', source: 'ib-node-2', sourceHandle: 'fluent', target: 'ib-node-3', label: 'Direct Entry', animated: true },
    { id: 'ib-e2-eal', source: 'ib-node-2', sourceHandle: 'eal_support', target: 'ib-node-3', label: 'EAL Support', animated: true },
    { id: 'ib-e3', source: 'ib-node-3', target: 'ib-node-4', animated: true }
  ]
};

/**
 * Edge Case 5: Specialized Medical & Bus Transport Routing Track
 */
export const MEDICAL_TRANSPORT_ONBOARDING_WORKFLOW: Workflow = {
  id: 'wf-edge-medical-transport',
  name: '🚌 Medical Allergy & Bus Transport Routing Track',
  description: 'Handles critical student logistics post-acceptance: alerts school nurse of severe allergies and optimizes bus pickup routes.',
  category: 'custom',
  workflowType: 'sub_scenario',
  version: 1,
  status: 'published',
  createdAt: '2026-08-20T10:00:00.000Z',
  updatedAt: '2026-08-20T10:00:00.000Z',
  tags: ['Edge Case', 'Medical Protocol', 'Bus Transport', 'Student Safety'],
  nodes: [
    {
      id: 'mt-node-1',
      type: 'trigger',
      position: { x: 350, y: 50 },
      data: {
        label: 'Onboarding Health & Transport Form Ingested',
        subtitle: 'Entry Trigger',
        category: 'Trigger',
        phase: 'Phase 1 — Logistics Intake',
        nodeSubtype: 'form_submitted',
        triggerEvent: 'Health Logistics Intake',
        formName: 'Student Health & Bus Route Request Form 2026'
      }
    },
    {
      id: 'mt-node-2',
      type: 'condition',
      position: { x: 350, y: 400 },
      data: {
        label: 'Dietary / Allergy Protocol Check',
        subtitle: 'Medical Risk Evaluation',
        category: 'Logic',
        phase: 'Phase 2 — Medical Protocol',
        nodeSubtype: 'boolean_check',
        conditionRules: [
          { field: 'applicant.hasMedicalAlert', operator: 'equals', value: true }
        ],
        branches: [
          { handleId: 'alert', label: 'Flagged Medical Alert (Alert Clinic)', color: '#F43F5E', description: 'Immediate nurse alert' },
          { handleId: 'clear', label: 'Standard Health Profile', color: '#10B981', description: 'Standard health filing' }
        ]
      }
    },
    {
      id: 'mt-node-3',
      type: 'action',
      position: { x: 150, y: 760 },
      data: {
        label: 'Dispatch Action Plan to School Clinic & Cafeteria',
        subtitle: 'Medical Safety Notice',
        category: 'Action',
        phase: 'Phase 3 — Nurse Protocol',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: 'school-nurse@toddle.school',
        subject: 'EMERGENCY HEALTH PLAN: {{applicant.name}} (Grade {{applicant.grade}})',
        bodyContent: 'Severe allergy flagged for {{applicant.name}}. Cafeteria dietary restrictions and EpiPen storage updated in clinic ledger.'
      }
    },
    {
      id: 'mt-node-4',
      type: 'action',
      position: { x: 550, y: 760 },
      data: {
        label: 'Calculate Bus Route & Issue Digital Transit Card',
        subtitle: 'Transport Routing',
        category: 'Action',
        phase: 'Phase 3 — Transport Setup',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: '{{applicant.email}}',
        subject: 'Your Toddle Academy Bus Stop & Transit Pass for {{applicant.name}}',
        bodyContent: 'Dear {{applicant.parentName}},\n\nBus Route assigned: Yellow Line (Route 4). Morning pick-up at 7:45 AM at Maple Hill Gate.'
      }
    }
  ],
  edges: [
    { id: 'mt-e1', source: 'mt-node-1', target: 'mt-node-2', animated: true },
    { id: 'mt-e2-alert', source: 'mt-node-2', sourceHandle: 'alert', target: 'mt-node-3', label: 'Medical Alert', animated: true },
    { id: 'mt-e2-clear', source: 'mt-node-2', sourceHandle: 'clear', target: 'mt-node-4', label: 'Standard', animated: true },
    { id: 'mt-e3', source: 'mt-node-3', target: 'mt-node-4', animated: true }
  ]
};

/**
 * Edge Case 6: Admissions Appeals & Deferred Entry Track
 */
export const APPEALS_DEFERRED_ENTRY_WORKFLOW: Workflow = {
  id: 'wf-edge-appeals-deferral',
  name: '📝 Admissions Appeals & Deferred Semester Entry Track',
  description: 'Handles formal candidate appeals after decline or requests to defer admission to Spring semester.',
  category: 'custom',
  workflowType: 'sub_scenario',
  version: 1,
  status: 'published',
  createdAt: '2026-08-20T10:00:00.000Z',
  updatedAt: '2026-08-20T10:00:00.000Z',
  tags: ['Edge Case', 'Appeals', 'Deferral', 'Executive Review'],
  nodes: [
    {
      id: 'ap-node-1',
      type: 'trigger',
      position: { x: 350, y: 50 },
      data: {
        label: 'Formal Appeal / Deferral Request Ingested',
        subtitle: 'Entry Trigger',
        category: 'Trigger',
        phase: 'Phase 1 — Appeal Request',
        nodeSubtype: 'form_submitted',
        triggerEvent: 'Appeal Submitted',
        formName: 'Toddle Admissions Appeal & Deferral Petition Form 2026'
      }
    },
    {
      id: 'ap-node-2',
      type: 'human',
      position: { x: 350, y: 400 },
      data: {
        label: 'Head of School & Principal Appeal Review',
        subtitle: 'Executive Appeal Gate',
        category: 'Human',
        phase: 'Phase 2 — Executive Review',
        nodeSubtype: 'human_decision',
        humanTaskTitle: 'Executive Appeal Deliberation',
        assignedRole: 'Lead Principal & Head of School',
        timeoutHours: 72,
        description: 'Principal reviews supplementary academic work and extenuating circumstances.',
        allowedOutcomes: [
          { actionId: 'overturn_admit', label: 'Overturn to Conditional Admit', variant: 'success', nextStatus: 'Conditional Offer' },
          { actionId: 'grant_deferral', label: 'Grant Spring Deferral', variant: 'info', nextStatus: 'Deferred' },
          { actionId: 'uphold_decline', label: 'Uphold Original Decline', variant: 'danger', nextStatus: 'Declined' }
        ]
      }
    },
    {
      id: 'ap-node-3',
      type: 'action',
      position: { x: 150, y: 820 },
      data: {
        label: 'Issue Reconsidered Conditional Offer',
        subtitle: 'Appeal Upheld',
        category: 'Action',
        phase: 'Phase 3 — Decision Notice',
        nodeSubtype: 'generate_offer_pdf',
        actionService: 'pdf_generator',
        recipient: '{{applicant.email}}',
        subject: 'Appeal Decision: Conditional Offer Granted for {{applicant.name}}',
        bodyContent: 'Dear {{applicant.parentName}},\n\nFollowing executive review, Head of School has approved a conditional admission offer for {{applicant.name}}.'
      }
    },
    {
      id: 'ap-node-4',
      type: 'action',
      position: { x: 550, y: 820 },
      data: {
        label: 'Issue Spring Semester Deferral Certificate',
        subtitle: 'Deferral Granted',
        category: 'Action',
        phase: 'Phase 3 — Deferral Notice',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: '{{applicant.email}}',
        subject: 'Admission Deferral Confirmed for Spring Semester — {{applicant.name}}',
        bodyContent: 'Dear {{applicant.parentName}},\n\n{{applicant.name}}\'s enrollment has been successfully deferred to the Spring Semester with priority seat reservation.'
      }
    }
  ],
  edges: [
    { id: 'ap-e1', source: 'ap-node-1', target: 'ap-node-2', animated: true },
    { id: 'ap-e2-admit', source: 'ap-node-2', sourceHandle: 'overturn_admit', target: 'ap-node-3', label: 'Appeal Approved', animated: true },
    { id: 'ap-e2-def', source: 'ap-node-2', sourceHandle: 'grant_deferral', target: 'ap-node-4', label: 'Deferral Granted', animated: true }
  ]
};

// ============================================================================
// FLAGSHIP FULL-CYCLE 9-PHASE COMPOSED BLUEPRINT
// ============================================================================

export const TODDLE_STANDARD_ADMISSION_WORKFLOW: Workflow = {
  id: 'wf-toddle-standard-blueprint-9phases',
  name: '🏫 Toddle Standard 9-Phase Master Admission Blueprint',
  description: 'The complete end-to-end admission engine connecting all 9 phases: Inquiry $\\rightarrow$ Routing $\\rightarrow$ OCR Docs $\\rightarrow$ Interview $\\rightarrow$ Committee $\\rightarrow$ Waitlist $\\rightarrow$ Fee Goal $\\rightarrow$ Medical/Transport Onboarding $\\rightarrow$ SIS Handover.',
  category: 'admission',
  workflowType: 'standard',
  version: 2,
  status: 'published',
  createdAt: '2026-08-20T10:00:00.000Z',
  updatedAt: '2026-08-20T10:00:00.000Z',
  tags: ['Composed Blueprint', '9 Phases Complete', 'Flagship'],
  nodes: [
    // Phase 1
    {
      id: 'node-p1-trigger',
      type: 'trigger',
      position: { x: 350, y: 50 },
      data: {
        label: '1. Online Application & Enquiry Form Ingestion',
        subtitle: 'Phase 1: Entry Trigger',
        category: 'Trigger',
        phase: 'Phase 1 — Lead Capture & Enquiry',
        nodeSubtype: 'form_submitted',
        triggerEvent: 'Application Form Submitted',
        formName: 'Toddle Global Online Admission Form 2026',
        description: 'Ingests new student application with demographic, academic, and guardian metadata.'
      }
    },
    {
      id: 'node-p1-action-prospectus',
      type: 'action',
      position: { x: 350, y: 400 },
      data: {
        label: 'Send Branded Confirmation & Portal Credentials',
        subtitle: 'Phase 1: Instant Outreach',
        category: 'Action',
        phase: 'Phase 1 — Lead Capture & Enquiry',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: '{{applicant.email}}',
        subject: 'Welcome to Toddle Academy | Application {{applicant.id}} Received',
        bodyContent: 'Dear {{applicant.parentName}},\n\nThank you for submitting {{applicant.name}}\'s application for Grade {{applicant.grade}}.\n\nLive portal tracking: https://admissions.toddle.school/portal/{{applicant.id}}'
      }
    },
    {
      id: 'node-p1-delay-3d',
      type: 'delay',
      position: { x: 350, y: 760 },
      data: {
        label: 'Wait 3 Days (With Early Tour Booking Bypass)',
        subtitle: 'Phase 1: Nurture SLA',
        category: 'Control',
        phase: 'Phase 1 — Lead Capture & Enquiry',
        nodeSubtype: 'delay_timer',
        delayDuration: 72,
        delayUnit: 'hours',
        allowEarlyActionBypass: true,
        earlyActionEvents: ['tour.booked', 'application.started'],
        description: 'Gives the family time to digest the material. If parent books a tour early, delay is instantly skipped!'
      }
    },
    // Phase 2
    {
      id: 'node-p2-action-ocr',
      type: 'action',
      position: { x: 350, y: 1120 },
      data: {
        label: 'AI OCR Document Extraction & Pre-Validation',
        subtitle: 'Phase 2: Automated Verification',
        category: 'Action',
        phase: 'Phase 2 — Application Submission & Routing',
        nodeSubtype: 'ai_ocr_scan',
        actionService: 'ocr_scanner',
        description: 'Scans uploaded birth certificate and transcripts to validate age consistency and extract GPA.'
      }
    },
    {
      id: 'node-p2-cond-router',
      type: 'condition',
      position: { x: 350, y: 1480 },
      data: {
        label: 'Route by Grade Band & Category',
        subtitle: 'Phase 2: Intelligent Routing',
        category: 'Logic',
        phase: 'Phase 2 — Application Submission & Routing',
        nodeSubtype: 'grade_router',
        description: 'Routes applicant to Primary Team, Middle/High IB Coordinator, or International queue.',
        conditionRules: [
          { field: 'applicant.gradeCategory', operator: 'equals', value: 'Middle / High School' }
        ],
        branches: [
          { handleId: 'secondary', label: 'Middle/High (Gr 6-12)', color: '#8B5CF6', description: 'Secondary & IB Coordinator' },
          { handleId: 'primary', label: 'Primary (Gr K-5)', color: '#3B82F6', description: 'Primary Admissions Team' },
          { handleId: 'boarding', label: 'Boarding / Overseas', color: '#06B6D4', description: 'International Lead' }
        ]
      }
    },
    // Phase 3
    {
      id: 'node-p3-cond-docs',
      type: 'condition',
      position: { x: 350, y: 1900 },
      data: {
        label: 'Consolidated Mandatory Documents Complete?',
        subtitle: 'Phase 3: Single-Pass Verification',
        category: 'Logic',
        phase: 'Phase 3 — Document Verification',
        nodeSubtype: 'boolean_check',
        documentChecklist: [
          { id: 'doc-birth-cert', name: 'Birth Certificate / Age Proof', mandatory: true, status: 'verified' },
          { id: 'doc-transcripts', name: 'Academic Transcripts (Last 2 Years)', mandatory: true, status: 'verified' },
          { id: 'doc-id-passport', name: 'Parent/Guardian Photo ID', mandatory: true, status: 'verified' }
        ],
        conditionRules: [
          { field: 'applicant.mandatoryDocsValid', operator: 'equals', value: true }
        ],
        branches: [
          { handleId: 'true', label: 'Verified & Complete', color: '#10B981', description: 'Clear for faculty interview' },
          { handleId: 'false', label: 'Missing / Invalid Docs', color: '#EF4444', description: 'Escalate to staff outreach' }
        ]
      }
    },
    {
      id: 'node-p3-human-escalate',
      type: 'human',
      position: { x: 750, y: 1900 },
      data: {
        label: '48h SLA Escalation: Officer Calls Parent',
        subtitle: 'Phase 3: Exception Recovery',
        category: 'Human',
        phase: 'Phase 3 — Document Verification',
        nodeSubtype: 'human_decision',
        humanTaskTitle: '48h SLA Document Outreach Call',
        assignedRole: 'Admissions Officer & Counselor',
        timeoutHours: 48,
        description: 'Admissions counselor contacts parent to resolve missing documentation before application expires.',
        allowedOutcomes: [
          { actionId: 'resolved', label: 'Parent Uploaded Docs', variant: 'success', nextStatus: 'Documents Verified' },
          { actionId: 'exception', label: 'Approve Exemption', variant: 'warning', nextStatus: 'Documents Verified' }
        ]
      }
    },
    // Phase 4
    {
      id: 'node-p4-action-calendar',
      type: 'action',
      position: { x: 350, y: 2320 },
      data: {
        label: 'Sync Staff Calendar & Self-Booking Link',
        subtitle: 'Phase 4: Frictionless Scheduling',
        category: 'Action',
        phase: 'Phase 4 — Assessment & Interview',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: '{{applicant.email}}',
        subject: 'Book Your Admission Interview Slot for {{applicant.name}}',
        bodyContent: 'Dear {{applicant.parentName}},\n\nPlease select an interview slot with our academic faculty for {{applicant.name}}:\nhttps://admissions.toddle.school/schedule/{{applicant.id}}'
      }
    },
    {
      id: 'node-p4-action-whatsapp',
      type: 'action',
      position: { x: 350, y: 2680 },
      data: {
        label: '24h Multi-Channel SMS & WhatsApp Reminder',
        subtitle: 'Phase 4: Zero No-Show Safeguard',
        category: 'Action',
        phase: 'Phase 4 — Assessment & Interview',
        nodeSubtype: 'send_whatsapp',
        actionService: 'whatsapp',
        recipient: '{{applicant.parentPhone}}',
        subject: '24h Interview Reminder: Tomorrow at Toddle Academy',
        bodyContent: 'Reminder: Interview for {{applicant.name}} is tomorrow at 10:00 AM. Campus gate map: https://toddle.school/map'
      }
    },
    // Phase 5
    {
      id: 'node-p5-human-committee',
      type: 'human',
      position: { x: 350, y: 3040 },
      data: {
        label: 'Admissions Committee Decision Gate',
        subtitle: 'Phase 5: Human Rubric Review',
        category: 'Human',
        phase: 'Phase 5 — Committee Decision',
        nodeSubtype: 'human_decision',
        humanTaskTitle: 'Review Evaluation Rubric & Decide Outcome',
        assignedRole: 'Admissions Committee & Academic Head',
        timeoutHours: 72,
        description: 'Committee reviews assessment rubric and determines candidate status.',
        allowedOutcomes: [
          { actionId: 'admit', label: 'Admit Candidate', variant: 'success', nextStatus: 'Offered' },
          { actionId: 'conditional', label: 'Conditional Offer', variant: 'info', nextStatus: 'Conditional Offer' },
          { actionId: 'waitlist', label: 'Place on Waitlist', variant: 'warning', nextStatus: 'Waitlisted' },
          { actionId: 'decline', label: 'Decline Application', variant: 'danger', nextStatus: 'Declined' }
        ]
      }
    },
    // Phase 6
    {
      id: 'node-p6-waitlist-promotion',
      type: 'action',
      position: { x: 750, y: 3460 },
      data: {
        label: 'Waitlist Auto-Promotion Engine & Notification',
        subtitle: 'Phase 6: Capacity Management',
        category: 'Action',
        phase: 'Phase 6 — Waitlist Promotion',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: '{{applicant.email}}',
        subject: 'Toddle Academy Waitlist Priority Placement: {{applicant.name}}',
        bodyContent: '{{applicant.name}} is placed on our Grade {{applicant.grade}} priority waitlist. Auto-promotion triggers as soon as admitted offers expire.'
      }
    },
    // Phase 7
    {
      id: 'node-p7-action-offerpdf',
      type: 'action',
      position: { x: 350, y: 3460 },
      data: {
        label: 'Send Official Offer PDF & 7-Day Payment Link',
        subtitle: 'Phase 7: Digital Offer Pack',
        category: 'Action',
        phase: 'Phase 7 — Offer & Fee Reminders',
        nodeSubtype: 'generate_offer_pdf',
        actionService: 'pdf_generator',
        recipient: '{{applicant.email}}',
        subject: 'Official Offer of Admission — Toddle Academy (Ref: {{applicant.id}})',
        bodyContent: 'Dear {{applicant.parentName}},\n\nCongratulations! We are delighted to offer {{applicant.name}} admission to Toddle Academy.\n\nReview offer & pay deposit: https://admissions.toddle.school/offers/{{applicant.id}}'
      }
    },
    {
      id: 'node-p7-goal-fee',
      type: 'goal',
      position: { x: 350, y: 3820 },
      data: {
        label: 'Goal: Admission Fee Paid within 7 Days',
        subtitle: 'Phase 7: Persistent Objective Loop',
        category: 'Persistent Goal',
        phase: 'Phase 7 — Offer & Fee Reminders',
        nodeSubtype: 'persistent_goal',
        goalTargetMetric: 'fee_paid',
        goalCheckIntervalHours: 24,
        goalMaxAttempts: 7,
        goalFastTrackBypass: true,
        description: 'Persistent loop checking fee payment. Offline wire bypass instantly clears this goal.'
      }
    },
    // Phase 8
    {
      id: 'node-p8-action-onboarding',
      type: 'action',
      position: { x: 350, y: 4240 },
      data: {
        label: 'Medical History, Dietary & Bus Transport Forms',
        subtitle: 'Phase 8: Student Logistics',
        category: 'Action',
        phase: 'Phase 8 — Post-Offer Onboarding',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: '{{applicant.email}}',
        subject: 'Student Onboarding: Medical Records & School Bus Setup for {{applicant.name}}',
        bodyContent: 'Welcome to the Toddle Family! Please complete {{applicant.name}}\'s student medical history and bus transport forms: https://admissions.toddle.school/onboarding/{{applicant.id}}'
      }
    },
    // Phase 9
    {
      id: 'node-p9-action-sis',
      type: 'action',
      position: { x: 350, y: 4600 },
      data: {
        label: 'Sync Student & Family Profile to SIS ERP',
        subtitle: 'Phase 9: Enterprise SIS Handover',
        category: 'Action',
        phase: 'Phase 9 — LMS & SIS Handover',
        nodeSubtype: 'sync_sis',
        actionService: 'sis_sync',
        sisSystemName: 'Toddle Core SIS / PowerSchool ERP',
        sisEndpoint: 'https://api.toddleschool.com/v1/sis/students',
        description: 'Transfers fully validated applicant record into core School Information System.',
        fieldMappings: [
          { sourceField: 'firstName', targetField: 'first_name', transform: 'none' },
          { sourceField: 'lastName', targetField: 'last_name', transform: 'none' },
          { sourceField: 'dateOfBirth', targetField: 'dob', transform: 'format_date' },
          { sourceField: 'email', targetField: 'student_email', transform: 'lowercase' },
          { sourceField: 'grade', targetField: 'enrolled_grade', transform: 'to_number' },
          { sourceField: 'campus', targetField: 'campus_code', transform: 'none' }
        ]
      }
    },
    {
      id: 'node-p9-system-provision',
      type: 'system',
      position: { x: 350, y: 4960 },
      data: {
        label: 'Provision LMS Accounts, Timetable & Homeroom Teacher',
        subtitle: 'Phase 9: Terminal State — Student Active',
        category: 'System / SIS',
        phase: 'Phase 9 — LMS & SIS Handover',
        nodeSubtype: 'system_task',
        sisEndpoint: 'https://api.toddleschool.com/v1/provisioning',
        bodyContent: 'Provision student LMS credentials, assign homeroom teacher, and schedule first day timetable.'
      }
    }
  ],
  edges: [
    { id: 'e1', source: 'node-p1-trigger', target: 'node-p1-action-prospectus', animated: true },
    { id: 'e2', source: 'node-p1-action-prospectus', target: 'node-p1-delay-3d', animated: true },
    { id: 'e3', source: 'node-p1-delay-3d', target: 'node-p2-action-ocr', animated: true },
    { id: 'e4', source: 'node-p2-action-ocr', target: 'node-p2-cond-router', animated: true },
    { id: 'e5-secondary', source: 'node-p2-cond-router', sourceHandle: 'secondary', target: 'node-p3-cond-docs', label: 'Middle/High (Gr 6-12)', animated: true },
    { id: 'e5-primary', source: 'node-p2-cond-router', sourceHandle: 'primary', target: 'node-p3-cond-docs', label: 'Primary (Gr K-5)', animated: true },
    { id: 'e5-boarding', source: 'node-p2-cond-router', sourceHandle: 'boarding', target: 'node-p3-cond-docs', label: 'Boarding / Overseas', animated: true },
    { id: 'e6-true', source: 'node-p3-cond-docs', sourceHandle: 'true', target: 'node-p4-action-calendar', label: 'TRUE / Valid Docs', animated: true },
    { id: 'e6-false', source: 'node-p3-cond-docs', sourceHandle: 'false', target: 'node-p3-human-escalate', label: 'FALSE / Missing Docs', animated: true },
    { id: 'e-escalate-resolved', source: 'node-p3-human-escalate', sourceHandle: 'resolved', target: 'node-p4-action-calendar', label: 'Docs Uploaded', animated: true },
    { id: 'e7', source: 'node-p4-action-calendar', target: 'node-p4-action-whatsapp', animated: true },
    { id: 'e8', source: 'node-p4-action-whatsapp', target: 'node-p5-human-committee', animated: true },
    { id: 'e9-admit', source: 'node-p5-human-committee', sourceHandle: 'admit', target: 'node-p7-action-offerpdf', label: 'Admit Candidate', animated: true },
    { id: 'e9-conditional', source: 'node-p5-human-committee', sourceHandle: 'conditional', target: 'node-p7-action-offerpdf', label: 'Conditional Offer', animated: true },
    { id: 'e9-waitlist', source: 'node-p5-human-committee', sourceHandle: 'waitlist', target: 'node-p6-waitlist-promotion', label: 'Waitlist', animated: true },
    { id: 'e10', source: 'node-p7-action-offerpdf', target: 'node-p7-goal-fee', animated: true },
    { id: 'e11-paid', source: 'node-p7-goal-fee', sourceHandle: 'success', target: 'node-p8-action-onboarding', label: 'Deposit Paid (Goal Met)', animated: true },
    { id: 'e12', source: 'node-p8-action-onboarding', target: 'node-p9-action-sis', animated: true },
    { id: 'e13', source: 'node-p9-action-sis', target: 'node-p9-system-provision', animated: true }
  ]
};

/**
 * Blank Starter Workflow
 */
export const BLANK_STARTER_WORKFLOW: Workflow = {
  id: 'wf-blank-starter',
  name: 'New Custom Workflow',
  description: 'Blank canvas ready for custom node composition.',
  category: 'custom',
  workflowType: 'custom',
  version: 1,
  status: 'draft',
  createdAt: '2026-08-20T10:00:00.000Z',
  updatedAt: '2026-08-20T10:00:00.000Z',
  tags: ['Custom', 'Blank'],
  nodes: [
    {
      id: 'start-trigger-1',
      type: 'trigger',
      position: { x: 350, y: 100 },
      data: {
        label: 'Start Trigger: Form Submitted',
        subtitle: 'Entry Point',
        category: 'Trigger',
        phase: 'Phase 1 — Entry Trigger',
        triggerEvent: 'Form Submitted',
        formName: 'Custom Admission Form 2026',
        description: 'Drag actions, conditions, or goals from the library to connect.'
      }
    }
  ],
  edges: []
};

// ============================================================================
// COMPLETE INITIAL WORKFLOWS ARRAY
// ============================================================================

export const INITIAL_WORKFLOWS: Workflow[] = [
  // 1. Flagship Composed Master Blueprint (All 9 Phases)
  TODDLE_STANDARD_ADMISSION_WORKFLOW,
  
  // 2. All 9 Modular Phase Flows
  MODULAR_FLOW_1_LEAD_CAPTURE,
  MODULAR_FLOW_2_APP_SUBMISSION,
  MODULAR_FLOW_3_DOC_VERIFICATION,
  MODULAR_FLOW_4_INTERVIEW,
  MODULAR_FLOW_5_COMMITTEE,
  MODULAR_FLOW_6_WAITLIST_PROMOTION,
  MODULAR_FLOW_7_OFFER_FEE_GOAL,
  MODULAR_FLOW_8_POST_OFFER_ONBOARDING,
  MODULAR_FLOW_9_SIS_PROVISIONING,

  // 3. Edge Cases & Customizable School Tracks (Sub-Flowcharts)
  NO_INTERVIEW_FAST_TRACK_WORKFLOW,
  MERIT_SCHOLARSHIP_WORKFLOW,
  WAITLIST_CAPACITY_MANAGEMENT_WORKFLOW,
  INTERNATIONAL_BOARDING_VISA_WORKFLOW,
  MEDICAL_TRANSPORT_ONBOARDING_WORKFLOW,
  APPEALS_DEFERRED_ENTRY_WORKFLOW
];

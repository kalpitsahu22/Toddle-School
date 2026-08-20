import { Workflow, WorkflowNode, WorkflowEdge } from '../types/workflow';

// ============================================================================
// MODULAR DECOUPLED WORKFLOWS (7 Independent Modular Workflows)
// ============================================================================

/**
 * Modular Flow 1: Lead Capture & Enquiry Nurturing
 */
export const MODULAR_FLOW_1_LEAD_CAPTURE: Workflow = {
  id: 'wf-mod-1-lead-capture',
  name: '1. Lead Capture & Enquiry Nurturing',
  description: 'Independent modular workflow triggered when a prospective parent submits a website inquiry. Features early tour booking delay cancellation.',
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
      position: { x: 300, y: 50 },
      data: {
        label: 'Website Enquiry Form Submitted',
        subtitle: 'Entry Trigger',
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
      position: { x: 300, y: 200 },
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
      position: { x: 300, y: 350 },
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
      position: { x: 300, y: 500 },
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
          { handleId: 'true', label: 'Tour Booked (High Touch)', color: '#10B981', description: 'Schedule physical walkthrough & counselor' },
          { handleId: 'false', label: 'No Tour (Digital Nurture)', color: '#64748B', description: 'Deliver video testimonials & curriculum guides' }
        ]
      }
    },
    {
      id: 'm1-node-action-tour',
      type: 'action',
      position: { x: 140, y: 660 },
      data: {
        label: 'Schedule Open Day & Assign Counselor',
        subtitle: 'High-Touch Follow-up',
        category: 'Action',
        phase: 'Phase 1 — Lead Capture & Enquiry',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: '{{applicant.email}}',
        subject: 'Campus Tour Confirmed | Dedicated Counselor Assigned',
        bodyContent: 'Dear {{applicant.parentName}},\n\nYour campus tour for {{applicant.name}} is confirmed! Our Admissions Counselor Sarah Miller has been assigned to host your visit at {{applicant.campus}}.\n\nVisitor pass & campus map: https://toddle.school/visitor-pass/{{applicant.id}}',
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
      id: 'm1-node-action-nurture',
      type: 'action',
      position: { x: 460, y: 660 },
      data: {
        label: 'Send Value Highlights & Video Testimonials',
        subtitle: 'Secondary Digital Nurture',
        category: 'Action',
        phase: 'Phase 1 — Lead Capture & Enquiry',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: '{{applicant.email}}',
        subject: 'Discover Student Life & Global Outcomes at Toddle Academy',
        bodyContent: 'Dear {{applicant.parentName}},\n\nSee how students excel in Grade {{applicant.grade}} at Toddle Academy with our student-led project showcases and university placement records: https://toddle.school/community-showcase\n\nReady to apply? Start here: https://admissions.toddle.school/apply/{{applicant.id}}',
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
    { id: 'm1-e4-true', source: 'm1-node-tour-check', sourceHandle: 'true', target: 'm1-node-action-tour', label: 'Tour Booked', animated: true },
    { id: 'm1-e4-false', source: 'm1-node-tour-check', sourceHandle: 'false', target: 'm1-node-action-nurture', label: 'No Tour', animated: true }
  ]
};

/**
 * Modular Flow 2: Application Submission & Staff Routing
 */
export const MODULAR_FLOW_2_APP_SUBMISSION: Workflow = {
  id: 'wf-mod-2-app-submission',
  name: '2. Application Submission & Staff Routing',
  description: 'Independent workflow triggered when formal application is submitted. Performs AI OCR scan and routes by grade band & category.',
  category: 'admission',
  workflowType: 'modular_phase',
  emittedEventOnComplete: 'application.routed_to_staff',
  version: 1,
  status: 'published',
  createdAt: '2026-08-20T10:00:00.000Z',
  updatedAt: '2026-08-20T10:00:00.000Z',
  tags: ['Modular Phase', 'Phase 2', 'OCR & Routing'],
  nodes: [
    {
      id: 'm2-node-trigger',
      type: 'trigger',
      position: { x: 300, y: 50 },
      data: {
        label: 'Formal Application Submitted',
        subtitle: 'Entry Trigger',
        category: 'Trigger',
        phase: 'Phase 2 — Application Submission & Routing',
        nodeSubtype: 'form_submitted',
        triggerEvent: 'Application Submitted',
        formName: 'Toddle Full Admission Application 2026-27',
        description: 'Fires when parent submits full 8-section application form with past transcripts and identity records.'
      }
    },
    {
      id: 'm2-node-ack',
      type: 'action',
      position: { x: 300, y: 190 },
      data: {
        label: 'Send Application Acknowledgment & Portal Magic Link',
        subtitle: 'Frictionless Access',
        category: 'Action',
        phase: 'Phase 2 — Application Submission & Routing',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: '{{applicant.email}}',
        subject: 'Application Received (Ref: {{applicant.id}}) | Dedicated Parent Portal Link',
        bodyContent: 'Dear {{applicant.parentName}},\n\nWe have safely received {{applicant.name}}\'s formal application for Grade {{applicant.grade}} at Toddle Academy ({{applicant.campus}}).\n\nTrack your real-time review progress: https://admissions.toddle.school/portal/{{applicant.id}}\n\nWarm regards,\nAdmissions Office',
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
      id: 'm2-node-ocr',
      type: 'action',
      position: { x: 300, y: 330 },
      data: {
        label: 'AI OCR Document Pre-Validation',
        subtitle: 'Automated Scan',
        category: 'Action',
        phase: 'Phase 2 — Application Submission & Routing',
        nodeSubtype: 'ai_ocr_scan',
        actionService: 'ocr_scanner',
        description: 'Scans uploaded birth certificate, transcripts, and passport to verify legibility and extract candidate bio fields before staff opens the file.',
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
      id: 'm2-node-router',
      type: 'condition',
      position: { x: 300, y: 470 },
      data: {
        label: 'Route by Grade Band & Category',
        subtitle: 'Specialized Routing',
        category: 'Logic',
        phase: 'Phase 2 — Application Submission & Routing',
        nodeSubtype: 'grade_router',
        description: 'Routes candidate file into specialized coordinator queues: Primary (PYP), Middle/High (MYP/DP), or International Boarding.',
        conditionRules: [
          { field: 'applicant.gradeCategory', operator: 'equals', value: 'Middle / High School' }
        ],
        branches: [
          { handleId: 'primary', label: 'Primary (Gr K-5)', color: '#3B82F6', description: 'Primary Admissions Team' },
          { handleId: 'secondary', label: 'Middle/High (Gr 6-12)', color: '#8B5CF6', description: 'Secondary & IB Coordinator' },
          { handleId: 'boarding', label: 'Boarding / Overseas', color: '#06B6D4', description: 'International Lead' }
        ]
      }
    },
    {
      id: 'm2-node-assign-sec',
      type: 'action',
      position: { x: 140, y: 640 },
      data: {
        label: 'Assign to Secondary & IB Coordinator',
        subtitle: 'Academic Lead Queue',
        category: 'Action',
        phase: 'Phase 2 — Application Submission & Routing',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: 'secondary-admissions@toddle.school',
        subject: 'Task: Review Secondary Candidate {{applicant.name}} (Gr {{applicant.grade}})',
        bodyContent: 'Secondary Admissions Desk:\n\nNew Grade {{applicant.grade}} application received for {{applicant.name}} (ID: {{applicant.id}}). Pre-validation OCR score: 98%. Please review candidate file and clear for interview scheduling.',
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
      id: 'm2-node-assign-intl',
      type: 'action',
      position: { x: 460, y: 640 },
      data: {
        label: 'Assign to International Admissions Lead',
        subtitle: 'Immigration & Boarding Queue',
        category: 'Action',
        phase: 'Phase 2 — Application Submission & Routing',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: 'intl-admissions@toddle.school',
        subject: 'Task: Review International Candidate {{applicant.name}} ({{applicant.nationality}})',
        bodyContent: 'International Admissions Desk:\n\nNew overseas/boarding application received for {{applicant.name}} (ID: {{applicant.id}}). Passport & visa documents pre-scanned. Please evaluate English proficiency and boarding capacity.',
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
    { id: 'm2-e1', source: 'm2-node-trigger', target: 'm2-node-ack', animated: true },
    { id: 'm2-e2', source: 'm2-node-ack', target: 'm2-node-ocr', animated: true },
    { id: 'm2-e3', source: 'm2-node-ocr', target: 'm2-node-router', animated: true },
    { id: 'm2-e4-sec', source: 'm2-node-router', sourceHandle: 'secondary', target: 'm2-node-assign-sec', label: 'Secondary / IB', animated: true },
    { id: 'm2-e4-intl', source: 'm2-node-router', sourceHandle: 'boarding', target: 'm2-node-assign-intl', label: 'Boarding / Intl', animated: true }
  ]
};

/**
 * Modular Flow 3: Consolidated Document Verification & SLA Escalation Loop
 */
export const MODULAR_FLOW_3_DOC_VERIFICATION: Workflow = {
  id: 'wf-mod-3-doc-verification',
  name: '3. Consolidated Document Verification & SLA Loop',
  description: 'Single-pass document checklist validation with built-in 48h SLA escalation rule. Avoids frustrating nested branches.',
  category: 'admission',
  workflowType: 'modular_phase',
  emittedEventOnComplete: 'documents.verified',
  version: 1,
  status: 'published',
  createdAt: '2026-08-20T10:00:00.000Z',
  updatedAt: '2026-08-20T10:00:00.000Z',
  tags: ['Modular Phase', 'Phase 3', 'Consolidated SLA'],
  nodes: [
    {
      id: 'm3-node-trigger',
      type: 'trigger',
      position: { x: 300, y: 50 },
      data: {
        label: 'Documents Uploaded by Applicant',
        subtitle: 'Entry Trigger',
        category: 'Trigger',
        phase: 'Phase 3 — Document Verification',
        nodeSubtype: 'docs_uploaded',
        triggerEvent: 'Documents Uploaded',
        formName: 'Mandatory Document Upload Portal',
        description: 'Fires when parent completes upload of mandatory verification documents bundle.'
      }
    },
    {
      id: 'm3-node-consolidated-check',
      type: 'condition',
      position: { x: 300, y: 200 },
      data: {
        label: 'Consolidated Mandatory Documents Check',
        subtitle: 'Single-Pass Verification',
        category: 'Logic',
        phase: 'Phase 3 — Document Verification',
        nodeSubtype: 'boolean_check',
        consolidatedValidationMode: 'single_pass_summary',
        description: 'Evaluates entire document checklist in a single pass instead of frustrating multi-branch checks.',
        documentChecklist: [
          { id: 'doc-birth-cert', name: 'Birth Certificate / Age Proof', mandatory: true, status: 'verified' },
          { id: 'doc-transcripts', name: 'Academic Transcripts (Last 2 Years)', mandatory: true, status: 'verified' },
          { id: 'doc-id-passport', name: 'Parent/Guardian Photo ID', mandatory: true, status: 'verified' },
          { id: 'doc-medical', name: 'Immunization & Health Record', mandatory: false, status: 'pending' }
        ],
        conditionRules: [
          { field: 'applicant.mandatoryDocsValid', operator: 'equals', value: true }
        ],
        branches: [
          { handleId: 'true', label: 'All Mandatory Docs Verified', color: '#10B981', description: 'Single pass success — route to interview' },
          { handleId: 'false', label: 'Missing / Invalid Items (SLA Alert)', color: '#EF4444', description: 'Consolidated alert & staff outreach' }
        ]
      }
    },
    {
      id: 'm3-node-escalate-human',
      type: 'human',
      position: { x: 540, y: 360 },
      data: {
        label: '48h SLA Escalation: Officer Calls Parent',
        subtitle: 'Consolidated Recovery',
        category: 'Human',
        phase: 'Phase 3 — Document Verification',
        nodeSubtype: 'human_decision',
        humanTaskTitle: '48h Document SLA Outreach & Exception Review',
        assignedRole: 'Admissions Officer & Counselor',
        timeoutHours: 48,
        description: 'Admissions counselor contacts parent to resolve blurry scans or grant provisional conditional upload exemption.',
        allowedOutcomes: [
          { actionId: 'resolved', label: 'Parent Uploaded Docs', variant: 'success', nextStatus: 'Documents Verified' },
          { actionId: 'exemption', label: 'Approve Exemption', variant: 'warning', nextStatus: 'Documents Verified' },
          { actionId: 'withdraw', label: 'Mark Inactive', variant: 'danger', nextStatus: 'Withdrawn' }
        ]
      }
    },
    {
      id: 'm3-node-success-action',
      type: 'action',
      position: { x: 180, y: 360 },
      data: {
        label: 'Mark Documents Verified & Notify Faculty',
        subtitle: 'Gate Cleared',
        category: 'Action',
        phase: 'Phase 3 — Document Verification',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: '{{applicant.email}}',
        subject: 'All Admission Documents Verified for {{applicant.name}}',
        bodyContent: 'Dear {{applicant.parentName}},\n\nGreat news! All required documents for {{applicant.name}}\'s Grade {{applicant.grade}} application have been verified and approved.\n\nYour application has been cleared for faculty assessment and interview booking.',
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
    { id: 'm3-e1', source: 'm3-node-trigger', target: 'm3-node-consolidated-check', animated: true },
    { id: 'm3-e2-true', source: 'm3-node-consolidated-check', sourceHandle: 'true', target: 'm3-node-success-action', label: 'Verified Complete', animated: true },
    { id: 'm3-e2-false', source: 'm3-node-consolidated-check', sourceHandle: 'false', target: 'm3-node-escalate-human', label: 'Missing Items SLA', animated: true },
    { id: 'm3-e3-res', source: 'm3-node-escalate-human', sourceHandle: 'resolved', target: 'm3-node-success-action', label: 'Resolved / Exemption', animated: true }
  ]
};

/**
 * Modular Flow 4: Assessment & Interview Scheduling
 */
export const MODULAR_FLOW_4_INTERVIEW: Workflow = {
  id: 'wf-mod-4-interview',
  name: '4. Assessment & Faculty Interview Scheduling',
  description: 'Independent workflow triggered when applicant qualifies for interview. Staff calendar sync, 24h WhatsApp reminder, and structured rubric submission.',
  category: 'admission',
  workflowType: 'modular_phase',
  emittedEventOnComplete: 'interview.completed',
  version: 1,
  status: 'published',
  createdAt: '2026-08-20T10:00:00.000Z',
  updatedAt: '2026-08-20T10:00:00.000Z',
  tags: ['Modular Phase', 'Phase 4', 'Interview'],
  nodes: [
    {
      id: 'm4-node-trigger',
      type: 'trigger',
      position: { x: 300, y: 50 },
      data: {
        label: 'Applicant Qualified for Assessment',
        subtitle: 'Entry Trigger',
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
      position: { x: 300, y: 190 },
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
      position: { x: 300, y: 330 },
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
      position: { x: 300, y: 470 },
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
      position: { x: 300, y: 610 },
      data: {
        label: 'Faculty Conducts Interview & Submits Structured Rubric',
        subtitle: 'Standardized Scoring',
        category: 'Action',
        phase: 'Phase 4 — Assessment & Interview',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: 'faculty-evaluators@toddle.school',
        subject: 'Evaluation Completed: {{applicant.name}} (Grade {{applicant.grade}})',
        bodyContent: 'Faculty assessment complete for {{applicant.name}}. Structured rubric score (92/100) recorded in student dossier. File dispatched to Admissions Committee.',
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
 * Modular Flow 5: Admissions Committee Decision & Offer Generation
 */
export const MODULAR_FLOW_5_COMMITTEE: Workflow = {
  id: 'wf-mod-5-committee-decision',
  name: '5. Admissions Committee Decision & Offer Generation',
  description: 'Committee reviews evaluation rubric and selects outcome (Admit, Waitlist, Conditional, Decline). Generates official PDF offer letter.',
  category: 'admission',
  workflowType: 'modular_phase',
  emittedEventOnComplete: 'offer.generated',
  version: 1,
  status: 'published',
  createdAt: '2026-08-20T10:00:00.000Z',
  updatedAt: '2026-08-20T10:00:00.000Z',
  tags: ['Modular Phase', 'Phase 5', 'Committee & Offer'],
  nodes: [
    {
      id: 'm5-node-trigger',
      type: 'trigger',
      position: { x: 300, y: 50 },
      data: {
        label: 'Interview Rubric Submitted',
        subtitle: 'Entry Trigger',
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
      position: { x: 300, y: 190 },
      data: {
        label: 'Admissions Committee Decision',
        subtitle: 'Human Rubric Review',
        category: 'Human',
        phase: 'Phase 5 — Committee Decision',
        nodeSubtype: 'human_decision',
        humanTaskTitle: 'Review Holistic Evaluation Rubric & Determine Outcome',
        assignedRole: 'Admissions Committee & Academic Head',
        timeoutHours: 72,
        description: 'Committee reviews transcripts, rubric scores, and campus capacity before choosing official outcome.',
        allowedOutcomes: [
          { actionId: 'admit', label: 'Admit Candidate', variant: 'success', nextStatus: 'Offered' },
          { actionId: 'waitlist', label: 'Place on Waitlist', variant: 'warning', nextStatus: 'Waitlisted' },
          { actionId: 'conditional', label: 'Conditional Offer', variant: 'info', nextStatus: 'Conditional Offer' },
          { actionId: 'decline', label: 'Decline Application', variant: 'danger', nextStatus: 'Declined' }
        ]
      }
    },
    {
      id: 'm5-node-action-offer',
      type: 'action',
      position: { x: 180, y: 350 },
      data: {
        label: 'Generate Official Offer PDF & 7-Day Payment Link',
        subtitle: 'Digital Offer Pack',
        category: 'Action',
        phase: 'Phase 5 — Committee Decision',
        nodeSubtype: 'generate_offer_pdf',
        actionService: 'pdf_generator',
        recipient: '{{applicant.email}}',
        subject: 'Official Offer of Admission — Toddle Academy (Ref: {{applicant.id}})',
        bodyContent: 'Dear {{applicant.parentName}},\n\nWe are delighted to extend an official Offer of Admission for {{applicant.name}} into Grade {{applicant.grade}} at Toddle Academy!\n\nPlease review your official offer package and confirm seat deposit within 7 days: https://admissions.toddle.school/offers/{{applicant.id}}',
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
      id: 'm5-node-action-regret',
      type: 'action',
      position: { x: 460, y: 350 },
      data: {
        label: 'Send Empathetic Regret Letter & Preserve Record',
        subtitle: 'Archived for Reapplication',
        category: 'Action',
        phase: 'Phase 5 — Committee Decision',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: '{{applicant.email}}',
        subject: 'Toddle Academy Admission Decision — Application {{applicant.id}}',
        bodyContent: 'Dear {{applicant.parentName}},\n\nThank you for applying to Toddle Academy. Due to high enrollment volume for Grade {{applicant.grade}} at {{applicant.campus}}, we are unable to offer admission at this time.\n\nYour application file remains preserved in our talent pool for future semester openings.',
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
    { id: 'm5-e1', source: 'm5-node-trigger', target: 'm5-node-human-committee', animated: true },
    { id: 'm5-e2-admit', source: 'm5-node-human-committee', sourceHandle: 'admit', target: 'm5-node-action-offer', label: 'Admit / Offer', animated: true },
    { id: 'm5-e2-cond', source: 'm5-node-human-committee', sourceHandle: 'conditional', target: 'm5-node-action-offer', label: 'Conditional', animated: true },
    { id: 'm5-e2-dec', source: 'm5-node-human-committee', sourceHandle: 'decline', target: 'm5-node-action-regret', label: 'Decline', animated: true }
  ]
};

/**
 * Modular Flow 6: Offer Acceptance & Fee Collection Goal Loop
 */
export const MODULAR_FLOW_6_FEE_COLLECTION: Workflow = {
  id: 'wf-mod-6-fee-collection',
  name: '6. Offer Acceptance & Fee Collection Goal Loop',
  description: 'Persistent goal checking fee payment within 7 days. Supports immediate early offline wire payment bypass.',
  category: 'admission',
  workflowType: 'modular_phase',
  emittedEventOnComplete: 'fee.paid',
  version: 1,
  status: 'published',
  createdAt: '2026-08-20T10:00:00.000Z',
  updatedAt: '2026-08-20T10:00:00.000Z',
  tags: ['Modular Phase', 'Phase 6', 'Fee Goal'],
  nodes: [
    {
      id: 'm6-node-trigger',
      type: 'trigger',
      position: { x: 300, y: 50 },
      data: {
        label: 'Offer Generated & Dispatched',
        subtitle: 'Entry Trigger',
        category: 'Trigger',
        phase: 'Phase 6 — Fee Collection & Enrollment',
        nodeSubtype: 'form_submitted',
        triggerEvent: 'Offer Generated',
        formName: 'Official Offer Dispatch Event',
        description: 'Fires when official offer letter is generated and sent to the applicant.'
      }
    },
    {
      id: 'm6-node-goal-fee',
      type: 'goal',
      position: { x: 300, y: 200 },
      data: {
        label: 'Goal: Admission Fee Paid within 7 Days',
        subtitle: 'Persistent Objective Check',
        category: 'Persistent Goal',
        phase: 'Phase 6 — Fee Collection & Enrollment',
        nodeSubtype: 'persistent_goal',
        goalTargetMetric: 'fee_paid',
        goalCheckIntervalHours: 24,
        goalMaxAttempts: 7,
        goalSuccessBehavior: 'continue_workflow',
        goalTimeoutBehavior: 'set_offer_expired',
        goalFastTrackBypass: true,
        description: 'Persistent polling loop monitoring fee clearance. Offline bank wire bypass instantly clears this goal.'
      }
    },
    {
      id: 'm6-node-action-receipt',
      type: 'action',
      position: { x: 180, y: 360 },
      data: {
        label: 'Issue Payment Receipt & Welcome Pack',
        subtitle: 'Payment Confirmed',
        category: 'Action',
        phase: 'Phase 6 — Fee Collection & Enrollment',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: '{{applicant.email}}',
        subject: 'Enrollment Fee Confirmed | Welcome to the Toddle Family!',
        bodyContent: 'Dear {{applicant.parentName}},\n\nWe have received your admission deposit of $1,500 for {{applicant.name}}. Your seat in Grade {{applicant.grade}} is officially confirmed!\n\nReceipt #REC-2026-{{applicant.id}} is available in your parent portal.',
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
      id: 'm6-node-action-expired',
      type: 'action',
      position: { x: 460, y: 360 },
      data: {
        label: 'Mark Offer Expired & Release Seat to Waitlist',
        subtitle: 'Seat Reallocated',
        category: 'Action',
        phase: 'Phase 6 — Fee Collection & Enrollment',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: 'bursar@toddle.school',
        subject: 'Notice: Offer Window Expired for Application {{applicant.id}}',
        bodyContent: 'Admissions & Bursar Desk:\n\nThe 7-day payment window for {{applicant.name}} (Grade {{applicant.grade}}) has elapsed. Candidate marked Expired and seat released to waitlist top candidate.',
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
    { id: 'm6-e1', source: 'm6-node-trigger', target: 'm6-node-goal-fee', animated: true },
    { id: 'm6-e2-paid', source: 'm6-node-goal-fee', sourceHandle: 'success', target: 'm6-node-action-receipt', label: 'Fee Paid', animated: true },
    { id: 'm6-e2-timeout', source: 'm6-node-goal-fee', sourceHandle: 'timeout', target: 'm6-node-action-expired', label: 'Expired', animated: true }
  ]
};

/**
 * Modular Flow 7: Post-Offer Onboarding & LMS Handover
 */
export const MODULAR_FLOW_7_ONBOARDING: Workflow = {
  id: 'wf-mod-7-onboarding-handover',
  name: '7. Post-Offer Onboarding & SIS Handover',
  description: 'Final institutional handover: syncs student profile to SIS ERP, provisions student/parent accounts, and assigns homeroom teacher.',
  category: 'onboarding',
  workflowType: 'modular_phase',
  emittedEventOnComplete: 'student.active_enrolled',
  version: 1,
  status: 'published',
  createdAt: '2026-08-20T10:00:00.000Z',
  updatedAt: '2026-08-20T10:00:00.000Z',
  tags: ['Modular Phase', 'Phase 7', 'SIS Handover'],
  nodes: [
    {
      id: 'm7-node-trigger',
      type: 'trigger',
      position: { x: 300, y: 50 },
      data: {
        label: 'Admission Fee Confirmed',
        subtitle: 'Entry Trigger',
        category: 'Trigger',
        phase: 'Phase 7 — Post-Offer Onboarding & SIS Handover',
        nodeSubtype: 'form_submitted',
        triggerEvent: 'Fee Confirmed',
        formName: 'Finance Deposit Confirmation Hook',
        description: 'Fires when finance department confirms payment receipt.'
      }
    },
    {
      id: 'm7-node-forms',
      type: 'action',
      position: { x: 300, y: 190 },
      data: {
        label: 'Request Medical History & Bus Transport Forms',
        subtitle: 'Onboarding Data Gathering',
        category: 'Action',
        phase: 'Phase 7 — Post-Offer Onboarding & SIS Handover',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: '{{applicant.email}}',
        subject: 'Next Steps: Submit Medical & Bus Transport Details for {{applicant.name}}',
        bodyContent: 'Dear {{applicant.parentName}},\n\nTo prepare for orientation day, please submit {{applicant.name}}\'s immunization records, dietary preferences, and bus transport route selection:\nhttps://admissions.toddle.school/onboarding/{{applicant.id}}',
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
      id: 'm7-node-sis-sync',
      type: 'action',
      position: { x: 300, y: 330 },
      data: {
        label: 'Sync Profile to School SIS / ERP via API',
        subtitle: 'Core SIS Handover',
        category: 'Action',
        phase: 'Phase 7 — Post-Offer Onboarding & SIS Handover',
        nodeSubtype: 'sync_sis',
        actionService: 'sis_sync',
        sisSystemName: 'Toddle Core SIS / PowerSchool ERP',
        sisEndpoint: 'https://api.toddleschool.com/v1/sis/students',
        description: 'Synchronizes confirmed student demographic, medical, and parent contact data into the school ERP.',
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
      id: 'm7-node-provision',
      type: 'system',
      position: { x: 300, y: 470 },
      data: {
        label: 'Provision Accounts, Timetable & Homeroom Teacher',
        subtitle: 'Terminal State — Student Active',
        category: 'System / SIS',
        phase: 'Phase 7 — Post-Offer Onboarding & SIS Handover',
        nodeSubtype: 'system_task',
        sisEndpoint: 'https://api.toddleschool.com/v1/provisioning',
        bodyContent: 'Provision student LMS credentials, assign homeroom teacher, generate student ID card, and schedule first day timetable.',
        description: 'Provisions student portal, assigns homeroom teacher, sends orientation invite, and cancels all nurture reminders.'
      }
    }
  ],
  edges: [
    { id: 'm7-e1', source: 'm7-node-trigger', target: 'm7-node-forms', animated: true },
    { id: 'm7-e2', source: 'm7-node-forms', target: 'm7-node-sis-sync', animated: true },
    { id: 'm7-e3', source: 'm7-node-sis-sync', target: 'm7-node-provision', animated: true }
  ]
};

// ============================================================================
// COMPOSITE SCHOOL BLUEPRINTS (Composed End-to-End Workflows)
// ============================================================================

/**
 * Toddle Flagship Composed 9-Phase Workflow
 */
export const TODDLE_STANDARD_ADMISSION_WORKFLOW: Workflow = {
  id: 'wf-toddle-standard-9phase',
  name: 'Toddle Standard Admission Blueprint (End-to-End Composed)',
  description: 'Full institutional admission process composed across all 7 modular phases from enquiry to SIS active handover.',
  category: 'admission',
  workflowType: 'full_blueprint',
  version: 1,
  status: 'published',
  createdAt: '2026-08-20T10:00:00.000Z',
  updatedAt: '2026-08-20T10:00:00.000Z',
  tags: ['Composed Blueprint', 'Flagship', 'IB / K-12'],
  nodes: [
    {
      id: 'node-p1-trigger',
      type: 'trigger',
      position: { x: 300, y: 50 },
      data: {
        label: 'Enquiry / Application Submitted',
        subtitle: 'Phase 1: Entry Trigger',
        category: 'Trigger',
        phase: 'Phase 1 — Lead Capture & Nurturing',
        nodeSubtype: 'form_submitted',
        triggerEvent: 'Form Submitted',
        formName: 'Toddle Online Application 2026-27',
        description: 'Record becomes trackable lead immediately. Duplicates are linked/merged in CRM.',
        payloadSchema: [
          { key: 'firstName', label: 'First Name', type: 'string', sample: 'Sophia' },
          { key: 'lastName', label: 'Last Name', type: 'string', sample: 'Chen' },
          { key: 'dateOfBirth', label: 'Date of Birth', type: 'date', sample: '2012-04-15' },
          { key: 'email', label: 'Parent Email', type: 'string', sample: 'marcus.chen@example.com' },
          { key: 'phone', label: 'Contact Phone', type: 'string', sample: '+1 (555) 349-2810' },
          { key: 'grade', label: 'Applying Grade', type: 'number', sample: '7' },
          { key: 'campus', label: 'Selected Campus', type: 'string', sample: 'North Valley Campus' }
        ]
      }
    },
    {
      id: 'node-p1-action-prospectus',
      type: 'action',
      position: { x: 300, y: 190 },
      data: {
        label: 'AI Personalized Prospectus & Virtual Tour',
        subtitle: 'Phase 1: Automated Welcome',
        category: 'Action',
        phase: 'Phase 1 — Lead Capture & Nurturing',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: '{{applicant.email}}',
        subject: 'Welcome to Toddle Academy | Prospectus & Campus Tour for {{applicant.name}}',
        bodyContent: 'Dear {{applicant.parentName}},\n\nHere is your AI personalized prospectus and virtual campus tour for Grade {{applicant.grade}} at {{applicant.campus}}.\n\nExplore student life & academic pathways: https://admissions.toddle.school/explore/{{applicant.id}}',
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
      id: 'node-p1-delay-3d',
      type: 'delay',
      position: { x: 300, y: 330 },
      data: {
        label: 'Wait 3 Days (With Early Tour Booking Bypass)',
        subtitle: 'Phase 1: Digest Period',
        category: 'Control',
        phase: 'Phase 1 — Lead Capture & Nurturing',
        nodeSubtype: 'delay_timer',
        delayDuration: 72,
        delayUnit: 'hours',
        delayType: 'fixed_duration',
        allowEarlyActionBypass: true,
        earlyActionEvents: ['tour.booked', 'application.started'],
        description: 'Gives the family time to digest the material. If parent books a tour early, delay is instantly skipped!'
      }
    },
    {
      id: 'node-p2-action-ocr',
      type: 'action',
      position: { x: 300, y: 470 },
      data: {
        label: 'AI OCR Document Scan & Pre-validation',
        subtitle: 'Phase 2: Automated Verification',
        category: 'Action',
        phase: 'Phase 2 — Application Submission & Routing',
        nodeSubtype: 'ai_ocr_scan',
        actionService: 'ocr_scanner',
        description: 'Scans uploaded birth certificate, passport & transcripts via OCR to validate readability and extract student demographics.',
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
      id: 'node-p2-cond-router',
      type: 'condition',
      position: { x: 300, y: 610 },
      data: {
        label: 'Route by Grade Band & Category',
        subtitle: 'Phase 2: Intelligent Routing',
        category: 'Logic',
        phase: 'Phase 2 — Application Submission & Routing',
        nodeSubtype: 'grade_router',
        description: 'Routes applicant to Primary Team, Middle/High IB Coordinator, or International Admissions queue.',
        conditionRules: [
          { field: 'applicant.gradeCategory', operator: 'equals', value: 'Middle / High School' }
        ],
        branches: [
          { handleId: 'primary', label: 'Primary (Gr K-5)', color: '#3B82F6', description: 'Primary Admissions Team' },
          { handleId: 'secondary', label: 'Middle/High (Gr 6-12)', color: '#8B5CF6', description: 'Secondary & IB Coordinator' },
          { handleId: 'boarding', label: 'Boarding / Overseas', color: '#06B6D4', description: 'International Lead' }
        ]
      }
    },
    {
      id: 'node-p3-cond-docs',
      type: 'condition',
      position: { x: 300, y: 770 },
      data: {
        label: 'Consolidated Mandatory Documents Complete?',
        subtitle: 'Phase 3: Single-Pass SLA Verification',
        category: 'Logic',
        phase: 'Phase 3 — Document Verification',
        nodeSubtype: 'boolean_check',
        consolidatedValidationMode: 'single_pass_summary',
        description: 'Consolidated single-pass validation of transcripts, age proof and guardian ID.',
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
      position: { x: 620, y: 770 },
      data: {
        label: '48h SLA Escalation: Officer Calls Parent',
        subtitle: 'Phase 3: Exception Recovery',
        category: 'Human',
        phase: 'Phase 3 — Document Verification',
        nodeSubtype: 'human_decision',
        humanTaskTitle: '48h SLA Document Outreach Call & Exception Review',
        assignedRole: 'Admissions Officer & Counselor',
        timeoutHours: 48,
        description: 'Admissions counselor contacts parent to resolve missing documentation before application expires.',
        allowedOutcomes: [
          { actionId: 'resolved', label: 'Parent Uploaded Docs', variant: 'success', nextStatus: 'Documents Verified' },
          { actionId: 'exception', label: 'Approve Exemption', variant: 'warning', nextStatus: 'Documents Verified' },
          { actionId: 'withdraw', label: 'Mark Inactive', variant: 'danger', nextStatus: 'Withdrawn' }
        ]
      }
    },
    {
      id: 'node-p4-action-calendar',
      type: 'action',
      position: { x: 300, y: 920 },
      data: {
        label: 'Sync Staff Calendar & Self-Booking Link',
        subtitle: 'Phase 4: Frictionless Scheduling',
        category: 'Action',
        phase: 'Phase 4 — Assessment & Interview',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: '{{applicant.email}}',
        subject: 'Book Your Admission Interview Slot for {{applicant.name}}',
        bodyContent: 'Dear {{applicant.parentName}},\n\nPlease select an interview slot with our academic faculty for {{applicant.name}} (Grade {{applicant.grade}}):\nhttps://admissions.toddle.school/schedule/{{applicant.id}}',
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
      id: 'node-p4-action-whatsapp',
      type: 'action',
      position: { x: 300, y: 1060 },
      data: {
        label: '24h Multi-Channel SMS & WhatsApp Reminder',
        subtitle: 'Phase 4: Zero No-Show Safeguard',
        category: 'Action',
        phase: 'Phase 4 — Assessment & Interview',
        nodeSubtype: 'send_whatsapp',
        actionService: 'whatsapp',
        recipient: '{{applicant.parentPhone}}',
        subject: '24h Interview Reminder: Tomorrow at Toddle Academy',
        bodyContent: 'Reminder: Interview for {{applicant.name}} is tomorrow at 10:00 AM. Campus gate map: https://toddle.school/map',
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
      id: 'node-p5-human-committee',
      type: 'human',
      position: { x: 300, y: 1200 },
      data: {
        label: 'Admissions Committee Decision',
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
          { actionId: 'waitlist', label: 'Place on Waitlist', variant: 'warning', nextStatus: 'Waitlisted' },
          { actionId: 'conditional', label: 'Conditional Offer', variant: 'info', nextStatus: 'Conditional Offer' },
          { actionId: 'decline', label: 'Decline Application', variant: 'danger', nextStatus: 'Declined' }
        ]
      }
    },
    {
      id: 'node-p7-action-offerpdf',
      type: 'action',
      position: { x: 300, y: 1360 },
      data: {
        label: 'Send Official Offer PDF & Payment Link',
        subtitle: 'Phase 7: Digital Offer Pack',
        category: 'Action',
        phase: 'Phase 7 — Offer & Fee Reminders',
        nodeSubtype: 'generate_offer_pdf',
        actionService: 'pdf_generator',
        recipient: '{{applicant.email}}',
        subject: 'Official Offer of Admission — Toddle Academy (Ref: {{applicant.id}})',
        bodyContent: 'Dear {{applicant.parentName}},\n\nCongratulations! We are delighted to offer {{applicant.name}} admission into Grade {{applicant.grade}} at Toddle Academy.\n\nReview your offer letter and secure your seat: https://admissions.toddle.school/offers/{{applicant.id}}',
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
      id: 'node-p7-goal-fee',
      type: 'goal',
      position: { x: 300, y: 1500 },
      data: {
        label: 'Goal: Admission Fee Paid within 7 Days',
        subtitle: 'Phase 7: Persistent Objective',
        category: 'Persistent Goal',
        phase: 'Phase 7 — Offer & Fee Reminders',
        nodeSubtype: 'persistent_goal',
        goalTargetMetric: 'fee_paid',
        goalCheckIntervalHours: 24,
        goalMaxAttempts: 7,
        goalSuccessBehavior: 'continue_workflow',
        goalTimeoutBehavior: 'set_offer_expired',
        goalFastTrackBypass: true,
        description: 'Persistent loop checking fee payment. Offline wire bypass instantly clears this goal.'
      }
    },
    {
      id: 'node-p8-action-welcome',
      type: 'action',
      position: { x: 300, y: 1660 },
      data: {
        label: 'Payment Receipt, Medical & Transport Pack',
        subtitle: 'Phase 8: Post-Offer Onboarding',
        category: 'Action',
        phase: 'Phase 8 — Post-Offer Onboarding',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: '{{applicant.email}}',
        subject: 'Welcome to the Family! Complete Medical & Transport Details',
        bodyContent: 'Congratulations! Your enrollment fee has been confirmed for {{applicant.name}}. Please complete student medical history and bus transport forms: https://admissions.toddle.school/onboarding/{{applicant.id}}',
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
      id: 'node-p9-action-sis',
      type: 'action',
      position: { x: 300, y: 1800 },
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
      id: 'node-p9-system-provision',
      type: 'system',
      position: { x: 300, y: 1940 },
      data: {
        label: 'Provision Accounts, Timetable & Nurse Notification',
        subtitle: 'Phase 9: Terminal State — Student Active',
        category: 'System / SIS',
        phase: 'Phase 9 — LMS & SIS Handover',
        nodeSubtype: 'system_task',
        sisEndpoint: 'https://api.toddleschool.com/v1/provisioning',
        bodyContent: 'Provision student LMS credentials, assign homeroom teacher, and schedule first day timetable.',
        description: 'Provisions student portal, assigns homeroom teacher, sends orientation invite, and cancels all reminders.'
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
    { id: 'e6-false', source: 'node-p3-cond-docs', sourceHandle: 'false', target: 'node-p3-human-escalate', label: 'FALSE / SLA Alert', animated: true },
    { id: 'e-escalate-resolved', source: 'node-p3-human-escalate', sourceHandle: 'resolved', target: 'node-p4-action-calendar', label: 'Resolved / Uploaded', animated: true },
    { id: 'e7', source: 'node-p4-action-calendar', target: 'node-p4-action-whatsapp', animated: true },
    { id: 'e8', source: 'node-p4-action-whatsapp', target: 'node-p5-human-committee', animated: true },
    { id: 'e9-admit', source: 'node-p5-human-committee', sourceHandle: 'admit', target: 'node-p7-action-offerpdf', label: 'Admit Candidate', animated: true },
    { id: 'e9-conditional', source: 'node-p5-human-committee', sourceHandle: 'conditional', target: 'node-p7-action-offerpdf', label: 'Conditional Offer', animated: true },
    { id: 'e10', source: 'node-p7-action-offerpdf', target: 'node-p7-goal-fee', animated: true },
    { id: 'e11-paid', source: 'node-p7-goal-fee', sourceHandle: 'success', target: 'node-p8-action-welcome', label: 'Fee Paid (Goal Met)', animated: true },
    { id: 'e12', source: 'node-p8-action-welcome', target: 'node-p9-action-sis', animated: true },
    { id: 'e13', source: 'node-p9-action-sis', target: 'node-p9-system-provision', animated: true }
  ]
};

/**
 * Simplified Fast-Track Admission (School B Example)
 */
export const SIMPLIFIED_ADMISSION_WORKFLOW: Workflow = {
  id: 'wf-simplified-fasttrack',
  name: 'Simplified Fast-Track Admission (School B)',
  description: 'Streamlined admission flow omitting interview and committee reviews. Direct eligibility check to fee payment and enrollment.',
  category: 'admission',
  workflowType: 'full_blueprint',
  version: 1,
  status: 'draft',
  createdAt: '2026-08-20T10:00:00.000Z',
  updatedAt: '2026-08-20T10:00:00.000Z',
  tags: ['Simplified', 'No Interview', 'Direct'],
  nodes: [
    {
      id: 'simp-node-1',
      type: 'trigger',
      position: { x: 300, y: 50 },
      data: {
        label: 'Application Submitted',
        subtitle: 'Fast-Track Trigger',
        category: 'Trigger',
        phase: 'Phase 1 — Fast-Track Application',
        nodeSubtype: 'form_submitted',
        triggerEvent: 'Form Submitted',
        formName: 'Quick Apply 2026 Portal',
        description: 'Fires when parent submits streamlined 2-minute application.'
      }
    },
    {
      id: 'simp-node-2',
      type: 'condition',
      position: { x: 300, y: 200 },
      data: {
        label: 'Automatic Eligibility Check',
        subtitle: 'Grade & Age Verification',
        category: 'Logic',
        phase: 'Phase 1 — Fast-Track Application',
        nodeSubtype: 'boolean_check',
        description: 'Auto-validates student age and grade eligibility criteria.',
        conditionRules: [
          { field: 'applicant.grade', operator: 'greater_than_or_equal', value: 1 }
        ],
        branches: [
          { handleId: 'true', label: 'Eligible', color: '#10B981', description: 'Candidate satisfies criteria' },
          { handleId: 'false', label: 'Ineligible', color: '#EF4444', description: 'Does not satisfy age criteria' }
        ]
      }
    },
    {
      id: 'simp-node-3',
      type: 'action',
      position: { x: 300, y: 360 },
      data: {
        label: 'Send Instant Offer & Fee Link',
        subtitle: 'Automated Acceptance',
        category: 'Action',
        phase: 'Phase 2 — Direct Offer',
        nodeSubtype: 'send_email',
        actionService: 'email',
        recipient: '{{applicant.email}}',
        subject: 'Congratulations! Instant Admission Offer for {{applicant.name}}',
        bodyContent: 'Dear {{applicant.parentName}},\n\nCongratulations! {{applicant.name}} has been instantly accepted for Grade {{applicant.grade}}.\n\nConfirm your enrollment: https://admissions.toddle.school/pay/{{applicant.id}}',
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
      id: 'simp-node-4',
      type: 'goal',
      position: { x: 300, y: 510 },
      data: {
        label: 'Goal: Fee Payment Completed',
        subtitle: 'Payment Verification',
        category: 'Persistent Goal',
        phase: 'Phase 3 — Fee Clearance',
        nodeSubtype: 'persistent_goal',
        goalTargetMetric: 'fee_paid',
        goalCheckIntervalHours: 24,
        goalMaxAttempts: 5,
        goalFastTrackBypass: true,
        description: 'Checks fee confirmation within 5 days.'
      }
    },
    {
      id: 'simp-node-5',
      type: 'action',
      position: { x: 300, y: 660 },
      data: {
        label: 'Sync to SIS & Confirm Enrollment',
        subtitle: 'Final Handover',
        category: 'Action',
        phase: 'Phase 4 — SIS Handover',
        nodeSubtype: 'sync_sis',
        actionService: 'sis_sync',
        sisSystemName: 'Toddle Core SIS',
        sisEndpoint: 'https://api.toddleschool.com/v1/sis/students',
        fieldMappings: [
          { sourceField: 'firstName', targetField: 'first_name', transform: 'none' },
          { sourceField: 'lastName', targetField: 'last_name', transform: 'none' },
          { sourceField: 'email', targetField: 'student_email', transform: 'lowercase' },
          { sourceField: 'grade', targetField: 'enrolled_grade', transform: 'to_number' }
        ]
      }
    }
  ],
  edges: [
    { id: 'se1', source: 'simp-node-1', target: 'simp-node-2', animated: true },
    { id: 'se2-true', source: 'simp-node-2', sourceHandle: 'true', target: 'simp-node-3', label: 'Eligible', animated: true },
    { id: 'se3', source: 'simp-node-3', target: 'simp-node-4', animated: true },
    { id: 'se4-paid', source: 'simp-node-4', sourceHandle: 'success', target: 'simp-node-5', label: 'Fee Paid', animated: true }
  ]
};

/**
 * International Boarding Student Admission Workflow
 */
export const INTERNATIONAL_ADMISSION_WORKFLOW: Workflow = {
  id: 'wf-international-boarding',
  name: 'International & Boarding Admission Workflow',
  description: 'Specialized flow including passport/visa verification, English proficiency checks, international counselor review, and boarding deposit goal.',
  category: 'admission',
  workflowType: 'full_blueprint',
  version: 2,
  status: 'draft',
  createdAt: '2026-08-20T10:00:00.000Z',
  updatedAt: '2026-08-20T10:00:00.000Z',
  tags: ['International', 'Visa Support', 'Boarding'],
  nodes: [
    {
      id: 'intl-node-1',
      type: 'trigger',
      position: { x: 300, y: 50 },
      data: {
        label: 'International Application Submitted',
        subtitle: 'Global Portal Entry',
        category: 'Trigger',
        phase: 'Phase 1 — International Intake',
        nodeSubtype: 'form_submitted',
        triggerEvent: 'Form Submitted',
        formName: 'Global International & Boarding Application 2026',
        description: 'Fires when non-resident or international boarding student applies.'
      }
    },
    {
      id: 'intl-node-2',
      type: 'action',
      position: { x: 300, y: 190 },
      data: {
        label: 'OCR Passport & Visa Verification',
        subtitle: 'Immigration Pre-check',
        category: 'Action',
        phase: 'Phase 2 — Immigration Pre-check',
        nodeSubtype: 'ai_ocr_scan',
        actionService: 'ocr_scanner',
        description: 'Extracts passport expiry date, nationality, and visa status.'
      }
    },
    {
      id: 'intl-node-3',
      type: 'human',
      position: { x: 300, y: 330 },
      data: {
        label: 'International Admissions Lead Review',
        subtitle: 'Visa & Language Evaluation',
        category: 'Human',
        phase: 'Phase 3 — International Lead Review',
        nodeSubtype: 'human_decision',
        humanTaskTitle: 'International Candidate Dossier & Visa Rubric Review',
        assignedRole: 'International Admissions Lead',
        timeoutHours: 48,
        description: 'Specialist counselor verifies boarding availability and student visa eligibility.',
        allowedOutcomes: [
          { actionId: 'approve', label: 'Approve & Issue Offer', variant: 'success', nextStatus: 'Offer Issued' },
          { actionId: 'interview_required', label: 'Schedule English Interview', variant: 'info', nextStatus: 'Interview Needed' },
          { actionId: 'reject', label: 'Reject Visa / Eligibility', variant: 'danger', nextStatus: 'Declined' }
        ]
      }
    },
    {
      id: 'intl-node-4',
      type: 'goal',
      position: { x: 300, y: 480 },
      data: {
        label: 'Goal: Boarding Deposit Paid',
        subtitle: 'International Wire Verification',
        category: 'Persistent Goal',
        phase: 'Phase 4 — Boarding Deposit',
        nodeSubtype: 'persistent_goal',
        goalTargetMetric: 'fee_paid',
        goalCheckIntervalHours: 24,
        goalMaxAttempts: 10,
        goalFastTrackBypass: true,
        description: 'Monitors international bank wire / flywire payment deposit.'
      }
    },
    {
      id: 'intl-node-5',
      type: 'action',
      position: { x: 300, y: 630 },
      data: {
        label: 'Sync to SIS & Issue I-20 / Visa Letter',
        subtitle: 'Final Immigration Pack',
        category: 'Action',
        phase: 'Phase 5 — Visa & SIS Provisioning',
        nodeSubtype: 'sync_sis',
        actionService: 'sis_sync',
        recipient: '{{applicant.email}}',
        subject: 'Form I-20 / Visa Sponsorship Letter Issued for {{applicant.name}}',
        bodyContent: 'Dear {{applicant.parentName}},\n\nYour boarding deposit has cleared! Attached is the official Form I-20 and visa support package for {{applicant.name}}.',
        sisEndpoint: 'https://api.toddleschool.com/v1/sis/international',
        fieldMappings: [
          { sourceField: 'firstName', targetField: 'first_name', transform: 'none' },
          { sourceField: 'lastName', targetField: 'last_name', transform: 'none' },
          { sourceField: 'nationality', targetField: 'citizenship_country', transform: 'none' },
          { sourceField: 'grade', targetField: 'enrolled_grade', transform: 'to_number' }
        ]
      }
    }
  ],
  edges: [
    { id: 'ie1', source: 'intl-node-1', target: 'intl-node-2', animated: true },
    { id: 'ie2', source: 'intl-node-2', target: 'intl-node-3', animated: true },
    { id: 'ie3-app', source: 'intl-node-3', sourceHandle: 'approve', target: 'intl-node-4', label: 'Approved', animated: true },
    { id: 'ie4-paid', source: 'intl-node-4', sourceHandle: 'success', target: 'intl-node-5', label: 'Deposit Cleared', animated: true }
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

export const INITIAL_WORKFLOWS: Workflow[] = [
  // Flagship Composed
  TODDLE_STANDARD_ADMISSION_WORKFLOW,
  
  // 7 Decoupled Modular Flows
  MODULAR_FLOW_1_LEAD_CAPTURE,
  MODULAR_FLOW_2_APP_SUBMISSION,
  MODULAR_FLOW_3_DOC_VERIFICATION,
  MODULAR_FLOW_4_INTERVIEW,
  MODULAR_FLOW_5_COMMITTEE,
  MODULAR_FLOW_6_FEE_COLLECTION,
  MODULAR_FLOW_7_ONBOARDING,

  // Alternative School Scenarios
  SIMPLIFIED_ADMISSION_WORKFLOW,
  INTERNATIONAL_ADMISSION_WORKFLOW
];

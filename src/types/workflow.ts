export type NodeType =
  | 'trigger'
  | 'action'
  | 'condition'
  | 'delay'
  | 'human'
  | 'goal'
  | 'system';

export type NodeCategory =
  | 'Trigger'
  | 'Action'
  | 'Logic'
  | 'Control'
  | 'Human'
  | 'Persistent Goal'
  | 'System / SIS';

export type WorkflowStatus = 'draft' | 'published' | 'archived';

export type WorkflowType = 'modular_phase' | 'full_blueprint' | 'custom';

export type ExecutionNodeStatus =
  | 'idle'
  | 'running'
  | 'completed'
  | 'failed'
  | 'waiting'
  | 'skipped';

export interface EdgeCondition {
  field?: string;
  operator?:
    | 'equals'
    | 'not_equals'
    | 'greater_than'
    | 'less_than'
    | 'greater_than_or_equal'
    | 'less_than_or_equal'
    | 'contains'
    | 'is_empty'
    | 'is_not_empty';
  value?: string | number | boolean;
  branchLabel?: string; // 'TRUE' | 'FALSE' | 'Admit' | 'Waitlist' | 'Conditional' | 'Decline' etc.
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  animated?: boolean;
  condition?: EdgeCondition;
  style?: Record<string, unknown>;
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transform?: 'none' | 'uppercase' | 'lowercase' | 'format_date' | 'to_number';
}

export interface NodeRetryPolicy {
  enabled: boolean;
  maxRetries: number;
  retryDelaySeconds: number;
  backoff: 'fixed' | 'exponential';
  onFinalFailure: 'stop_workflow' | 'route_to_fallback' | 'ignore';
}

export interface DocumentCheckItem {
  id: string;
  name: string;
  mandatory: boolean;
  status: 'pending' | 'verified' | 'rejected' | 'missing';
}

export interface NodeData {
  // Visual & Presentation
  label: string;
  subtitle?: string;
  iconName?: string;
  category: NodeCategory;
  phase?: string; // 'Phase 1 - Lead Capture', 'Phase 2 - Staff Routing', etc.
  description?: string;

  // Specific Node Configurations
  nodeSubtype?: string;

  // Trigger Config
  triggerEvent?: string;
  formName?: string;
  incomingEventType?: string; // e.g. 'application.submitted', 'docs.verified', 'offer.accepted'
  payloadSchema?: Array<{ key: string; label: string; type: string; sample: string }>;

  // Action Config
  actionService?: 'email' | 'whatsapp' | 'sms' | 'ocr_scanner' | 'pdf_generator' | 'sis_sync' | 'task_creator' | 'webhook';
  recipient?: string;
  templateId?: string;
  subject?: string;
  bodyContent?: string;
  sisEndpoint?: string;
  sisSystemName?: string;
  fieldMappings?: FieldMapping[];

  // Consolidated Document Checklist (Interview Feedback: Single pass validation without frustrating branches)
  documentChecklist?: DocumentCheckItem[];
  consolidatedValidationMode?: 'single_pass_summary' | 'individual_checks';

  // Condition / Logic Config
  conditionRules?: Array<{
    field: string;
    operator: string;
    value: string | number | boolean;
  }>;
  branches?: Array<{
    handleId: string;
    label: string;
    color?: string;
    description?: string;
  }>;

  // Delay Config (Interview Feedback: Early Action & Delay Cancellation)
  delayDuration?: number;
  delayUnit?: 'seconds' | 'minutes' | 'hours' | 'days';
  delayType?: 'fixed_duration' | 'date_anchored' | 'business_hours' | 'sla_window';
  dateAnchorOffset?: string;
  slaEscalationAction?: string;
  earlyActionEvents?: string[]; // Events that immediately cancel/skip delay (e.g. 'tour.booked', 'form.submitted')
  allowEarlyActionBypass?: boolean;

  // Human Intervention Config
  humanTaskTitle?: string;
  assignedRole?: string;
  timeoutHours?: number;
  allowedOutcomes?: Array<{
    actionId: string;
    label: string;
    variant: 'success' | 'warning' | 'danger' | 'info';
    nextStatus?: string;
  }>;

  // Goal Node Config
  goalTargetMetric?: string;
  goalCheckIntervalHours?: number;
  goalMaxAttempts?: number;
  goalSuccessBehavior?: 'continue_workflow' | 'promote_to_enrolled';
  goalTimeoutBehavior?: 'send_escalated_reminder' | 'set_offer_expired';
  goalFastTrackBypass?: boolean;

  // Async & Retry Config
  retryPolicy?: NodeRetryPolicy;
  mockSimulateFailure?: boolean;

  // Runtime State (attached during execution)
  executionStatus?: ExecutionNodeStatus;
  executionError?: string;
  executionOutput?: Record<string, unknown>;
  executionAttempts?: number;
  executionDurationMs?: number;
  executedAt?: string;

  // Validation State
  validationErrors?: string[];
  isConfigured?: boolean;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: {
    x: number;
    y: number;
  };
  data: NodeData;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: 'admission' | 'enquiry' | 'onboarding' | 'custom';
  workflowType?: WorkflowType; // 'modular_phase' | 'full_blueprint' | 'custom'
  emittedEventOnComplete?: string; // Event emitted when this modular flow finishes (e.g. 'lead.qualified', 'docs.verified')
  version: number;
  status: WorkflowStatus;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface ValidationIssue {
  id: string;
  nodeId?: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  field?: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
}

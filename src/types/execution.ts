import { WorkflowNode } from './workflow';

export type OverallExecutionStatus =
  | 'idle'
  | 'running'
  | 'paused_human'
  | 'paused_delay'
  | 'paused_goal'
  | 'completed'
  | 'failed'
  | 'stopped';

export interface ApplicantProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  grade: number;
  gradeCategory: 'Early Years' | 'Primary' | 'Middle / High School' | 'Boarding / Overseas' | 'Financial Aid';
  nationality: string;
  campus: string;
  parentName: string;
  parentPhone: string;
  applicationStatus: string;
  documentsUploaded: boolean;
  mandatoryDocsValid: boolean;
  interviewScore?: number;
  committeeDecision?: 'Admit' | 'Waitlist' | 'Conditional Offer' | 'Decline';
  feePaid: boolean;
  paymentMethod?: 'online_card' | 'offline_bank_wire';
  onboardingFormsComplete: boolean;
  studentIdGenerated?: string;
  sisSynced?: boolean;
  assignedTeacher?: string;
  tourBooked?: boolean;
  earlyActionTriggered?: boolean;
}

export interface ExecutionEventLog {
  id: string;
  timestamp: string;
  nodeId: string;
  nodeLabel: string;
  nodeType: string;
  status: 'started' | 'success' | 'failed' | 'waiting' | 'skipped' | 'retrying';
  message: string;
  payload?: Record<string, unknown>;
  durationMs?: number;
}

export interface ExecutionContext {
  executionId: string;
  workflowId: string;
  status: OverallExecutionStatus;
  currentNodeId: string | null;
  applicant: ApplicantProfile;
  variables: Record<string, unknown>;
  history: ExecutionEventLog[];
  activeGoalAttempts: Record<string, number>;
  activeDelays: Record<string, { remainingSeconds: number; timerId?: number }>;
  waitingHumanNodeId: string | null;
  waitingGoalNodeId: string | null;
  waitingDelayNodeId: string | null;
  emittedEvents: string[];
  nextRecommendedWorkflowId?: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export interface ExecutionSpeedOption {
  label: string;
  value: number;
}

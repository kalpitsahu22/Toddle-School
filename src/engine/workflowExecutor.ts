import { Workflow, WorkflowNode, WorkflowEdge } from '../types/workflow';
import { ApplicantProfile, ExecutionContext, ExecutionEventLog } from '../types/execution';
import { executeNode, NodeExecutionResult } from './nodeExecutor';

export const DEFAULT_MOCK_APPLICANTS: Record<string, ApplicantProfile> = {
  standard_middle_high: {
    id: 'APP-2026-8492',
    name: 'Sophia Chen',
    email: 'marcus.chen@example.com',
    phone: '+1 (555) 349-2810',
    dateOfBirth: '2012-04-15',
    grade: 7,
    gradeCategory: 'Middle / High School',
    nationality: 'United States',
    campus: 'North Valley Campus',
    parentName: 'Marcus Chen',
    parentPhone: '+1 (555) 349-2811',
    applicationStatus: 'New Enquiry',
    documentsUploaded: true,
    mandatoryDocsValid: true,
    interviewScore: 92,
    feePaid: false,
    onboardingFormsComplete: true
  },
  primary_applicant: {
    id: 'APP-2026-3104',
    name: 'Lucas Miller',
    email: 'sarah.miller@example.com',
    phone: '+1 (555) 892-1049',
    dateOfBirth: '2017-08-20',
    grade: 3,
    gradeCategory: 'Primary',
    nationality: 'United States',
    campus: 'Lakeside Campus',
    parentName: 'Sarah Miller',
    parentPhone: '+1 (555) 892-1050',
    applicationStatus: 'New Enquiry',
    documentsUploaded: true,
    mandatoryDocsValid: true,
    feePaid: false,
    onboardingFormsComplete: true
  },
  international_boarding: {
    id: 'APP-2026-9021',
    name: 'Alexander Tanaka',
    email: 'tanaka.family@example.jp',
    phone: '+81 90 1234 5678',
    dateOfBirth: '2010-11-03',
    grade: 9,
    gradeCategory: 'Boarding / Overseas',
    nationality: 'Japan',
    campus: 'International Boarding Academy',
    parentName: 'Kenji Tanaka',
    parentPhone: '+81 90 1234 5679',
    applicationStatus: 'New Enquiry',
    documentsUploaded: true,
    mandatoryDocsValid: true,
    interviewScore: 88,
    feePaid: false,
    onboardingFormsComplete: true
  },
  missing_docs_scenario: {
    id: 'APP-2026-4412',
    name: 'Emma Watson-Davis',
    email: 'watsondavis@example.com',
    phone: '+1 (555) 441-2900',
    dateOfBirth: '2013-02-19',
    grade: 6,
    gradeCategory: 'Middle / High School',
    nationality: 'United Kingdom',
    campus: 'North Valley Campus',
    parentName: 'David Watson',
    parentPhone: '+1 (555) 441-2901',
    applicationStatus: 'New Enquiry',
    documentsUploaded: false,
    mandatoryDocsValid: false, // Triggers SLA escalation loop!
    feePaid: false,
    onboardingFormsComplete: false
  },
  offline_bank_wire: {
    id: 'APP-2026-7782',
    name: 'Rohan Sharma',
    email: 'rajesh.sharma@example.in',
    phone: '+91 98765 43210',
    dateOfBirth: '2011-06-12',
    grade: 8,
    gradeCategory: 'Middle / High School',
    nationality: 'India',
    campus: 'Central Campus',
    parentName: 'Rajesh Sharma',
    parentPhone: '+91 98765 43211',
    applicationStatus: 'New Enquiry',
    documentsUploaded: true,
    mandatoryDocsValid: true,
    interviewScore: 95,
    feePaid: true, // Manual offline bank wire bypass
    paymentMethod: 'offline_bank_wire',
    onboardingFormsComplete: true
  }
};

export function findNextNodes(
  currentNodeId: string,
  outgoingHandleId: string | undefined,
  workflow: Workflow
): WorkflowNode[] {
  const outgoingEdges = workflow.edges.filter((edge) => {
    if (edge.source !== currentNodeId) return false;
    // If a specific handle was produced (e.g. 'true', 'secondary', 'admit', 'success'), match it
    if (outgoingHandleId && edge.sourceHandle) {
      return edge.sourceHandle === outgoingHandleId;
    }
    return true;
  });

  const targetNodeIds = new Set(outgoingEdges.map((e) => e.target));
  return workflow.nodes.filter((node) => targetNodeIds.has(node.id));
}

export function createInitialExecutionContext(
  workflowId: string,
  applicantKey: string = 'standard_middle_high'
): ExecutionContext {
  const applicant = JSON.parse(
    JSON.stringify(DEFAULT_MOCK_APPLICANTS[applicantKey] || DEFAULT_MOCK_APPLICANTS.standard_middle_high)
  );

  return {
    executionId: `exec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    workflowId,
    status: 'idle',
    currentNodeId: null,
    applicant,
    variables: {
      admissionCycle: '2026-2027 Fall',
      schoolCode: 'TODDLE-ACADEMY-01',
      bursarEscalationHours: 48,
      leadSource: 'Website Application Portal'
    },
    history: [],
    activeGoalAttempts: {},
    activeDelays: {},
    waitingHumanNodeId: null,
    waitingGoalNodeId: null,
    waitingDelayNodeId: null,
    emittedEvents: [],
    startedAt: new Date().toISOString()
  };
}

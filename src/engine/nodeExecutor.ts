import { WorkflowNode } from '../types/workflow';
import { ApplicantProfile, ExecutionEventLog } from '../types/execution';

export interface NodeExecutionResult {
  status: 'success' | 'failed' | 'waiting' | 'skipped';
  outgoingHandleId?: string;
  updatedApplicant?: Partial<ApplicantProfile>;
  updatedVariables?: Record<string, unknown>;
  log: ExecutionEventLog;
  pauseReason?: 'human_decision' | 'delay_timer' | 'goal_pending';
  error?: string;
}

// Helper to replace template tags like {{applicant.name}} with real data
export function interpolateVariables(template: string, applicant: ApplicantProfile, variables: Record<string, unknown> = {}): string {
  if (!template) return '';
  const applicantRecord = applicant as unknown as Record<string, unknown>;
  return template.replace(/\{\{([^}]+)\}\}/g, (_, path: string) => {
    const trimmed = path.trim();
    if (trimmed.startsWith('applicant.')) {
      const field = trimmed.replace('applicant.', '');
      return applicantRecord[field] !== undefined
        ? String(applicantRecord[field])
        : `{{${trimmed}}}`;
    }
    if (variables[trimmed] !== undefined) {
      return String(variables[trimmed]);
    }
    return `{{${trimmed}}}`;
  });
}

// Helper to safely evaluate condition operators
export function evaluateCondition(
  fieldValue: unknown,
  operator: string,
  targetValue: unknown
): boolean {
  if (fieldValue === undefined || fieldValue === null) {
    if (operator === 'is_empty') return true;
    if (operator === 'is_not_empty') return false;
    return false;
  }

  const strField = String(fieldValue).toLowerCase().trim();
  const strTarget = String(targetValue).toLowerCase().trim();
  const numField = Number(fieldValue);
  const numTarget = Number(targetValue);

  switch (operator) {
    case 'equals':
      return strField === strTarget;
    case 'not_equals':
      return strField !== strTarget;
    case 'greater_than':
      return !isNaN(numField) && !isNaN(numTarget) && numField > numTarget;
    case 'less_than':
      return !isNaN(numField) && !isNaN(numTarget) && numField < numTarget;
    case 'greater_than_or_equal':
      return !isNaN(numField) && !isNaN(numTarget) && numField >= numTarget;
    case 'less_than_or_equal':
      return !isNaN(numField) && !isNaN(numTarget) && numField <= numTarget;
    case 'contains':
      return strField.includes(strTarget);
    case 'is_empty':
      return strField === '';
    case 'is_not_empty':
      return strField !== '';
    default:
      return strField === strTarget;
  }
}

export async function executeNode(
  node: WorkflowNode,
  applicant: ApplicantProfile,
  variables: Record<string, unknown>,
  options: {
    humanDecisionChoice?: string;
    goalCurrentAttempt?: number;
    forceGoalSatisfied?: boolean;
    simulateFailure?: boolean;
    earlyActionTriggered?: boolean;
  } = {}
): Promise<NodeExecutionResult> {
  const timestamp = new Date().toLocaleTimeString();
  const baseLog: Omit<ExecutionEventLog, 'id' | 'status' | 'message'> = {
    timestamp,
    nodeId: node.id,
    nodeLabel: node.data.label,
    nodeType: node.type
  };

  const { data } = node;

  // 1. TRIGGER NODE
  if (node.type === 'trigger') {
    return {
      status: 'success',
      outgoingHandleId: 'source',
      updatedApplicant: {
        applicationStatus: 'Applied'
      },
      log: {
        ...baseLog,
        id: `log-${Date.now()}-${Math.random()}`,
        status: 'success',
        message: `Trigger activated: [${data.triggerEvent || 'Form Submitted'}] for ${applicant.name} (Grade ${applicant.grade}).`
      }
    };
  }

  // 2. ACTION NODE
  if (node.type === 'action') {
    // Check if simulation failure requested or node configured to fail
    if (options.simulateFailure || data.mockSimulateFailure) {
      return {
        status: 'failed',
        error: 'Simulated API Network Timeout (504 Gateway Timeout)',
        log: {
          ...baseLog,
          id: `log-${Date.now()}-${Math.random()}`,
          status: 'failed',
          message: `Action Failed: ${data.label} (504 Gateway Timeout). Retry policy triggered.`
        }
      };
    }

    if (data.actionService === 'email') {
      const recipient = interpolateVariables(data.recipient || '', applicant, variables);
      const subject = interpolateVariables(data.subject || '', applicant, variables);
      return {
        status: 'success',
        outgoingHandleId: 'source',
        log: {
          ...baseLog,
          id: `log-${Date.now()}-${Math.random()}`,
          status: 'success',
          message: `Email dispatched to ${recipient}: "${subject}"`,
          payload: { recipient, subject }
        }
      };
    }

    if (data.actionService === 'whatsapp' || data.actionService === 'sms') {
      const recipient = interpolateVariables(data.recipient || '', applicant, variables);
      return {
        status: 'success',
        outgoingHandleId: 'source',
        log: {
          ...baseLog,
          id: `log-${Date.now()}-${Math.random()}`,
          status: 'success',
          message: `WhatsApp/SMS sent to ${recipient}: "${data.subject || 'Reminder notification'}"`,
          payload: { recipient }
        }
      };
    }

    if (data.actionService === 'ocr_scanner') {
      const valid = applicant.mandatoryDocsValid;
      return {
        status: 'success',
        outgoingHandleId: 'source',
        updatedApplicant: {
          documentsUploaded: true
        },
        log: {
          ...baseLog,
          id: `log-${Date.now()}-${Math.random()}`,
          status: 'success',
          message: `AI OCR completed scan of 4 documents: Passports, Transcripts, Proof of Age. Result: ${valid ? 'Valid & Legible' : 'Requires Review'}.`,
          payload: { ocrConfidence: 0.98, documentsScanned: 4 }
        }
      };
    }

    if (data.actionService === 'pdf_generator') {
      return {
        status: 'success',
        outgoingHandleId: 'source',
        updatedApplicant: {
          applicationStatus: 'Offer Generated'
        },
        log: {
          ...baseLog,
          id: `log-${Date.now()}-${Math.random()}`,
          status: 'success',
          message: `Official Offer Letter PDF generated with dynamic secure 7-day payment link attached.`,
          payload: { offerLetterUrl: `https://toddle.school/offers/${applicant.id}.pdf` }
        }
      };
    }

    if (data.actionService === 'sis_sync') {
      const generatedSisId = `TOD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      return {
        status: 'success',
        outgoingHandleId: 'source',
        updatedApplicant: {
          sisSynced: true,
          studentIdGenerated: generatedSisId,
          applicationStatus: 'Enrolled & Active'
        },
        log: {
          ...baseLog,
          id: `log-${Date.now()}-${Math.random()}`,
          status: 'success',
          message: `Synced record to ${data.sisSystemName || 'Toddle SIS ERP'}. Assigned Student ID: ${generatedSisId}.`,
          payload: { sisStudentId: generatedSisId, endpoint: data.sisEndpoint }
        }
      };
    }

    // Default action fallback
    return {
      status: 'success',
      outgoingHandleId: 'source',
      log: {
        ...baseLog,
        id: `log-${Date.now()}-${Math.random()}`,
        status: 'success',
        message: `Executed action: ${data.label}`
      }
    };
  }

  // 3. CONDITION / LOGIC NODE
  if (node.type === 'condition') {
    if (data.nodeSubtype === 'grade_router') {
      let chosenHandle = 'secondary';
      const category = applicant.gradeCategory;
      if (category === 'Early Years' || category === 'Primary' || applicant.grade <= 5) {
        chosenHandle = 'primary';
      } else if (category === 'Boarding / Overseas' || applicant.nationality !== 'United States' && applicant.nationality !== 'Singapore') {
        chosenHandle = 'boarding';
      } else if (category === 'Financial Aid') {
        chosenHandle = 'finaid';
      } else {
        chosenHandle = 'secondary';
      }

      return {
        status: 'success',
        outgoingHandleId: chosenHandle,
        log: {
          ...baseLog,
          id: `log-${Date.now()}-${Math.random()}`,
          status: 'success',
          message: `Grade Router evaluated: Category = "${category}", Grade = ${applicant.grade} -> Selected Branch: [${chosenHandle.toUpperCase()}]`
        }
      };
    }

    // Boolean or rule-based condition
    const rules = data.conditionRules || [];
    let isMatched = false;

    if (rules.length > 0) {
      const rule = rules[0];
      let fieldValue: unknown = undefined;

      if (rule.field.startsWith('applicant.')) {
        const key = rule.field.replace('applicant.', '');
        fieldValue = (applicant as unknown as Record<string, unknown>)[key];
      } else {
        fieldValue = variables[rule.field];
      }

      isMatched = evaluateCondition(fieldValue, rule.operator, rule.value);
    } else {
      // Default to documents validity check if not specified
      isMatched = applicant.mandatoryDocsValid;
    }

    let branch = isMatched ? 'true' : 'false';
    // If node has custom branches (not standard true/false)
    if (data.branches && data.branches.length > 0) {
      if (isMatched) {
        branch = data.branches[0].handleId || 'true';
      } else {
        branch = (data.branches[1] ? data.branches[1].handleId : data.branches[0].handleId) || 'false';
      }
    }

    return {
      status: 'success',
      outgoingHandleId: branch,
      log: {
        ...baseLog,
        id: `log-${Date.now()}-${Math.random()}`,
        status: 'success',
        message: `Condition Evaluated: [${isMatched ? 'MATCHED / YES' : 'NOT MATCHED / NO'}] -> Routing down [${branch}] branch.`
      }
    };
  }

  // 4. DELAY NODE
  if (node.type === 'delay') {
    if (options.earlyActionTriggered || applicant.earlyActionTriggered) {
      return {
        status: 'success',
        outgoingHandleId: 'source',
        updatedApplicant: {
          earlyActionTriggered: true,
          tourBooked: true
        },
        log: {
          ...baseLog,
          id: `log-${Date.now()}-${Math.random()}`,
          status: 'success',
          message: `⚡ EARLY ACTION DETECTED: Parent completed event early (e.g. booked campus tour / submitted form). ${data.delayDuration || 24}h delay timer was immediately cancelled and bypassed!`
        }
      };
    }

    return {
      status: 'success',
      outgoingHandleId: 'source',
      log: {
        ...baseLog,
        id: `log-${Date.now()}-${Math.random()}`,
        status: 'success',
        message: `Delay simulated: ${data.delayDuration || 24} ${data.delayUnit || 'hours'} (${data.delayType || 'fixed duration'}). Timer expired cleanly.`
      }
    };
  }

  // 5. HUMAN INTERVENTION NODE
  if (node.type === 'human') {
    if (!options.humanDecisionChoice) {
      // Needs human review!
      return {
        status: 'waiting',
        pauseReason: 'human_decision',
        log: {
          ...baseLog,
          id: `log-${Date.now()}-${Math.random()}`,
          status: 'waiting',
          message: `WAITING FOR HUMAN ACTION: Assigned to [${data.assignedRole || 'Admissions Committee'}]. Awaiting outcome decision.`
        }
      };
    }

    // Human made a decision
    const chosen = options.humanDecisionChoice;
    const matchingOutcome = data.allowedOutcomes?.find((o) => o.actionId === chosen);
    const label = matchingOutcome ? matchingOutcome.label : chosen;

    return {
      status: 'success',
      outgoingHandleId: chosen,
      updatedApplicant: {
        committeeDecision: chosen as 'Admit' | 'Waitlist' | 'Conditional Offer' | 'Decline',
        applicationStatus: matchingOutcome?.nextStatus || chosen
      },
      log: {
        ...baseLog,
        id: `log-${Date.now()}-${Math.random()}`,
        status: 'success',
        message: `Human Review Completed: [${data.assignedRole || 'Reviewer'}] selected "${label}". Resuming execution down [${chosen}] branch.`
      }
    };
  }

  // 6. GOAL NODE (PERSISTENT OBJECTIVE)
  if (node.type === 'goal') {
    const isPaid = options.forceGoalSatisfied || applicant.feePaid;
    const currentAttempt = (options.goalCurrentAttempt || 0) + 1;
    const maxAttempts = data.goalMaxAttempts || 7;

    if (isPaid) {
      return {
        status: 'success',
        outgoingHandleId: 'success',
        updatedApplicant: {
          feePaid: true,
          applicationStatus: 'Fee Paid'
        },
        log: {
          ...baseLog,
          id: `log-${Date.now()}-${Math.random()}`,
          status: 'success',
          message: `Goal Achieved: [${data.label}] Fee Payment Confirmed (${applicant.paymentMethod === 'offline_bank_wire' ? 'Manual Offline Bank Wire Bypass' : 'Online Payment Webhook'}). Workflow progressing.`
        }
      };
    }

    if (currentAttempt >= maxAttempts) {
      return {
        status: 'success',
        outgoingHandleId: 'timeout',
        updatedApplicant: {
          applicationStatus: 'Offer Expired'
        },
        log: {
          ...baseLog,
          id: `log-${Date.now()}-${Math.random()}`,
          status: 'success',
          message: `Goal Timeout: Maximum check attempts reached (${maxAttempts}/${maxAttempts}). Route to Offer Expiry handling.`
        }
      };
    }

    // Still pending
    return {
      status: 'waiting',
      pauseReason: 'goal_pending',
      log: {
        ...baseLog,
        id: `log-${Date.now()}-${Math.random()}`,
        status: 'waiting',
        message: `Goal Pending Check (${currentAttempt}/${maxAttempts}): Fee not yet received. Waiting for next interval or offline wire confirmation.`
      }
    };
  }

  // 7. SYSTEM / SIS NODE
  if (node.type === 'system') {
    return {
      status: 'success',
      outgoingHandleId: 'source',
      updatedApplicant: {
        applicationStatus: 'Active Enrolled',
        assignedTeacher: 'Dr. Katherine Vance (IB Science)',
        sisSynced: true
      },
      log: {
        ...baseLog,
        id: `log-${Date.now()}-${Math.random()}`,
        status: 'success',
        message: `System Handover Complete: Student accounts provisioned, homeroom teacher assigned, bus route linked. Final State: ACTIVE ENROLLED.`
      }
    };
  }

  return {
    status: 'success',
    outgoingHandleId: 'source',
    log: {
      ...baseLog,
      id: `log-${Date.now()}-${Math.random()}`,
      status: 'success',
      message: `Completed step ${node.data.label}`
    }
  };
}

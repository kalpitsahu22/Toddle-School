import { NodeType, NodeData } from '../types/workflow';

export function generateNodeCodeSnippet(nodeType: NodeType, data: NodeData): string {
  switch (nodeType) {
    case 'trigger': {
      const eventName = data.triggerEvent || 'Form Submitted';
      const formName = data.formName || 'Admission Application 2026';
      return `// 1. Event Listener / Intake
onEvent("${eventName}", async (payload) => {
  const applicant = await crm.ingest({
    form: "${formName}",
    data: payload
  });
  return startWorkflow(applicant);
});`;
    }

    case 'condition': {
      if (data.nodeSubtype === 'grade_router' || (data.branches?.length ?? 0) > 2) {
        return `// Dynamic Routing Fork
switch (applicant.gradeCategory) {
  case "Middle / High School":
    return route("secondary"); // Gr 6-12
  case "Primary":
    return route("primary");   // Gr K-5
  default:
    return route("boarding");  // International
}`;
      }
      const rule = data.conditionRules?.[0];
      const field = rule?.field || 'applicant.mandatoryDocsValid';
      const op = rule?.operator === 'equals' ? '===' : rule?.operator === 'not_equals' ? '!==' : rule?.operator === 'greater_than' ? '>' : '===';
      const val = rule?.value !== undefined ? JSON.stringify(rule.value) : 'true';
      const trueHandle = data.branches?.[0]?.handleId || 'true';
      const falseHandle = data.branches?.[1]?.handleId || 'false';

      return `// Single-Pass Evaluation
if (${field} ${op} ${val}) {
  return route("${trueHandle}"); // Approved
} else {
  return route("${falseHandle}"); // SLA Escalation
}`;
    }

    case 'action': {
      const service = data.actionService || 'email';
      const retries = data.retryPolicy?.maxRetries ?? 3;
      const delay = data.retryPolicy?.retryDelaySeconds ?? 5;
      const backoff = data.retryPolicy?.backoff || 'exponential';

      if (service === 'email') {
        const recipient = data.recipient || '{{applicant.email}}';
        const subject = data.subject ? `"${data.subject.slice(0, 32)}..."` : '"Welcome to Toddle"';
        return `// Email Dispatch API
await mailer.sendWithResilience({
  to: "${recipient}",
  subject: ${subject},
  retryPolicy: { maxRetries: ${retries}, delay: ${delay}s, ${backoff} }
});`;
      }

      if (service === 'whatsapp' || service === 'sms') {
        const recipient = data.recipient || '{{applicant.parentPhone}}';
        return `// Multi-Channel WhatsApp / SMS API
await messaging.dispatch({
  channel: "whatsapp_sms",
  to: "${recipient}",
  templateId: "${data.templateId || 'tpl_24h_reminder'}",
  retryPolicy: { maxRetries: 2, fallback: "sms" }
});`;
      }

      if (service === 'ocr_scanner') {
        return `// AI OCR Document Pre-Validation
const ocr = await aiScanner.parse({
  files: applicant.documents,
  targetFields: ["dob", "transcripts", "gpa"]
});
if (ocr.confidence > 0.95) return next();`;
      }

      if (service === 'pdf_generator') {
        return `// Digital Offer Letter PDF Engine
const offer = await pdfEngine.generate({
  template: "tpl_official_offer_v2",
  studentId: applicant.id,
  expiryWindowDays: 7
});`;
      }

      if (service === 'sis_sync') {
        const endpoint = data.sisEndpoint || 'https://api.toddleschool.com/v1/sis/students';
        return `// SIS / PowerSchool ERP API Handover
await httpClient.post("${endpoint}", {
  headers: { "X-School-ID": "TODDLE-01" },
  body: mapSchema(applicant)
});`;
      }

      return `// Execute Automated Action Task
await taskRunner.execute("${data.label || 'Action'}", {
  payload: applicant
});`;
    }

    case 'delay': {
      const duration = data.delayDuration || 48;
      const unit = data.delayUnit || 'hours';
      const earlyBypass = data.allowEarlyActionBypass ? 'true' : 'false';
      return `// Delay / SLA Window (${duration} ${unit})
await delayTimer.wait(${duration}, "${unit}", {
  earlyBypass: ${earlyBypass},
  events: ["tour.booked", "app.submitted"]
});`;
    }

    case 'human': {
      const role = data.assignedRole || 'Admissions Committee';
      const timeout = data.timeoutHours || 72;
      const outcomes = data.allowedOutcomes?.map((o) => `"${o.actionId}"`).join(' | ') || '"admit" | "waitlist" | "decline"';
      return `// Human Rubric Review State Machine
const outcome: ${outcomes} = 
  await taskQueue.awaitHumanSignoff({
    assignedRole: "${role}",
    timeoutHours: ${timeout}
  });
return route(outcome);`;
    }

    case 'goal': {
      const metric = data.goalTargetMetric || 'fee_paid';
      const interval = data.goalCheckIntervalHours || 24;
      const maxAttempts = data.goalMaxAttempts || 7;
      return `// Persistent Goal Polling Loop
while (attempts < ${maxAttempts} && !applicant.${metric}) {
  await ledger.poll("${metric}", { interval: "${interval}h" });
  if (offlineWireBypassed) break;
}`;
    }

    case 'system': {
      const endpoint = data.sisEndpoint || 'https://api.toddleschool.com/v1/provisioning';
      return `// Final SIS Provisioning & LMS Handover
await sis.provisionStudentAccounts(applicant);
await sis.assignHomeroomTeacher(applicant.grade);
await eventBus.emit("student.active_enrolled");`;
    }

    default:
      return `// Process step: ${data.label}`;
  }
}

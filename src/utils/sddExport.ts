import { Workflow } from '../types/workflow';
import jsPDF from 'jspdf';

/**
 * Helper to generate descriptive business rationale and execution logic for any node.
 */
function getNodeExplanatoryDetails(node: any, index: number) {
  const type = node.type || 'action';
  const data = node.data || {};

  let rationale = data.description || 'Automated execution step within the admission pipeline.';
  const bullets: string[] = [];
  const parameters: string[] = [];
  const resilience: string[] = [];
  const branching: string[] = [];

  switch (type) {
    case 'trigger':
      rationale = data.description || 'Acts as the immutable entry gate capturing candidate and guardian data from external forms or webhooks.';
      parameters.push(`Trigger Event: "${data.triggerEvent || 'Form Submitted'}"`);
      parameters.push(`Intake Source: "${data.formName || 'Standard Admission Intake'}"`);
      if (data.payloadSchema && data.payloadSchema.length > 0) {
        parameters.push(`Ingested Payload Fields: ${data.payloadSchema.map((f: any) => `${f.key} (${f.type})`).join(', ')}`);
      }
      bullets.push('Receives HTTP webhook request and validates payload structure against schema.');
      bullets.push('Generates immutable candidate application ID and deduplicates records in the CRM database.');
      bullets.push('Initializes workflow execution state machine and triggers immediate downstream actions.');
      break;

    case 'action':
      if (data.nodeSubtype === 'ai_ocr_scan' || data.actionService === 'ocr_scanner') {
        rationale = 'Replaces manual document screening with automated AI computer vision to extract student demographics and verify transcripts.';
        parameters.push(`Service Provider: AI OCR Document Scanner Service`);
        parameters.push(`Target Documents: Birth Certificates, Passports, Academic Transcripts`);
        bullets.push('Scans uploaded PDF/image files for text readability and optical clarity.');
        bullets.push('Extracts applicant birth date, previous 2-year GPA, and guardian identity fields.');
        bullets.push('Calculates a verification confidence score (Threshold: >= 95% required for automatic clearance).');
      } else if (data.nodeSubtype === 'generate_offer_pdf' || data.actionService === 'pdf_generator') {
        rationale = 'Dynamically generates official, legally binding digital offer letters with personalized fee schedules and acceptance links.';
        parameters.push(`Service: Digital PDF Rendering Engine & Mailer`);
        parameters.push(`Recipient: ${data.recipient || '{{applicant.email}}'}`);
        parameters.push(`Subject: "${data.subject || 'Official Offer of Admission'}"`);
        bullets.push('Merges applicant profile tokens (name, grade, campus, scholarship grants) into approved school template.');
        bullets.push('Compiles PDF document and registers secure digital signature cryptographic hash.');
        bullets.push('Dispatches email with embedded acceptance tracking URL and 7-day payment deadline.');
      } else if (data.nodeSubtype === 'sync_sis' || data.actionService === 'sis_sync') {
        rationale = 'Automates enterprise ERP / SIS student record provisioning without manual data re-entry.';
        parameters.push(`SIS Endpoint: ${data.sisEndpoint || 'https://api.toddleschool.com/v1/sis/students'}`);
        parameters.push(`Target System: ${data.sisSystemName || 'Toddle Core SIS / PowerSchool ERP'}`);
        if (data.fieldMappings && data.fieldMappings.length > 0) {
          parameters.push(`Field Mappings: ${data.fieldMappings.map((m: any) => `${m.sourceField} -> ${m.targetField}`).join(', ')}`);
        }
        bullets.push('Transforms verified applicant state into canonical SIS student JSON schema.');
        bullets.push('Executes authenticated idempotent REST sync with core school database.');
        bullets.push('Assigns official student enrollment number and homeroom roster placement.');
      } else if (data.actionService === 'whatsapp' || data.nodeSubtype === 'send_whatsapp') {
        rationale = 'Dispatches instant multi-channel mobile notifications to ensure maximum open rates and eliminate no-shows.';
        parameters.push(`Channel: WhatsApp Business API / SMS Gateway`);
        parameters.push(`Recipient Phone: ${data.recipient || '{{applicant.parentPhone}}'}`);
        parameters.push(`Subject: "${data.subject || 'Urgent Admission Notice'}"`);
        bullets.push('Formats personalized mobile alert with clickable action links and campus navigation map.');
        bullets.push('Provides instantaneous read-receipt telemetry to admissions counselors.');
      } else {
        rationale = data.description || 'Dispatches personalized email communication to parents or faculty evaluators.';
        parameters.push(`Channel: High-Deliverability SMTP Email Service`);
        parameters.push(`Recipient: ${data.recipient || '{{applicant.email}}'}`);
        if (data.subject) parameters.push(`Subject Line: "${data.subject}"`);
        bullets.push('Interpolates dynamic merge tags (e.g. {{applicant.name}}, {{applicant.grade}}) in real-time.');
        bullets.push('Transmits branded HTML email via redundant delivery gateways.');
      }

      if (data.retryPolicy?.enabled) {
        resilience.push(`Retry Policy: ${data.retryPolicy.maxRetries} maximum retries with ${data.retryPolicy.backoff} backoff (${data.retryPolicy.retryDelaySeconds}s initial delay).`);
        resilience.push(`Failure Strategy: Routes to "${data.retryPolicy.onFinalFailure || 'route_to_fallback'}" on repeated failure.`);
      }
      break;

    case 'condition':
      rationale = data.description || 'Evaluates real-time applicant data against defined criteria to dynamically bifurcate workflow pathways.';
      if (data.conditionRules && data.conditionRules.length > 0) {
        parameters.push(`Evaluation Rule: ${data.conditionRules.map((r: any) => `${r.field} ${r.operator} ${JSON.stringify(r.value)}`).join(' AND ')}`);
      }
      bullets.push('Performs strict Boolean or multi-value evaluation against active candidate state context.');
      bullets.push('Instantly selects corresponding branch handle without introducing asynchronous latency.');
      if (data.branches && data.branches.length > 0) {
        data.branches.forEach((b: any) => {
          branching.push(`[${b.label}]: ${b.description || 'Routes to corresponding department workflow.'}`);
        });
      }
      break;

    case 'delay':
      rationale = data.description || 'Pauses workflow execution for a designated nurture window while actively listening for early conversion triggers.';
      parameters.push(`Timer Duration: ${data.delayDuration || 24} ${data.delayUnit || 'hours'} (${data.delayType || 'fixed_duration'})`);
      if (data.allowEarlyActionBypass) {
        parameters.push(`Early Action Bypass: ENABLED (Listens for: ${(data.earlyActionEvents || ['tour.booked']).join(', ')})`);
        resilience.push('Early Action Bypass: If parent completes the target conversion step early, the timer aborts immediately and advances workflow.');
      }
      bullets.push(`Halts execution thread in durable state store for ${data.delayDuration || 24} ${data.delayUnit || 'hours'}.`);
      bullets.push('Subscribes to global event bus for early cancellation triggers.');
      bullets.push('Upon timer expiration or event interception, resumes downstream node execution.');
      break;

    case 'human':
      rationale = data.description || 'Pauses automated execution to await mandatory human stakeholder review, committee rubric scoring, or sign-off.';
      parameters.push(`Assigned Reviewer Role: "${data.assignedRole || 'Admissions Committee & Academic Head'}"`);
      parameters.push(`SLA Decision Timeout: ${data.timeoutHours || 72} hours`);
      bullets.push('Generates pending review item in designated staff portal dashboard.');
      bullets.push('Pauses automated workflow while preserving full candidate dossier context.');
      bullets.push('Captures rubric scores, evaluator notes, and formal committee sign-off signature.');
      if (data.allowedOutcomes && data.allowedOutcomes.length > 0) {
        data.allowedOutcomes.forEach((o: any) => {
          branching.push(`Decision "${o.label}": Sets status to "${o.nextStatus || o.actionId}".`);
        });
      }
      break;

    case 'goal':
      rationale = data.description || 'Defines a persistent state objective that repeatedly monitors candidate milestones (e.g. tuition deposit settlement).';
      parameters.push(`Target Metric: "${data.goalTargetMetric || 'fee_paid'}"`);
      parameters.push(`Polling Schedule: Check every ${data.goalCheckIntervalHours || 24} hours (Max ${data.goalMaxAttempts || 7} attempts)`);
      if (data.goalFastTrackBypass) {
        parameters.push(`Offline Bank Wire Bypass: ENABLED`);
        resilience.push('Offline Wire Fast-Track: Manual bursar bank wire receipt clears this goal immediately without waiting for webhooks.');
      }
      bullets.push(`Periodically queries ledger API every ${data.goalCheckIntervalHours || 24} hours for fee settlement confirmation.`);
      bullets.push('If satisfied within SLA deadline: Exits loop via "SUCCESS" handle.');
      bullets.push(`If unpaid after ${data.goalMaxAttempts || 7} attempts: Exits via "TIMEOUT" handle to reclaim capacity.`);
      break;

    case 'system':
      rationale = data.description || 'Executes background core infrastructure tasks such as LMS provisioning and identity management.';
      parameters.push(`System Action: Enterprise LMS & Portal Provisioning`);
      bullets.push('Provisions single-sign-on (SSO) Google Workspace / Microsoft 365 student email accounts.');
      bullets.push('Configures Toddle Learning Platform student & parent portal access credentials.');
      bullets.push('Assigns academic homeroom mentor and generates first-day student ID badge.');
      break;
  }

  return {
    stepNumber: index + 1,
    label: data.label || `Step ${index + 1}`,
    type: (type || 'action').toUpperCase(),
    phase: data.phase || 'General Phase',
    rationale,
    parameters,
    bullets,
    resilience,
    branching
  };
}

/**
 * Generates an in-depth, explanatory markdown Software Design Document (SDD).
 */
export function generateWorkflowSddMarkdown(workflow: Workflow): string {
  const timestamp = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let md = `# SOFTWARE DESIGN DOCUMENT (SDD)
## ${workflow.name}

**Document Version:** 2.0.0 (Comprehensive Technical & Operational Specification)  
**Publication Date:** ${timestamp}  
**Classification:** Institutional Workflow Architecture & Functional Execution Contract  
**Workflow Category:** \`${workflow.category.toUpperCase()}\` | **Status:** \`${workflow.status.toUpperCase()}\`  

---

### 1. Executive Summary & Business Objective

This Software Design Document formalizes the functional architecture, operational data contracts, state transition logic, and failure resilience policies for **${workflow.name}** within the Toddle Visual Admission Engine.

${workflow.description || 'Modular automated admission flow designed for high-reliability institutional execution.'}

#### 📊 Key Workflow Metrics & Classification:
* **Total Configured Process Steps:** \`${workflow.nodes.length} Nodes\`
* **Direct Transitions & Handlers:** \`${workflow.edges.length} Edges\`
* **Architectural Modularity:** Decoupled Event-Driven Micro-Workflow
* **Target Audience / Stakeholders:** Admissions Directors, Academic Registrars, Department Heads, IT Systems Administrators
* **Associated Tags:** ${workflow.tags?.map((t: string) => `\`${t}\``).join(', ') || '`Admission`, `Core`'}

---

### 2. End-to-End Process Flow Diagram

The diagram below illustrates the exact execution pathway, condition forks, and automated transitions:

\`\`\`mermaid
flowchart TD
`;

  workflow.nodes.forEach((node) => {
    const cleanLabel = (node.data.label || node.id).replace(/["()]/g, '');
    const nodeType = (node.type || 'action').toUpperCase();
    md += `    ${node.id}["[${nodeType}] ${cleanLabel}"]\n`;
  });

  if (workflow.edges.length > 0) {
    workflow.edges.forEach((edge) => {
      const label = edge.label ? `|"${edge.label.replace(/"/g, '')}"|` : '';
      md += `    ${edge.source} -->${label} ${edge.target}\n`;
    });
  }

  md += `\`\`\`

---

### 3. Step-by-Step Functional Specification & Execution Logic

Below is the detailed functional breakdown for each node in this workflow phase:

`;

  workflow.nodes.forEach((node, index) => {
    const details = getNodeExplanatoryDetails(node, index);

    md += `### Step ${details.stepNumber}: ${details.label}
* **Node Identifier:** \`${node.id}\`
* **Node Category / Type:** \`${details.type}\`
* **Phase Tag:** \`${details.phase}\`

#### 🎯 Business Purpose & Rationale
${details.rationale}

#### 📥 Configuration Parameters & Data Contracts
${details.parameters.map((p) => `* **${p.split(':')[0]}:** ${p.split(':').slice(1).join(':')}`).join('\n')}

#### ⚙️ Step-by-Step Functional Execution Rules
${details.bullets.map((b) => `* ${b}`).join('\n')}
`;

    if (details.branching.length > 0) {
      md += `
#### 🔀 Branching & State Decision Routing
${details.branching.map((br) => `* ${br}`).join('\n')}
`;
    }

    if (details.resilience.length > 0) {
      md += `
#### 🛡️ Failure Recovery & SLA Policy
${details.resilience.map((r) => `* ${r}`).join('\n')}
`;
    }

    md += `\n---\n\n`;
  });

  md += `### 4. Failure Modes & Edge Case Resilience Matrix

| Failure Mode / Edge Case | Trigger Condition | System Mitigation & Automated Recovery Policy |
| :--- | :--- | :--- |
| **API Timeout / SMTP Rate Limit** | Third-party communication provider returns HTTP 429/503 | Automatic exponential backoff retry policy (3 attempts), followed by dead-letter queue routing. |
| **Missing Transcripts / Incomplete Docs** | AI OCR confidence < 95% or required documents omitted | Single-pass rule check routes applicant to 48h SLA Phone Outreach human task for counselor assistance. |
| **Parent Early Tour Booking** | Parent schedules tour on Day 1 during 72h nurture delay | Event-Driven Early Action Bypass listener intercepts event and cancels remaining 66 hours immediately. |
| **Offline Bank Wire Transfer** | Parent deposits via telegraphic wire transfer at school bursar | Bursar offline wire bypass button resolves persistent 7-day goal loop immediately without waiting for payment webhooks. |
| **7-Day Offer Payment Expiration** | Candidate does not submit enrollment fee within 7 days | Goal node times out, triggers capacity reclaim, and auto-promotes the #1 waitlisted candidate. |

---

### 5. Architectural Quality Attributes & Compliance Standards

* **Idempotency Guarantee:** Every inbound webhook and external sync request is deduplicated using unique applicant context UUIDs to prevent double-charging or duplicate emails.
* **Immutable Audit Trail:** All state transitions, human committee decisions, evaluator rubric scores, and timer expirations are logged with ISO-8601 timestamps for regulatory compliance.
* **Decoupled Handover:** Upon workflow termination, the engine emits standard domain events to trigger downstream micro-workflows without tight coupling.
`;

  return md;
}

/**
 * Triggers a download of the explanatory SDD in Markdown format.
 */
export function downloadWorkflowSddMarkdown(workflow: Workflow) {
  const md = generateWorkflowSddMarkdown(workflow);
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const filename = `${workflow.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_SDD.md`;
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Ultra-fast, highly descriptive, zero-lag pure vector PDF generator.
 * Produces an explanatory Software Design Document formatted with clear bullet points,
 * business rationales, data parameters, and resilience matrices.
 */
export async function downloadWorkflowSddPdf(workflow: Workflow): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 14;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin - 12) {
          doc.addPage();
          y = margin + 8;
          // Running Header
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(148, 163, 184); // slate-400
          doc.text(`TODDLE ADMISSION ENGINE — SOFTWARE DESIGN DOCUMENT (SDD): ${workflow.name.substring(0, 50)}`, margin, margin);
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.3);
          doc.line(margin, margin + 2, pageWidth - margin, margin + 2);
        }
      };

      const timestamp = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      // ==========================================
      // PAGE 1 HEADER BANNER
      // ==========================================
      doc.setFillColor(15, 23, 42); // slate-900
      doc.roundedRect(margin, y, contentWidth, 30, 3, 3, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text('SOFTWARE DESIGN DOCUMENT (SDD)', margin + 6, y + 9);

      doc.setFontSize(10);
      doc.setTextColor(96, 165, 250); // blue-400
      doc.text(workflow.name.substring(0, 65), margin + 6, y + 16);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(203, 213, 225);
      doc.text(`Status: ${workflow.status.toUpperCase()}  |  Category: ${workflow.category.toUpperCase()}  |  Generated: ${timestamp}  |  Total Steps: ${workflow.nodes.length}`, margin + 6, y + 24);

      y += 36;

      // ==========================================
      // SECTION 1: EXECUTIVE SUMMARY & ARCHITECTURE
      // ==========================================
      checkPageBreak(35);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(30, 58, 138); // blue-900
      doc.text('1. EXECUTIVE SUMMARY & BUSINESS RATIONALE', margin, y);
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.4);
      doc.line(margin, y + 1.5, pageWidth - margin, y + 1.5);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85); // slate-700
      const summaryText = workflow.description || 'This Software Design Document formalizes the functional architecture, operational data contracts, and execution rules for this admission workflow phase.';
      const descLines = doc.splitTextToSize(summaryText, contentWidth);
      doc.text(descLines, margin, y);
      y += descLines.length * 4.2 + 3;

      // Metrics Pill Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, y, contentWidth, 11, 2, 2, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text(`• Total Process Steps: ${workflow.nodes.length}    • Transitions: ${workflow.edges.length}    • Architecture: Decoupled Event-Driven Micro-Workflow`, margin + 4, y + 7);
      y += 16;

      // ==========================================
      // SECTION 2: STEP-BY-STEP FUNCTIONAL SPECIFICATION
      // ==========================================
      checkPageBreak(25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(30, 58, 138);
      doc.text('2. STEP-BY-STEP FUNCTIONAL SPECIFICATION & EXECUTION RULES', margin, y);
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.4);
      doc.line(margin, y + 1.5, pageWidth - margin, y + 1.5);
      y += 7;

      workflow.nodes.forEach((node, index) => {
        const details = getNodeExplanatoryDetails(node, index);

        // Calculate card height dynamically based on text volume
        let estimatedHeight = 10; // header
        estimatedHeight += 12; // rationale
        estimatedHeight += details.parameters.length * 4.2 + 4; // parameters
        estimatedHeight += details.bullets.length * 4.2 + 4; // execution bullets
        if (details.branching.length > 0) estimatedHeight += details.branching.length * 4.2 + 4;
        if (details.resilience.length > 0) estimatedHeight += details.resilience.length * 4.2 + 4;
        estimatedHeight += 6; // padding

        checkPageBreak(Math.min(estimatedHeight, 80));

        const startCardY = y;

        // Card Header Bar
        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, y, contentWidth, 7.5, 2, 2, 'F');
        doc.line(margin, y + 7.5, margin + contentWidth, y + 7.5);

        // Badge color by node type
        if (node.type === 'trigger') doc.setFillColor(5, 150, 105); // emerald
        else if (node.type === 'action') doc.setFillColor(37, 99, 235); // blue
        else if (node.type === 'condition') doc.setFillColor(217, 119, 6); // amber
        else if (node.type === 'delay') doc.setFillColor(124, 58, 237); // purple
        else if (node.type === 'human') doc.setFillColor(225, 29, 72); // rose
        else if (node.type === 'goal') doc.setFillColor(234, 88, 12); // orange
        else doc.setFillColor(13, 148, 136); // teal

        // Badge
        doc.roundedRect(margin + 2.5, y + 1.2, 17, 5, 1, 1, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(255, 255, 255);
        doc.text(details.type.substring(0, 8), margin + 3.5, y + 4.6);

        // Step Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`Step ${details.stepNumber}: ${details.label.substring(0, 52)}`, margin + 22, y + 4.9);

        // Node ID on right
        doc.setFont('courier', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text(node.id, pageWidth - margin - 22, y + 4.9);

        y += 11;

        // Business Purpose / Rationale
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(30, 58, 138);
        doc.text('Business Purpose & Context:', margin + 3, y);
        y += 3.5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        const rationaleLines = doc.splitTextToSize(details.rationale, contentWidth - 6);
        doc.text(rationaleLines, margin + 3, y);
        y += rationaleLines.length * 3.8 + 2;

        // Parameters & Data Inputs
        if (details.parameters.length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(15, 23, 42);
          doc.text('Configuration Parameters & Data Inputs:', margin + 3, y);
          y += 3.5;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.2);
          doc.setTextColor(51, 65, 85);
          details.parameters.forEach((param) => {
            const pLines = doc.splitTextToSize(`• ${param}`, contentWidth - 8);
            doc.text(pLines, margin + 5, y);
            y += pLines.length * 3.6;
          });
          y += 2;
        }

        // Functional Execution Rules
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        doc.text('Step-by-Step Functional Execution Rules:', margin + 3, y);
        y += 3.5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.setTextColor(51, 65, 85);
        details.bullets.forEach((bullet) => {
          const bLines = doc.splitTextToSize(`• ${bullet}`, contentWidth - 8);
          doc.text(bLines, margin + 5, y);
          y += bLines.length * 3.6;
        });
        y += 2;

        // Branching Details (if applicable)
        if (details.branching.length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(180, 83, 9); // amber-700
          doc.text('Decision Branching & Routing:', margin + 3, y);
          y += 3.5;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.2);
          doc.setTextColor(71, 85, 105);
          details.branching.forEach((br) => {
            const brLines = doc.splitTextToSize(`→ ${br}`, contentWidth - 8);
            doc.text(brLines, margin + 5, y);
            y += brLines.length * 3.6;
          });
          y += 2;
        }

        // Resilience / SLA Policy (if applicable)
        if (details.resilience.length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(22, 101, 52); // emerald-800
          doc.text('Resilience & Exception Policy:', margin + 3, y);
          y += 3.5;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.2);
          doc.setTextColor(51, 65, 85);
          details.resilience.forEach((res) => {
            const resLines = doc.splitTextToSize(`🛡️ ${res}`, contentWidth - 8);
            doc.text(resLines, margin + 5, y);
            y += resLines.length * 3.6;
          });
          y += 2;
        }

        // Draw Card Outer Border
        const actualCardHeight = y - startCardY + 2;
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, startCardY, contentWidth, actualCardHeight, 2, 2, 'D');

        y += 6;
      });

      // ==========================================
      // SECTION 3: FAILURE RECOVERY MATRIX
      // ==========================================
      checkPageBreak(45);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(30, 58, 138);
      doc.text('3. FAILURE RECOVERY & RESILIENCE MATRIX', margin, y);
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.4);
      doc.line(margin, y + 1.5, pageWidth - margin, y + 1.5);
      y += 6;

      const matrixRows = [
        ['API / SMTP Rate Throttling', 'External gateway returns 429/503', '3x exponential backoff retries (5s, 10s, 20s), routes to dead-letter queue.'],
        ['Missing / Unclear Transcripts', 'AI OCR confidence < 95%', 'Single-pass rule routes to 48h SLA Phone Outreach task for human counselor.'],
        ['Early Parent Tour Booking', 'Parent books tour on Day 1', 'Early Action Bypass listener intercepts event and cancels 72h delay immediately.'],
        ['Offline Bank Wire Settlement', 'Telegraphic wire receipt submitted', 'Bursar offline wire bypass clears persistent goal loop immediately.']
      ];

      // Table Header
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.rect(margin, y, contentWidth, 6, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.2);
      doc.setTextColor(15, 23, 42);
      doc.text('Failure Scenario', margin + 3, y + 4.2);
      doc.text('Trigger Condition', margin + 50, y + 4.2);
      doc.text('System Mitigation & Automated Recovery Policy', margin + 100, y + 4.2);
      y += 6;

      // Table Rows
      matrixRows.forEach((row) => {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(226, 232, 240);
        doc.rect(margin, y, contentWidth, 7, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.8);
        doc.setTextColor(30, 41, 59);
        doc.text(row[0], margin + 3, y + 4.5);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(row[1], margin + 50, y + 4.5);

        const solLines = doc.splitTextToSize(row[2], 78);
        doc.text(solLines[0] || '', margin + 100, y + 4.5);
        y += 7;
      });

      // ==========================================
      // PAGE NUMBERS & FOOTER ON ALL PAGES
      // ==========================================
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, pageHeight - margin - 2, pageWidth - margin, pageHeight - margin - 2);
        doc.text(`Toddle Visual Admission Engine • Software Design Document (SDD)`, margin, pageHeight - margin + 2);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 15, pageHeight - margin + 2);
      }

      const filename = `${workflow.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_SDD.pdf`;
      doc.save(filename);
      resolve();
    }, 10);
  });
}

/**
 * Opens a printable document view in a separate window.
 */
export function printWorkflowSddPdf(workflow: Workflow) {
  downloadWorkflowSddPdf(workflow);
}

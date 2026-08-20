import { Workflow } from '../types/workflow';
import { generateNodeCodeSnippet } from '../engine/codeSnippetGenerator';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generates a comprehensive markdown Software Design Document (SDD) for any workflow.
 */
export function generateWorkflowSddMarkdown(workflow: Workflow): string {
  const timestamp = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let md = `# SOFTWARE DESIGN DOCUMENT (SDD)
## ${workflow.name}
**Document Version:** 1.0.0  
**Generated Date:** ${timestamp}  
**Classification:** Engineering Specification & Workflow Execution Contract  
**Workflow Category:** ${workflow.category.toUpperCase()} | **Status:** ${workflow.status.toUpperCase()}  

---

### 1. Executive Summary & Purpose
This Software Design Document (SDD) defines the functional requirements, node topology, data schema, execution handlers, and error resilience policies for **${workflow.name}** within the Toddle Visual Admission Engine.

${workflow.description || 'Modular automated admission flow designed for high-reliability execution.'}

* **Total Process Nodes:** ${workflow.nodes.length}
* **Connected Transitions (Edges):** ${workflow.edges.length}
* **Workflow Type:** ${workflow.workflowType || 'Modular Admission Flow'}
* **Tags:** ${workflow.tags?.join(', ') || 'Admission, Core'}

---

### 2. Architectural Process Flow & Node Topology

\`\`\`mermaid
flowchart TD
`;

  // Mermaid edges and nodes
  workflow.nodes.forEach((node) => {
    const cleanLabel = (node.data.label || node.id).replace(/"/g, "'");
    const nodeType = (node.type || 'action').toUpperCase();
    md += `    ${node.id}["[${nodeType}] ${cleanLabel}"]\n`;
  });

  if (workflow.edges.length > 0) {
    workflow.edges.forEach((edge) => {
      const label = edge.label ? `|"${edge.label}"|` : '';
      md += `    ${edge.source} -->${label} ${edge.target}\n`;
    });
  }

  md += `\`\`\`

---

### 3. Step-by-Step Node Specification & Data Contracts

`;

  workflow.nodes.forEach((node, index) => {
    const nodeType = (node.type || 'action').toUpperCase();
    const data = node.data;
    const codeSnippet = generateNodeCodeSnippet(node.type, data);

    md += `#### Step ${index + 1}: ${data.label || 'Process Step'} (\`${node.id}\`)
* **Node Type:** \`${nodeType}\`
* **Phase Tag:** ${data.phase || 'N/A'}
* **Business Purpose:** ${data.description || 'Automated execution step.'}
`;

    if (node.type === 'trigger') {
      md += `* **Trigger Event:** \`${data.triggerEvent || 'Event Received'}\`
* **Intake Form:** ${data.formName || 'Standard Admission Intake'}
`;
      if (data.payloadSchema && data.payloadSchema.length > 0) {
        md += `* **Payload Schema:**\n`;
        data.payloadSchema.forEach((f: any) => {
          md += `  - \`${f.key}\` (${f.type}): Sample: *${f.sample || 'N/A'}*\n`;
        });
      }
    } else if (node.type === 'action') {
      md += `* **Action Service:** \`${data.actionService || 'email'}\`
* **Target Recipient:** \`${data.recipient || '{{applicant.email}}'}\`
`;
      if (data.subject) md += `* **Subject Line:** *${data.subject}*\n`;
      if (data.bodyContent) md += `* **Message Template:**\n\`\`\`text\n${data.bodyContent}\n\`\`\`\n`;
      if (data.retryPolicy?.enabled) {
        md += `* **Resilience Policy:** ${data.retryPolicy.maxRetries} Retries with ${data.retryPolicy.backoff} backoff (${data.retryPolicy.retryDelaySeconds}s delay).\n`;
      }
    } else if (node.type === 'condition') {
      md += `* **Condition Subtype:** \`${data.nodeSubtype || 'boolean_check'}\`
`;
      if (data.conditionRules && data.conditionRules.length > 0) {
        md += `* **Evaluation Rules:**\n`;
        data.conditionRules.forEach((r: any) => {
          md += `  - \`${r.field}\` ${r.operator} \`${JSON.stringify(r.value)}\`\n`;
        });
      }
      if (data.branches && data.branches.length > 0) {
        md += `* **Output Branches:**\n`;
        data.branches.forEach((b: any) => {
          md += `  - **[${b.handleId}]** ${b.label} (${b.description || 'Route path'})\n`;
        });
      }
    } else if (node.type === 'delay') {
      md += `* **Duration:** ${data.delayDuration || 24} ${data.delayUnit || 'hours'} (${data.delayType || 'fixed_duration'})
* **Early Action Bypass:** ${data.allowEarlyActionBypass ? 'Enabled (Cancels delay if conversion event received early)' : 'Disabled'}
`;
    } else if (node.type === 'human') {
      md += `* **Assigned Role:** \`${data.assignedRole || 'Admissions Committee'}\`
* **SLA Timeout:** ${data.timeoutHours || 72} hours
`;
      if (data.allowedOutcomes) {
        md += `* **Allowed Decisions:**\n`;
        data.allowedOutcomes.forEach((o: any) => {
          md += `  - \`${o.actionId}\`: ${o.label} (Variant: ${o.variant})\n`;
        });
      }
    } else if (node.type === 'goal') {
      md += `* **Target Metric:** \`${data.goalTargetMetric || 'fee_paid'}\`
* **Polling Interval:** Every ${data.goalCheckIntervalHours || 24} hours (Max ${data.goalMaxAttempts || 7} attempts)
* **Offline Bypass:** ${data.goalFastTrackBypass ? 'Enabled (Instant resolution upon bank wire check)' : 'Disabled'}
`;
    }

    md += `
##### Technical Execution Logic Handler:
\`\`\`typescript
${codeSnippet}
\`\`\`

---

`;
  });

  md += `### 4. Failure Modes & Edge Case Resilience Matrix

| Failure Mode | Detected Behavior | System Mitigation & Recovery Policy |
| :--- | :--- | :--- |
| **API Timeout / SMTP Rate Limit** | Third-party service returns 429/503 | Exponential backoff (3 attempts), followed by dead-letter queue routing. |
| **Missing Transcripts / Age Proof** | Document scrutiny check fails | Escalates to 48h SLA phone outreach task for human admissions officer. |
| **Parent Early Tour Booking** | Lead converts prior to 72h nurture window | Early Action Bypass event listener instantly cancels remaining sleep time. |
| **Offline Bank Wire Settlement** | Parent pays via international wire transfer | Bursar offline wire bypass resolves persistent goal loop immediately. |
| **7-Day Payment Expiration** | Candidate fails to pay deposit | Goal loop times out, triggers seat capacity reclaim, and auto-promotes waitlist #1. |

---

### 5. Architectural Quality Attributes & Compliance
* **Idempotency:** All webhook handlers deduplicate payloads using unique applicant IDs.
* **Audit Trail:** Every state change, human decision, and timer elapse is logged with ISO-8601 timestamps.
* **Decoupled Handover:** Upon workflow termination, emits standard domain events to trigger downstream micro-workflows.
`;

  return md;
}

/**
 * Triggers a download of the SDD in Markdown format.
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
 * Generates formatted HTML for the SDD.
 */
function buildSddHtml(workflow: Workflow, timestamp: string): string {
  const nodesHtml = workflow.nodes
    .map((node, index) => {
      const nodeType = (node.type || 'action').toUpperCase();
      const data = node.data;
      const snippet = generateNodeCodeSnippet(node.type, data);

      let extraDetails = '';
      if (node.type === 'trigger') {
        extraDetails = `<p style="margin: 4px 0;"><strong>Trigger Event:</strong> <code>${data.triggerEvent || 'Form Submitted'}</code></p>
          <p style="margin: 4px 0;"><strong>Form Name:</strong> ${data.formName || 'Standard Admission Intake'}</p>`;
      } else if (node.type === 'action') {
        extraDetails = `<p style="margin: 4px 0;"><strong>Service:</strong> <code>${data.actionService || 'email'}</code> | <strong>Recipient:</strong> <code>${data.recipient || '{{applicant.email}}'}</code></p>
          ${data.subject ? `<p style="margin: 4px 0;"><strong>Subject:</strong> ${data.subject}</p>` : ''}
          ${data.retryPolicy?.enabled ? `<p style="margin: 4px 0; color: #16a34a; font-weight: 600;">🛡️ Resilience: ${data.retryPolicy.maxRetries} Retries with ${data.retryPolicy.backoff} backoff</p>` : ''}`;
      } else if (node.type === 'condition') {
        extraDetails = `<p style="margin: 4px 0;"><strong>Condition Rule:</strong> <code>${data.conditionRules?.[0]?.field || 'applicant.gradeCategory'} ${data.conditionRules?.[0]?.operator || 'equals'} ${JSON.stringify(data.conditionRules?.[0]?.value ?? true)}</code></p>
          <p style="margin: 4px 0;"><strong>Branches:</strong> ${data.branches?.map((b: any) => `<code>${b.label}</code>`).join(' | ') || 'TRUE / FALSE'}</p>`;
      } else if (node.type === 'delay') {
        extraDetails = `<p style="margin: 4px 0;"><strong>Duration:</strong> ${data.delayDuration || 24} ${data.delayUnit || 'hours'} (${data.delayType || 'fixed_duration'})</p>
          <p style="margin: 4px 0;"><strong>Early Action Bypass:</strong> ${data.allowEarlyActionBypass ? '✅ Enabled (Cancels if event arrives early)' : '❌ Disabled'}</p>`;
      } else if (node.type === 'human') {
        extraDetails = `<p style="margin: 4px 0;"><strong>Assigned Role:</strong> <code>${data.assignedRole || 'Admissions Committee'}</code> | <strong>Timeout:</strong> ${data.timeoutHours || 72}h SLA</p>
          <p style="margin: 4px 0;"><strong>Allowed Decisions:</strong> ${data.allowedOutcomes?.map((o: any) => `<code>${o.label}</code>`).join(' | ') || 'Admit | Decline'}</p>`;
      } else if (node.type === 'goal') {
        extraDetails = `<p style="margin: 4px 0;"><strong>Goal Target:</strong> <code>${data.goalTargetMetric || 'fee_paid'}</code></p>
          <p style="margin: 4px 0;"><strong>Schedule:</strong> Check every ${data.goalCheckIntervalHours || 24}h (Max ${data.goalMaxAttempts || 7} attempts)</p>
          <p style="margin: 4px 0;"><strong>Bank Wire Bypass:</strong> ✅ Active</p>`;
      }

      return `
        <div style="border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 16px; overflow: hidden; background: #ffffff; page-break-inside: avoid;">
          <div style="background: #f8fafc; padding: 8px 12px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background: #2563eb; color: #ffffff;">${nodeType}</span>
              <span style="font-weight: 700; font-size: 12px; color: #0f172a;">Step ${index + 1}: ${data.label || 'Step'}</span>
            </div>
            <span style="font-family: monospace; font-size: 10px; color: #64748b;">${node.id}</span>
          </div>
          <div style="padding: 12px;">
            <p style="font-size: 11px; color: #475569; margin-bottom: 8px; font-style: italic;">${data.description || 'Process execution step.'}</p>
            ${extraDetails}
            <div style="background: #0f172a; border-radius: 6px; margin-top: 10px; overflow: hidden;">
              <div style="background: #1e293b; color: #94a3b8; font-size: 9px; font-weight: 700; padding: 4px 8px; font-family: monospace; text-transform: uppercase;">TypeScript Execution Handler</div>
              <pre style="padding: 8px; color: #93c5fd; font-family: monospace; font-size: 9.5px; line-height: 1.4; margin: 0; white-space: pre-wrap; word-break: break-word;"><code>${snippet}</code></pre>
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  return `
    <div style="font-family: Arial, sans-serif; background: #ffffff; color: #1e293b; padding: 24px; font-size: 11.5px; line-height: 1.5; width: 780px;">
      <div style="border-bottom: 3px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0;">SOFTWARE DESIGN DOCUMENT (SDD)</h1>
          <h2 style="font-size: 14px; font-weight: 700; color: #2563eb; margin: 0 0 6px 0;">${workflow.name}</h2>
          <p style="font-size: 11px; color: #64748b; margin: 0;">${workflow.description || 'Modular admission workflow technical design specification.'}</p>
        </div>
        <div style="text-align: right; font-family: monospace; font-size: 10px; color: #475569;">
          <div style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: #dbeafe; color: #1d4ed8; font-weight: 700; margin-bottom: 4px;">${workflow.status.toUpperCase()}</div>
          <div>Generated: ${timestamp}</div>
          <div>Nodes: ${workflow.nodes.length} | Edges: ${workflow.edges.length}</div>
        </div>
      </div>

      <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #1e3a8a; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 4px; margin: 16px 0 12px 0;">1. Workflow Specification & Topology</div>
      <p style="margin-bottom: 12px;">This document formalizes the execution contracts, data inputs, merge tokens, and technical handlers for all ${workflow.nodes.length} nodes configured in this workflow.</p>

      <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #1e3a8a; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 4px; margin: 16px 0 12px 0;">2. Step-by-Step Node & Execution Handlers</div>
      ${nodesHtml}

      <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #1e3a8a; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 4px; margin: 16px 0 12px 0;">3. Resilience & Failure Recovery Matrix</div>
      <table style="width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10.5px;">
        <thead>
          <tr style="background: #f1f5f9;">
            <th style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left;">Failure Scenario</th>
            <th style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left;">Trigger Condition</th>
            <th style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left;">Automated Recovery Behavior</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px;"><strong>API Timeout / SMTP Throttling</strong></td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px;">HTTP 429 / 503 from external gateway</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px;">Exponential backoff (3 retries: 5s, 10s, 20s), routes to dead-letter queue if unresolved.</td>
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px;"><strong>Missing / Corrupt Transcripts</strong></td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px;">OCR validation confidence &lt; 0.95</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px;">Single-pass rule routes to 48h SLA Phone Outreach task for human admissions counselor.</td>
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px;"><strong>Early Parent Tour Booking</strong></td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px;">Parent books tour on Day 1</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px;">Early Action Bypass listener intercepts event and cancels remaining 72h delay immediately.</td>
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px;"><strong>Offline Bank Wire Payment</strong></td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px;">Telegraphic wire proof submitted to bursar</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 8px;">Offline wire bypass button satisfies persistent 7-day goal loop without waiting for online gateway.</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Directly downloads the SDD as a .pdf file straight to the user's Downloads folder!
 */
export async function downloadWorkflowSddPdf(workflow: Workflow): Promise<void> {
  const timestamp = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Create temporary off-screen container for rendering
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px';
  container.style.background = '#ffffff';
  container.style.zIndex = '-1000';
  container.innerHTML = buildSddHtml(workflow, timestamp);
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add subsequent pages if content exceeds 1 page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    const filename = `${workflow.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_SDD.pdf`;
    pdf.save(filename);
  } catch (err) {
    console.error('Direct PDF export failed, falling back to print window:', err);
    printWorkflowSddPdf(workflow);
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * Opens a printable document view in a separate window for manual printing or browser PDF export.
 */
export function printWorkflowSddPdf(workflow: Workflow) {
  const timestamp = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    // If popups are blocked, use direct download
    downloadWorkflowSddPdf(workflow);
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${workflow.name} — Software Design Document (SDD)</title>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #1e293b; }
          .no-print { display: flex; gap: 10px; margin-bottom: 20px; }
          button { padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; border: none; }
          .print-btn { background: #2563eb; color: white; }
          .close-btn { background: #64748b; color: white; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="no-print">
          <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
          <button class="close-btn" onclick="window.close()">Close Window</button>
        </div>
        ${buildSddHtml(workflow, timestamp)}
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

import { Workflow } from '../types/workflow';
import { generateNodeCodeSnippet } from '../engine/codeSnippetGenerator';

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
 * Opens a beautifully formatted, print-optimized document view and triggers native browser Print to PDF.
 */
export function printWorkflowSddPdf(workflow: Workflow) {
  const timestamp = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to download the printable PDF document.');
    return;
  }

  const nodesHtml = workflow.nodes
    .map((node, index) => {
      const nodeType = (node.type || 'action').toUpperCase();
      const data = node.data;
      const snippet = generateNodeCodeSnippet(node.type, data);

      let extraDetails = '';
      if (node.type === 'trigger') {
        extraDetails = `<p><strong>Trigger Event:</strong> <code>${data.triggerEvent || 'Form Submitted'}</code></p>
          <p><strong>Form:</strong> ${data.formName || 'Standard Intake'}</p>`;
      } else if (node.type === 'action') {
        extraDetails = `<p><strong>Service:</strong> <code>${data.actionService || 'email'}</code> | <strong>Recipient:</strong> <code>${data.recipient || '{{applicant.email}}'}</code></p>
          ${data.subject ? `<p><strong>Subject:</strong> ${data.subject}</p>` : ''}
          ${data.bodyContent ? `<div class="template-box"><strong>Message Template:</strong><pre>${data.bodyContent}</pre></div>` : ''}
          ${data.retryPolicy?.enabled ? `<p class="badge-resilience">🛡️ <strong>Resilience:</strong> 3 Retries with Exponential Backoff</p>` : ''}`;
      } else if (node.type === 'condition') {
        extraDetails = `<p><strong>Rule:</strong> <code>${data.conditionRules?.[0]?.field || 'applicant.gradeCategory'} ${data.conditionRules?.[0]?.operator || 'equals'} ${JSON.stringify(data.conditionRules?.[0]?.value ?? true)}</code></p>
          <p><strong>Branches:</strong> ${data.branches?.map((b: any) => `<code>${b.label}</code>`).join(' | ') || 'TRUE / FALSE'}</p>`;
      } else if (node.type === 'delay') {
        extraDetails = `<p><strong>Duration:</strong> ${data.delayDuration || 24} ${data.delayUnit || 'hours'} (${data.delayType || 'fixed_duration'})</p>
          <p><strong>Early Action Bypass:</strong> ${data.allowEarlyActionBypass ? '✅ Enabled' : '❌ Disabled'}</p>`;
      } else if (node.type === 'human') {
        extraDetails = `<p><strong>Assigned Role:</strong> <code>${data.assignedRole || 'Admissions Committee'}</code> | <strong>SLA Timeout:</strong> ${data.timeoutHours || 72}h</p>
          <p><strong>Decisions:</strong> ${data.allowedOutcomes?.map((o: any) => `<code>${o.label}</code>`).join(' | ') || 'Admit | Decline'}</p>`;
      } else if (node.type === 'goal') {
        extraDetails = `<p><strong>Goal Target:</strong> <code>${data.goalTargetMetric || 'fee_paid'}</code></p>
          <p><strong>Polling Schedule:</strong> Every ${data.goalCheckIntervalHours || 24}h (Max ${data.goalMaxAttempts || 7} attempts)</p>
          <p><strong>Bank Wire Bypass:</strong> ✅ Active</p>`;
      }

      return `
        <div class="node-card">
          <div class="node-card-header">
            <span class="node-badge ${node.type}">${nodeType}</span>
            <span class="node-step">Step ${index + 1}: ${data.label || 'Step'}</span>
            <span class="node-id">${node.id}</span>
          </div>
          <div class="node-card-body">
            <p class="node-desc">${data.description || 'Automated execution step.'}</p>
            ${extraDetails}
            <div class="code-box">
              <div class="code-header">Technical Execution Handler (TypeScript)</div>
              <pre><code>${snippet}</code></pre>
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${workflow.name} — Software Design Document (SDD)</title>
        <meta charset="utf-8" />
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
          
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background: #ffffff;
            color: #1e293b;
            padding: 32px;
            font-size: 12px;
            line-height: 1.6;
          }
          
          .header-container {
            border-bottom: 3px solid #2563eb;
            padding-bottom: 16px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .title-area h1 {
            font-size: 22px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: -0.5px;
          }
          .title-area p {
            font-size: 11px;
            color: #64748b;
            margin-top: 4px;
          }
          .meta-box {
            text-align: right;
            font-size: 10px;
            font-family: 'JetBrains Mono', monospace;
            color: #475569;
          }
          .meta-box .status-pill {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            background: #dbeafe;
            color: #1d4ed8;
            font-weight: 700;
            margin-bottom: 4px;
          }
          
          .section-title {
            font-size: 14px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #1e3a8a;
            border-bottom: 1.5px solid #e2e8f0;
            padding-bottom: 6px;
            margin-top: 24px;
            margin-bottom: 12px;
          }
          
          .node-card {
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            margin-bottom: 16px;
            page-break-inside: avoid;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }
          .node-card-header {
            background: #f1f5f9;
            padding: 8px 12px;
            border-bottom: 1px solid #cbd5e1;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .node-badge {
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            padding: 2px 6px;
            border-radius: 4px;
            color: #ffffff;
          }
          .node-badge.trigger { background: #059669; }
          .node-badge.action { background: #2563eb; }
          .node-badge.condition { background: #d97706; }
          .node-badge.delay { background: #7c3aed; }
          .node-badge.human { background: #e11d48; }
          .node-badge.goal { background: #ea580c; }
          .node-badge.system { background: #0d9488; }
          
          .node-step { font-weight: 700; font-size: 12px; color: #0f172a; flex: 1; }
          .node-id { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #64748b; }
          
          .node-card-body { padding: 12px; }
          .node-desc { font-size: 11px; color: #475569; margin-bottom: 8px; font-style: italic; }
          
          code { font-family: 'JetBrains Mono', monospace; background: #f1f5f9; padding: 1px 4px; border-radius: 3px; font-size: 10px; color: #0f172a; }
          
          .template-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; margin: 6px 0; }
          .template-box pre { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 10px; white-space: pre-wrap; color: #334155; margin-top: 4px; }
          
          .code-box {
            background: #0f172a;
            border-radius: 6px;
            margin-top: 10px;
            overflow: hidden;
          }
          .code-header {
            background: #1e293b;
            color: #94a3b8;
            font-size: 9px;
            font-weight: 700;
            padding: 4px 8px;
            font-family: 'JetBrains Mono', monospace;
            text-transform: uppercase;
          }
          .code-box pre {
            padding: 8px;
            color: #93c5fd;
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px;
            line-height: 1.4;
            overflow-x: auto;
          }
          
          .matrix-table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0;
            font-size: 10px;
          }
          .matrix-table th, .matrix-table td {
            border: 1px solid #cbd5e1;
            padding: 6px 8px;
            text-align: left;
          }
          .matrix-table th { background: #f1f5f9; font-weight: 700; color: #1e293b; }
          
          @media print {
            body { padding: 16px; font-size: 10px; }
            .no-print { display: none; }
            .node-card { page-break-inside: avoid; }
          }
          
          .print-toolbar {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #1e293b;
            padding: 12px 20px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.25);
            display: flex;
            gap: 10px;
            align-items: center;
          }
          .print-btn {
            background: #2563eb;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 700;
            cursor: pointer;
            font-size: 12px;
          }
          .close-btn {
            background: #475569;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 700;
            cursor: pointer;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="print-toolbar no-print">
          <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
          <button class="close-btn" onclick="window.close()">Close</button>
        </div>

        <div class="header-container">
          <div class="title-area">
            <h1>SOFTWARE DESIGN DOCUMENT (SDD)</h1>
            <h2>${workflow.name}</h2>
            <p>${workflow.description || 'Modular automated admission flow specification.'}</p>
          </div>
          <div class="meta-box">
            <div><span class="status-pill">${workflow.status.toUpperCase()}</span></div>
            <div>Generated: ${timestamp}</div>
            <div>Nodes: ${workflow.nodes.length} | Edges: ${workflow.edges.length}</div>
            <div>Engine: Toddle Visual Admission Engine v2</div>
          </div>
        </div>

        <div class="section-title">1. Workflow Specification & Topology</div>
        <p style="margin-bottom: 12px;">This document formalizes the execution contracts, data inputs, merge tokens, and technical handlers for all ${workflow.nodes.length} nodes configured in this workflow phase.</p>

        <div class="section-title">2. Step-by-Step Node & Execution Handlers</div>
        ${nodesHtml}

        <div class="section-title">3. Failure Recovery & Resilience Matrix</div>
        <table class="matrix-table">
          <thead>
            <tr>
              <th>Failure Scenario</th>
              <th>Trigger Condition</th>
              <th>Automated Recovery Behavior</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>SMTP / Third-party API Outage</strong></td>
              <td>HTTP 429 / 503 from external mail/SMS gateway</td>
              <td>Exponential backoff (3 attempts: 5s, 10s, 20s), routes to dead-letter queue if unresolved.</td>
            </tr>
            <tr>
              <td><strong>Missing / Corrupt Transcripts</strong></td>
              <td>OCR validation confidence &lt; 0.95 or mandatory files omitted</td>
              <td>Single-pass rule routes to 48h SLA Phone Outreach task for admissions counselor.</td>
            </tr>
            <tr>
              <td><strong>Early Parent Conversion</strong></td>
              <td>Parent completes tour booking on Day 1</td>
              <td>Early Action Bypass listener intercepts event and cancels remaining 72h delay immediately.</td>
            </tr>
            <tr>
              <td><strong>Offline Bank Wire Payment</strong></td>
              <td>Parent submits telegraphic wire proof to bursar</td>
              <td>Offline wire bypass button satisfies persistent 7-day goal loop without waiting for online gateway.</td>
            </tr>
          </tbody>
        </table>

        <div class="section-title">4. Compliance & Enterprise Audit Trail</div>
        <p>All state transitions, condition evaluations, and human committee reviews are immutably logged with ISO-8601 timestamps and mapped to Student Information System (SIS) records.</p>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

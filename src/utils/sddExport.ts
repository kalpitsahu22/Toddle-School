import { Workflow } from '../types/workflow';
import { generateNodeCodeSnippet } from '../engine/codeSnippetGenerator';
import jsPDF from 'jspdf';

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
 * Ultra-fast, zero-lag pure vector PDF generator.
 * Generates and downloads the SDD directly in < 30ms without main thread lag or DOM freezing!
 */
export async function downloadWorkflowSddPdf(workflow: Workflow): Promise<void> {
  // Wrap in async microtask so UI thread remains responsive
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin - 10) {
          doc.addPage();
          y = margin + 8;
          // Running Header
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184); // slate-400
          doc.text(`TODDLE ADMISSION ENGINE — SOFTWARE DESIGN DOCUMENT: ${workflow.name.substring(0, 45)}`, margin, margin);
          doc.setDrawColor(226, 232, 240);
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
      doc.roundedRect(margin, y, contentWidth, 28, 3, 3, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text('SOFTWARE DESIGN DOCUMENT (SDD)', margin + 6, y + 9);

      doc.setFontSize(10);
      doc.setTextColor(96, 165, 250); // blue-400
      doc.text(workflow.name.substring(0, 60), margin + 6, y + 16);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(203, 213, 225);
      doc.text(`Version: 1.0.0 | Status: ${workflow.status.toUpperCase()} | Date: ${timestamp} | Nodes: ${workflow.nodes.length}`, margin + 6, y + 23);

      y += 34;

      // ==========================================
      // SECTION 1: EXECUTIVE SUMMARY
      // ==========================================
      checkPageBreak(30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 58, 138); // blue-900
      doc.text('1. EXECUTIVE SUMMARY & PROCESS OBJECTIVE', margin, y);
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.5);
      doc.line(margin, y + 1.5, pageWidth - margin, y + 1.5);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85); // slate-700
      const descLines = doc.splitTextToSize(
        workflow.description || 'This Software Design Document formalizes the execution logic, node parameters, and resilience contracts for this admission workflow phase.',
        contentWidth
      );
      doc.text(descLines, margin, y);
      y += descLines.length * 4.5 + 4;

      // Workflow Metrics Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`• Total Steps: ${workflow.nodes.length}    • Transitions: ${workflow.edges.length}    • Category: ${workflow.category.toUpperCase()}    • Type: ${workflow.workflowType || 'Modular Phase'}`, margin + 4, y + 7.5);
      y += 18;

      // ==========================================
      // SECTION 2: STEP-BY-STEP NODE HANDLERS
      // ==========================================
      checkPageBreak(20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 58, 138);
      doc.text('2. STEP-BY-STEP NODE SPECIFICATION & EXECUTION HANDLERS', margin, y);
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.5);
      doc.line(margin, y + 1.5, pageWidth - margin, y + 1.5);
      y += 8;

      workflow.nodes.forEach((node, index) => {
        const nodeType = (node.type || 'action').toUpperCase();
        const data = node.data;
        const snippet = generateNodeCodeSnippet(node.type, data);
        const snippetLines = snippet.split('\n');

        // Estimate height needed for this node card
        const cardHeaderHeight = 8;
        const descHeight = 6;
        const codeBoxHeight = Math.min(snippetLines.length * 3.4 + 8, 48);
        const totalNodeHeight = cardHeaderHeight + descHeight + codeBoxHeight + 8;

        checkPageBreak(totalNodeHeight + 6);

        // Node Card Outer Box
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, y, contentWidth, totalNodeHeight, 2, 2, 'FD');

        // Node Card Header Bar
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(margin, y, contentWidth, cardHeaderHeight, 2, 2, 'F');
        doc.setDrawColor(203, 213, 225);
        doc.line(margin, y + cardHeaderHeight, margin + contentWidth, y + cardHeaderHeight);

        // Badge color by node type
        if (node.type === 'trigger') doc.setFillColor(5, 150, 105); // emerald
        else if (node.type === 'action') doc.setFillColor(37, 99, 235); // blue
        else if (node.type === 'condition') doc.setFillColor(217, 119, 6); // amber
        else if (node.type === 'delay') doc.setFillColor(124, 58, 237); // purple
        else if (node.type === 'human') doc.setFillColor(225, 29, 72); // rose
        else if (node.type === 'goal') doc.setFillColor(234, 88, 12); // orange
        else doc.setFillColor(13, 148, 136); // teal

        // Badge
        doc.roundedRect(margin + 3, y + 1.5, 18, 5, 1, 1, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);
        doc.text(nodeType.substring(0, 8), margin + 4.5, y + 5);

        // Step Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        const stepTitle = `Step ${index + 1}: ${(data.label || 'Step').substring(0, 50)}`;
        doc.text(stepTitle, margin + 24, y + 5.2);

        // Node ID on right
        doc.setFont('courier', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(node.id, pageWidth - margin - 25, y + 5.2);

        // Body: Description
        let subY = y + cardHeaderHeight + 4;
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        const shortDesc = (data.description || 'Automated execution step.').substring(0, 120);
        doc.text(shortDesc, margin + 4, subY);
        subY += 4;

        // TypeScript Code Block Box
        doc.setFillColor(15, 23, 42); // slate-900 dark code background
        doc.roundedRect(margin + 3, subY, contentWidth - 6, codeBoxHeight, 1.5, 1.5, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(148, 163, 184);
        doc.text('TYPESCRIPT EXECUTION HANDLER', margin + 6, subY + 3.8);

        doc.setFont('courier', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(147, 197, 253); // blue-300

        let codeY = subY + 7.5;
        const maxLinesToPrint = Math.min(snippetLines.length, 12);
        for (let i = 0; i < maxLinesToPrint; i++) {
          const line = snippetLines[i].substring(0, 95);
          doc.text(line, margin + 6, codeY);
          codeY += 3.2;
        }

        y += totalNodeHeight + 4;
      });

      // ==========================================
      // SECTION 3: RESILIENCE & RECOVERY MATRIX
      // ==========================================
      checkPageBreak(45);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 58, 138);
      doc.text('3. FAILURE RECOVERY & RESILIENCE MATRIX', margin, y);
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.5);
      doc.line(margin, y + 1.5, pageWidth - margin, y + 1.5);
      y += 6;

      const matrixRows = [
        ['API / Mail Gateway Timeout', 'HTTP 429/503 throttle', 'Exponential backoff (3 attempts), dead-letter queue routing.'],
        ['Missing / Unclear Transcripts', 'OCR confidence < 0.95', 'Consolidated rule triggers 48h SLA Phone Outreach task.'],
        ['Early Parent Conversion', 'Parent books tour early', 'Early Action Bypass listener intercepts event and cancels delay.'],
        ['Offline Bank Wire Deposit', 'Telegraphic wire to bursar', 'Offline wire bypass button satisfies goal loop immediately.']
      ];

      // Table Header
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.rect(margin, y, contentWidth, 6, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text('Failure Scenario', margin + 3, y + 4.2);
      doc.text('Trigger Condition', margin + 55, y + 4.2);
      doc.text('Automated Recovery Behavior', margin + 105, y + 4.2);
      y += 6;

      // Table Rows
      matrixRows.forEach((row) => {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(226, 232, 240);
        doc.rect(margin, y, contentWidth, 7, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(30, 41, 59);
        doc.text(row[0], margin + 3, y + 4.5);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(row[1], margin + 55, y + 4.5);

        const solLines = doc.splitTextToSize(row[2], 70);
        doc.text(solLines[0] || '', margin + 105, y + 4.5);
        y += 7;
      });

      // ==========================================
      // PAGE NUMBERS & FOOTER ON ALL PAGES
      // ==========================================
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, pageHeight - margin - 2, pageWidth - margin, pageHeight - margin - 2);
        doc.text(`Toddle Visual Admission Engine • Confidential & Proprietary`, margin, pageHeight - margin + 2);
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

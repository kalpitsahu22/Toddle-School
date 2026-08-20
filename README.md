# Toddle Workflow Builder Playground 🚀

A production-grade, plug-and-play **Visual Workflow Builder Playground** engineered for K-12 and higher-education institutions (e.g., Toddle Operating System). It enables schools to visually create, configure, modify, test, and execute their own end-to-end admission, enquiry, and onboarding workflows without engineering changes.

---

## 🌟 Key Highlights & Assessment Requirements Met

1. **Plug-and-Play Graph Architecture**: Workflows are NOT hardcoded. Every workflow is a declarative graph composed of configurable nodes and edges.
2. **Flagship Toddle 9-Phase Workflow Template**: Accurately models all 9 phases from the Toddle assessment specification:
   - **Phase 1: Lead Capture & Enquiry Nurturing** (AI Prospectus, Virtual Tour, 3-Day Digest Delay, Open House Branch)
   - **Phase 2: Application Submission & Staff Routing** (AI OCR Document Pre-validation, Route by Grade Band & Category to Primary, Secondary IB, Boarding, or Financial Aid)
   - **Phase 3: Document Verification & SLA Escalation Loop** (Mandatory Docs Validation, 48h SLA Escalation to Officer Call)
   - **Phase 4: Assessment & Interview Scheduling** (Faculty Calendar Sync, Date-anchored 24h WhatsApp/SMS Reminder, AI Evaluation Rubric)
   - **Phase 5: Admissions Committee Decision** (Human Review Node with 4 outcomes: Admit, Waitlist, Conditional Offer, Decline)
   - **Phase 6: Waitlist Auto-Promotion** (Waitlist seat available trigger -> Auto-pull top candidate -> Re-enter offer)
   - **Phase 7: Offer Acceptance & Fee Reminders** (Offer Letter PDF with 7-day payment link, Persistent Goal checking with **Offline Bank Wire Bypass**)
   - **Phase 8: Post-Offer Acceptance & Onboarding** (Payment Receipt & Pack, Medical & Bus transport forms goal loop, Student ID generation)
   - **Phase 9: LMS / SIS Handover** (API profile sync to School SIS ERP, provision student/parent portal accounts, homeroom & bus route allocation, Terminal state: Active Enrolled)
3. **Alternative Workflow Templates**:
   - **Simplified Fast-Track Admission (School B)**: Omit interview and committee steps directly.
   - **International & Boarding Student Admission**: Specialized visa OCR, English interview, and boarding deposit goal.
   - **Blank Canvas**: Start from scratch with interactive drag-and-drop.
4. **Interactive Execution Simulator Engine**:
   - Play (▶), Pause (⏸), Step Next (⏭), Reset (↺), and Speed Control (0.5x, 1x, 2x)
   - Real-time visual states (`running` pulse, `waiting` glow, `completed` check, `failed` alert)
   - **Human-in-the-Loop Decision Reviewer**: Interactive banner allowing committee members to choose Admit / Waitlist / Conditional / Decline and watch the workflow dynamically branch in real time.
   - **Persistent Goal Node Evaluator**: Demonstrates persistent objective looping with an instant **Simulate Offline Bank Wire Confirmation** bypass action.
   - **Live Variable & Applicant Scenario Switcher**: Switch between Grade 7 Standard, Primary Grade 3, International Boarding, Missing Docs SLA Loop, and Offline Wire scenarios.
5. **Graph Validation Diagnostics**: Detects missing triggers, broken edges, disconnected nodes, unconfigured mandatory fields, and missing fallback branches.
6. **Persistence & Portability**: Automatically saves all workflows to `localStorage`, with support for JSON Export & Import, Duplication (deep-copy with independent ID), and Versioning (`Draft` → `Published` v1, v2...).
7. **Interactive SDD (System Design Document) Modal**: Built directly into the application top navigation bar for seamless technical interview walkthroughs.

---

## 🛠️ Technology Stack

- **Framework**: React 18 + TypeScript + Vite
- **Graph Canvas Engine**: `@xyflow/react` (React Flow)
- **State Management**: Zustand with `localStorage` persistence
- **Styling**: Tailwind CSS + Custom Dark Modern SaaS Theme
- **Graph Layout**: Dagre hierarchy auto-layout
- **Icons**: Lucide React

---

## 📁 Project Structure

```text
toddle-workflow-builder/
├── src/
│   ├── types/
│   │   ├── workflow.ts          # Graph model: Workflow, WorkflowNode, WorkflowEdge, NodeData
│   │   └── execution.ts         # Runtime model: ExecutionContext, ApplicantProfile, Logs
│   ├── data/
│   │   ├── nodeDefinitions.ts   # Declarative registry of all node types, schemas & handles
│   │   └── exampleWorkflows.ts  # Toddle 9-Phase, Simplified, International, Blank workflows
│   ├── store/
│   │   └── workflowStore.ts     # Zustand store with persistence, graph editing & execution
│   ├── validation/
│   │   └── workflowValidator.ts # Graph validator for connectivity, triggers & branch rules
│   ├── engine/
│   │   ├── nodeExecutor.ts      # Dedicated executor for Trigger, Action, Condition, Delay, Human, Goal, System
│   │   └── workflowExecutor.ts  # Graph traversal engine, mock applicant profiles & handle routing
│   ├── components/
│   │   ├── builder/
│   │   │   ├── WorkflowToolbar.tsx    # Workflow selector, version, auto-layout, test, save, SDD
│   │   │   ├── NodeLibrary.tsx        # Searchable, draggable categorized node library
│   │   │   ├── WorkflowCanvas.tsx     # React Flow canvas with custom nodes, minimap & controls
│   │   │   ├── ConfigurationPanel.tsx # Dynamic inspector for emails, SIS mapping, rules, SLAs
│   │   │   ├── ExecutionPanel.tsx     # Bottom execution console with human action trigger & logs
│   │   │   ├── ArchitectureModal.tsx  # In-app System Design Document (SDD) viewer
│   │   │   ├── JsonModal.tsx          # Export & Import workflow JSON dialog
│   │   │   └── ValidationModal.tsx    # Diagnostic issues viewer
│   │   ├── nodes/
│   │   │   ├── TriggerNode.tsx        # Styled trigger card
│   │   │   ├── ActionNode.tsx         # Service action card (Email, WhatsApp, OCR, PDF, SIS)
│   │   │   ├── ConditionNode.tsx      # Multi-branching diamond logic card
│   │   │   ├── DelayNode.tsx          # Timer & SLA delay card
│   │   │   ├── HumanNode.tsx          # Human review card with decision ports
│   │   │   ├── GoalNode.tsx           # Persistent target goal card
│   │   │   └── SystemNode.tsx         # SIS handover & account provisioning card
│   │   ├── edges/
│   │   │   └── CustomEdge.tsx         # Animated bezier/step edge with styled branch labels
│   │   └── workflows/
│   │       └── CreateWorkflowModal.tsx # New workflow modal (Blank / Template / Duplicate)
│   ├── App.tsx                        # Master 3-column builder layout
│   ├── main.tsx                       # Entry point
│   └── index.css                      # Tailwind design tokens & typography
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## ⚡ How to Run Locally

### Prerequisites
- Node.js (v18 or v20+)
- npm (v9+)

### Installation & Startup
```bash
# 1. Install dependencies
npm install

# 2. Start the local development server
npm run dev

# 3. Open in your browser
http://localhost:5173/
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 📐 System Design & Architecture (For Interviews)

### 1. Architectural Pipeline

```text
React Flow UI
     │  (Drag & Drop, Visual Connections)
     ▼
Zustand Workflow Store
     │  (Normalized Workflows, Active Graph State)
     ▼
Graph Validator
     │  (Checks Triggers, Disconnected Ports, Incomplete Configs)
     ▼
Execution Simulator Engine
     │  (State Machine Traversal, Handle Routing, Paused States)
     ▼
Local Persistence & Portable JSON
```

### 2. Node Execution Lifecycle

1. **Create**: User drags a node from the Node Library onto the canvas.
2. **Configure**: User selects the node to edit parameters (e.g. merge tags `{{applicant.email}}`, SIS field mapping table, condition rules).
3. **Validate**: Graph validator verifies port connectivity and mandatory settings.
4. **Execute**: State machine evaluates node logic (evaluating rules, simulating async network delay).
5. **Pause / Branch**:
   - If **Human Node**: Pauses with `WAITING FOR HUMAN ACTION` banner until staff reviews and selects an outcome (`Admit`, `Waitlist`, `Conditional Offer`, `Decline`).
   - If **Goal Node**: Persistently evaluates target objective (e.g., fee payment) over multiple attempts with support for instant **Offline Wire Bypass**.
   - If **Condition Node**: Dynamically chooses outgoing branch (`TRUE`/`FALSE` or custom grade routes).
6. **Complete**: Reaches terminal handover node, provisions student accounts, and transitions to `Active Enrolled`.

### 3. Difference: Goal Node vs. Condition Node

- **Condition Node**: Evaluates a snapshot at a single point in time (e.g., *Is Grade >= 6?*). Never pauses execution; routes immediately down branch A or branch B.
- **Goal Node**: Models a persistent objective (e.g., *Fee Payment within 7 Days*). Evaluates repeatedly over a cadence, sends escalating reminders on non-completion, handles timeout expiry, and supports manual out-of-band resolution (e.g. bursar confirming offline bank wire).

---

## 🚀 How This Architecture Evolves to Production

```text
                    Workflow Builder (React / XYFlow)
                                   │
                                   ▼ [REST / GraphQL]
                         Workflow API Gateway
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
         Workflow Definition DB              Event Bus
          (PostgreSQL / DynamoDB)      (Kafka / AWS EventBridge)
                                                  │
                                                  ▼
                                     Distributed Orchestrator
                                   (Temporal.io / Cadence / Celery)
                                     /            │           \
                                    /             │            \
                            Action Workers    Durable Delay   Human Task
                            (Email, SIS, OCR)   Timers         Service
                                    \             │            /
                                     \            │           /
                                      ▼           ▼          ▼
                                          Execution Store
                                    (Postgres / ClickHouse Logs)
```

---

## 🌐 Deploy to Vercel

This repository is 100% Vercel-compatible out of the box.

1. Push this repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com).
3. Framework Preset: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Click **Deploy**.

---

## 📄 License
MIT © 2026 Toddle Workflow Builder Playground

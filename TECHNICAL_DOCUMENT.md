# System Technical Document (STD): Workflow Builder Architecture

## 1. Executive Summary & Design Philosophy

This document outlines the architecture, data models, state-management strategy, execution engine, and production roadmap for the **Toddle Workflow Builder Playground**.

The system is designed with a core principle: **Workflows are NOT hardcoded React components or monolithic diagrams. They are decoupled, event-driven directed graphs executed by an asynchronous state-machine engine.**

---

## 2. Decoupled Modular Workflows vs. Monolithic "Mega-Flow"

### The Problem with Monolithic Workflow Graphs
A single monolithic admission graph spanning 15–20 steps creates operational fragility:
- Any modification in the interview step risks breaking unrelated lead capture or post-offer onboarding automations.
- It falsely couples distinct phases: for instance, a transfer student directly submitting an application would be forced to start at an "Enquiry" trigger.
- Complex nested branches (e.g. separate yes/no checks for birth cert, passport, transcripts) create "diagram clutter" and frustrate admissions staff.

### The Decoupled Event-Driven Solution
Admissions is decomposed into **7 independent, modular workflows**, each initiated by its own discrete event trigger:

```text
┌──────────────────────────────────────────────┐
│ 1. Lead Capture & Enquiry Nurturing Flow     │ ──► Emits: "tour.booked" / "lead.nurtured"
└──────────────────────────────────────────────┘
                       │
┌──────────────────────────────────────────────┐
│ 2. Application Submission & Staff Routing    │ ──► Emits: "application.routed"
└──────────────────────────────────────────────┘
                       │
┌──────────────────────────────────────────────┐
│ 3. Consolidated Doc Verification & SLA Loop  │ ──► Emits: "documents.verified"
└──────────────────────────────────────────────┘
                       │
┌──────────────────────────────────────────────┐
│ 4. Assessment & Faculty Interview Scheduling │ ──► Emits: "interview.completed"
└──────────────────────────────────────────────┘
                       │
┌──────────────────────────────────────────────┐
│ 5. Admissions Committee Decision & Offer     │ ──► Emits: "offer.generated"
└──────────────────────────────────────────────┘
                       │
┌──────────────────────────────────────────────┐
│ 6. Offer Acceptance & Fee Collection Loop    │ ──► Emits: "fee.paid"
└──────────────────────────────────────────────┘
                       │
┌──────────────────────────────────────────────┐
│ 7. Post-Offer Onboarding & SIS Handover      │ ──► Terminal: "student.active_enrolled"
└──────────────────────────────────────────────┘
```

Each workflow can run independently, be modified without affecting other phases, or be omitted entirely (e.g., School B omitting Phase 4 and Phase 5 for Direct Admission).

---

## 3. Handling Delays & Early Actions (Timer Cancellation Algorithm)

### The Challenge
If a workflow specifies a 3-day nurture delay, but the parent books a campus tour or submits the application after 4 hours, forcing the system or user to wait out the remaining 68 hours causes critical communication delays.

### State Machine Solution: Event-Driven Delay Cancellation
Every `DelayNode` is configured with `allowEarlyActionBypass: true` and an array of `earlyActionEvents: ['tour.booked', 'application.started', 'payment.received']`.

```text
               ┌───────────────────────┐
               │    Delay Active       │
               │ (e.g. Wait 3 Days)    │
               └──────────┬────────────┘
                          │
         ┌────────────────┴────────────────┐
         │                                 │
 [Timer Expires (72h)]         [Event Emitted: "tour.booked"]
         │                                 │
         ▼                                 ▼
   Natural Resume                 ⚡ Instant Delay Bypass
         │                        (Cancel Timer & Proceed)
         └────────────────┬────────────────┘
                          ▼
               [Next Downstream Node]
```

---

## 4. Consolidated Document Verification (Zero Frustrating Branches)

Rather than having individual decision branches for every single uploaded file (Birth Certificate → Transcripts → Passport → Medical), the builder provides a **Consolidated Document Verification Node**:
- **Single-Pass Validation**: Validates all mandatory documents in one atomic pass.
- **Built-in SLA Escalation Rule**: If any mandatory document is missing or rejected after the configured SLA window (e.g. 48 hours), it escalates to an officer call directly without requiring 6 separate decision diamond nodes.

---

## 5. Complete JSON Data Model Specifications

### 5.1 Workflow Schema
```typescript
interface Workflow {
  id: string;                               // Unique identifier (e.g. "wf-mod-1-lead-capture")
  name: string;                             // Human-readable title
  description: string;                      // Business purpose
  category: 'admission' | 'enquiry' | 'onboarding' | 'custom';
  workflowType: 'modular_phase' | 'full_blueprint' | 'custom';
  emittedEventOnComplete?: string;          // Downstream event (e.g. "documents.verified")
  version: number;                          // Version counter (v1, v2...)
  status: 'draft' | 'published' | 'archived';
  nodes: WorkflowNode[];                    // Array of graph nodes
  edges: WorkflowEdge[];                    // Array of directional graph connections
  createdAt: string;                        // ISO timestamp
  updatedAt: string;
  tags?: string[];
}
```

### 5.2 Node Schema
```typescript
interface WorkflowNode {
  id: string;                               // Unique node ID (e.g. "node-p1-trigger")
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'human' | 'goal' | 'system';
  position: { x: number; y: number };       // Canvas 2D coordinates
  data: {
    label: string;                          // Node title
    subtitle?: string;
    category: NodeCategory;
    phase?: string;
    nodeSubtype?: string;

    // Trigger config
    triggerEvent?: string;
    formName?: string;

    // Action config
    actionService?: 'email' | 'whatsapp' | 'sms' | 'ocr_scanner' | 'pdf_generator' | 'sis_sync';
    recipient?: string;                     // Merge tag e.g. "{{applicant.email}}"
    subject?: string;
    bodyContent?: string;
    sisEndpoint?: string;
    fieldMappings?: FieldMapping[];

    // Condition config
    conditionRules?: Array<{
      field: string;
      operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
      value: unknown;
    }>;
    branches?: Array<{ handleId: string; label: string; color?: string }>;

    // Delay & Early Action config
    delayDuration?: number;
    delayUnit?: 'minutes' | 'hours' | 'days';
    allowEarlyActionBypass?: boolean;
    earlyActionEvents?: string[];

    // Human review config
    humanTaskTitle?: string;
    assignedRole?: string;
    timeoutHours?: number;
    allowedOutcomes?: Array<{ actionId: string; label: string; variant: string }>;

    // Persistent Goal config
    goalTargetMetric?: string;
    goalCheckIntervalHours?: number;
    goalMaxAttempts?: number;
    goalFastTrackBypass?: boolean;          // Enables manual bursar wire bypass

    // Async Resilience
    retryPolicy?: {
      enabled: boolean;
      maxRetries: number;
      retryDelaySeconds: number;
      backoff: 'fixed' | 'exponential';
      onFinalFailure: 'stop_workflow' | 'route_to_fallback';
    };
  };
}
```

### 5.3 Edge Schema
```typescript
interface WorkflowEdge {
  id: string;
  source: string;                           // Source node ID
  target: string;                           // Target node ID
  sourceHandle?: string;                    // Handle port ID ('true', 'false', 'admit', 'success')
  targetHandle?: string;
  label?: string;                           // Visual branch label
  animated?: boolean;
}
```

---

## 6. Frontend Canvas & State Management Architecture

The frontend application employs a **normalized, unidirectional state architecture** powered by **Zustand** and **@xyflow/react**:

```text
┌─────────────────────────────────────────────────────────────┐
│                    Zustand Workflow Store                   │
├──────────────────────────────┬──────────────────────────────┤
│ Workflows Dictionary         │ Active Workflow State        │
│  - Modular 7 Flows           │  - Selected Node             │
│  - Full Blueprints           │  - Validation Diagnostics    │
├──────────────────────────────┼──────────────────────────────┤
│ Execution Simulator Context  │ Canvas State Sync            │
│  - Live Applicant Variables  │  - Node Position Changes     │
│  - Execution Event Logs      │  - Handle Connections        │
│  - Active Delay/Goal Timers  │  - Dagre Auto-Layout         │
└──────────────────────────────┴──────────────────────────────┘
```

1. **Normalized Persistence**: State changes serialize directly to `localStorage`. Page refreshes restore the exact node coordinates, custom handles, and configurations.
2. **Deep Duplication**: Cloning any workflow performs a deep-copy with regenerated UUIDs to prevent cross-workflow state leakage.
3. **Graph Validation Engine**: Runs static analysis on every mutation to detect missing triggers, orphan nodes, unconfigured mandatory fields, or missing branch fallbacks before publishing.

---

## 7. Production-Scale Distributed Backend Roadmap

In a production enterprise deployment (e.g. Toddle Cloud Infrastructure), this client-side simulator maps to a distributed execution cluster:

```text
                         Visual Workflow Builder (React / Vite)
                                          │
                                          ▼ [REST / GraphQL]
                                Workflow API Gateway
                                          │
                        ┌─────────────────┴─────────────────┐
                        ▼                                   ▼
             Workflow Definition DB                     Event Bus
            (PostgreSQL / DynamoDB)               (Apache Kafka / EventBridge)
                                                            │
                                                            ▼
                                                Distributed Orchestrator
                                             (Temporal.io / Cadence Engine)
                                               /            │           \
                                              /             │            \
                                      Action Workers    Durable Delay   Human Task
                                    (Email, SIS, OCR)   Timers (Redis)   Service
                                              \             │            /
                                               \            │           /
                                                ▼           ▼          ▼
                                                    Execution Store & Logs
                                                  (Postgres / Elasticsearch)
```

- **Idempotency**: All action workers generate deterministic idempotency keys based on `(executionId, nodeId, attempt)` to prevent duplicate emails or SIS writes.
- **Durable Timers**: 3-day delays are managed by Temporal durable timers rather than memory threads, ensuring zero loss during server restarts.
- **Event-Driven Wakeup**: If a parent completes a form before the delay ends, the Event Bus routes the cancellation signal to the Temporal workflow instance, waking it up instantly.

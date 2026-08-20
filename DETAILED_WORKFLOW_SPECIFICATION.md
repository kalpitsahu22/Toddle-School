# Toddle Admission Workflow: Comprehensive End-to-End Specification

---

## 1. Purpose & Core Principle

The Toddle Admission Workflow manages a prospective student's journey end-to-end:
```text
Enquiry ──► Application ──► Documents ──► Assessment ──► Decision ──► Payment ──► Onboarding ──► Active Enrolled
```

### Core Operating Principle
> **"No student should get permanently stuck because of a missing document, failed communication, expired deadline, payment failure, staff delay, or unexpected status change."**

The workflow combines automated progression (status changes, merge-field notifications, delay timers) with human-controlled decisions (academic rubric review, committee approvals, manual bursar overrides, counselor outreach).

---

## 2. Recognised Entry Triggers & Duplicate Deduplication

### Entry Triggers
The workflow can initiate from any of the following entry points, resolving to a unified downstream pipeline once an applicant record exists:
1. **Admission Enquiry / Website Form Submitted**: Prospective parent seeks prospectus or campus tour.
2. **Walk-in Lead Created by Counselor**: Direct manual entry by the front desk.
3. **Lead Imported from External System**: CSV/CRM import from marketing campaigns.
4. **Previous Applicant Re-applies for a New Academic Year**: Returning family.
5. **Referral-Generated Enquiry**: Word-of-mouth or partner school referral.

### Duplicate & Existing-Applicant Check
Runs before any other processing, matching on Student Full Name, Date of Birth, Guardian Email/Phone, National ID, or Prior Application ID:
- **Exact Duplicate Match**: Automatically attaches enquiry to existing record; suppresses duplicate welcome messages; continues from current lifecycle stage.
- **Possible / Borderline Duplicate**: Flagged for staff manual review rather than auto-merged.
- **Siblings**: Separate student records created but linked under a single family/guardian profile.
- **Previously Rejected / Withdrawn Applicants**: Permitted to re-apply if institutional policy and admission cycle permit.

---

## 3. Status Lifecycle State Machine

Statuses form a strict state machine rather than free text:

```text
[New Enquiry] ──► [Contacted] ──► [Qualified] ──► [Application Started] ──► [Applied]
                                                                               │
                                                                               ▼
[Documents Verified] ◄── [Documents Pending / Under Review] ◄── [Under Review]
         │
         ▼
[Assessment / Interview Scheduled] ──► [Interview Completed] ──► [Decision Pending]
                                                                        │
                        ┌───────────────────────────────────────────────┤
                        ▼                                               ▼
              [Waitlisted / Declined]                               [Offered]
                        │                                               │
                        ▼ (Seat Opens)                                  ▼
              [Offered (Promoted)] ──────────────────────────────► [Fee Pending]
                                                                        │
                                                                        ▼
                                                              [Enrolled & Active]
```

### Global Exit States
- `Withdrawn` (Family voluntarily cancels)
- `Expired` (Application or offer deadline elapsed without response)
- `Duplicate` (Merged into primary profile)
- `Ineligible` (Age or prerequisite grade criteria not met)
- `Rejected / Declined` (Formal committee decision)
- `Payment Failed / Offer Expired` (Fee payment deadline elapsed)

---

## 4. Phase-by-Phase Detailed Breakdown

---

### Phase 1: Lead Capture & Enquiry Nurturing

#### 1. Trigger / Entry
Website enquiry form or admission inquiry submitted before qualification.

#### 2. Key Actions in Execution Order
1. **Set Status: `Enquiry`**: Record becomes a trackable lead the instant the form is submitted.
2. **Action: AI-Personalized Prospectus & Virtual Tour**: Immediate merge-field email (grade, campus, academic curriculum) dispatched while family intent is at its highest.
3. **Delay: Wait 3 Days (Nurture Window with Early Action Cancellation)**: Gives the family time to digest the prospectus. If the parent books a tour on Day 1, the 3-day delay is **instantly cancelled** and bypassed.
4. **Branch: Campus Tour Booked?**:
   - **Tour Booked (High-Touch Path)**: Set status `Tour Scheduled` → Action: Parent Attends Open Day / Campus Visit → Branch: `Application Started Post-Tour?`
   - **No Tour Booked (Digital Nurture Path)**: Communicate Open House Invitation & Value Highlights → Delay 4 Days → Branch: `Application Started?`
5. **Communicate: Final Lead Nurture / Archive**: If neither path converts after structured attempts, lead is archived (not deleted) for next year's cycle.

#### 3. Scenario & Edge Case Handled
*Scenario*: A parent who never books a tour and ignores nurture emails is not chased indefinitely. After two structured nurture attempts, the lead is quietly archived with full history preserved.

---

### Phase 2: Application Submission & Staff Routing

#### 1. Trigger / Entry
Formal admission application submitted by parent/guardian.

#### 2. Key Actions in Execution Order
1. **Set Status: `Applied`**: Marks transition from browsing to committed applicant; starts internal SLA clocks.
2. **Communicate: Application Received & Portal Magic Link**: Immediate confirmation with frictionless passwordless login link.
3. **Action: AI Scans Uploaded Documents via OCR**: Pre-validates file readability, checks orientation, and extracts key fields (DOB, full name, previous grade) before staff opens the file.
4. **Branch: Route by Grade Band & Student Category**:
   - **Early Years / Primary (Grades K–5)**: Routed to *Primary Admissions Team*.
   - **Middle / High School (Grades 6–12)**: Routed to *Secondary & IB Coordinator*.
   - **Boarding / Overseas**: Routed to *International Admissions Lead*.
   - **Financial Aid / Scholarship**: Routed to *Scholarship & Bursar Desk*.
5. **Set Status: `Under Review`**: Hands applicant off to the named owning team.

#### 3. Scenario & Edge Case Handled
*Scenario*: A boarding applicant from overseas is automatically routed to the International Admissions Lead rather than sitting in a generic inbox where visa deadlines might be missed.

---

### Phase 3: Document Verification & SLA Escalation Loop

#### 1. Trigger / Entry
Required document checklist submitted or uploaded by parent.

#### 2. Key Actions in Execution Order
1. **Branch: Consolidated Mandatory Documents Complete?**:
   - Evaluates mandatory items: Birth Certificate, Previous School Transcripts, ID/Passport.
   - **Verified & Complete**: Proceeds immediately to Phase 4 (Assessment / Interview).
   - **Missing / Invalid Docs**: Enters SLA Escalation Loop.
2. **Action: Missing Documents Alert with Upload Link**: Auto-generates exact list of missing/rejected documents.
3. **Delay: 48-Hour SLA Buffer**:
4. **Human Action: 48h SLA Escalation — Officer Calls Parent**:
   - If documents are not uploaded within 48 hours, system creates an urgent outreach task for the admissions officer to call the family.
   - Officer can approve an exemption, assist with upload, or grant an extension.

#### 3. Scenario & Edge Case Handled
*Scenario*: A rejected transcript does not abort the application. The bounded retry loop alerts the parent, and if still unresolved after 48h, escalates to a direct phone call before the applicant goes cold.

---

### Phase 4: Assessment & Faculty Interview Scheduling

#### 1. Trigger / Entry
Documents verified and assessment/interview is required for the grade band.

#### 2. Key Actions in Execution Order
1. **Set Status: `Interview Scheduled`**: Signals to both staff and parent dashboards.
2. **Communicate: Staff Booking Calendar Link Synced to Teacher Availability**: Parent self-selects slot against real interviewer calendar.
3. **Delay: Wait Until 24 Hours Before Interview**: Date-anchored delay (not a fixed duration) ensuring reminder lands exactly 1 day prior.
4. **Communicate: 24h Multi-Channel SMS & WhatsApp Reminder**: Includes campus map, parking details, and faculty name to reduce no-show rates.
5. **Action: Interview Conducted & AI Evaluation Rubric Submitted**: Outcome captured in a structured rubric comparing candidates across standard academic & behavioral criteria.

#### 3. Scenario & Edge Case Handled
*Scenario*: If the student does not show up, the workflow does not silently fail. A *no-show* is logged as its own outcome, the admissions team is alerted, and rescheduling is offered.

---

### Phase 5: Admissions Committee Decision

#### 1. Trigger / Entry
Interview rubric submitted, or direct entry from document verification (if school omits interviews).

#### 2. Key Actions in Execution Order
1. **Human Decision Node: Admissions Committee Review**:
   - **Admit**: Set status `Offered` → Advances to Offer Generation (Phase 7).
   - **Waitlist**: Set status `Waitlisted` → Dispatches *Waitlist Ranking Notification* (eligible, not rejected).
   - **Conditional Offer**: Dispatches *Conditional Offer & Trackable Checklist* (e.g. pending final term transcript).
   - **Decline**: Set status `Declined` → Dispatches *Empathetic Regret Letter* while preserving full history for re-application.

#### 3. Scenario & Edge Case Handled
*Scenario*: Two borderline candidates receive individualized committee decisions. The automation executes what humans judged without hardcoding decision bias.

---

### Phase 6: Waitlist Auto-Promotion

#### 1. Trigger / Entry
A seat opens up in a previously filled grade/campus cohort.

#### 2. Key Actions in Execution Order
1. **Action: Auto-Pull Top Candidate from Waitlist**: Applies school priority rules (rank, date added, category).
2. **Set Status: `Offered (Promoted from Waitlist)`**: Automatically enters the standard offer workflow (Phase 7).

#### 3. Scenario & Edge Case Handled
*Scenario*: If a promoted family declines, the system automatically moves to the next eligible waitlisted candidate without manual spreadsheet checks.

---

### Phase 7: Offer Acceptance & Fee Reminders (Persistent Goal)

#### 1. Trigger / Entry
Offer generated (fresh admit or waitlist promotion).

#### 2. Key Actions in Execution Order
1. **Communicate: Official Offer Letter (PDF) + Dynamic Payment Link**: 7-day explicit expiry deadline.
2. **Persistent Goal: Admission Fee Paid within 7 Days?**:
   - Checks fee status every 24 hours (up to 7 attempts).
   - **Day 3**: Reminder #1 (4 days remaining).
   - **Day 5**: Urgent Alert (SMS & Email, 24h remaining).
   - **Day 7 Unpaid**: Offer Expired → Releases seat to waitlist pool.
   - **Paid / Bank Wire Confirmed**: Instantly cancels remaining reminders and advances to Phase 8!

#### 3. Scenario & Edge Case Handled (Bursar Offline Bank Wire Bypass)
*Scenario*: A parent pays via offline bank wire. The bursar clicks "Confirm Offline Payment". This single action **instantly satisfies the persistent goal**, cancels all future reminders, and jumps the student to Enrollment.

---

### Phase 8: Post-Offer Acceptance & Onboarding

#### 1. Trigger / Entry
Admission fee payment confirmed.

#### 2. Key Actions in Execution Order
1. **Communicate: Payment Receipt & Welcome-to-School Pack**: Immediately reframes relationship to incoming family.
2. **Communicate: Medical History & Bus Transport Data Collection**: Front-loads operational data collection.
3. **Delay: 5-Day Grace Period**:
4. **Action: Generate Student ID & School Zone Confirmation**: Administrative creation of permanent student profile.

#### 3. Scenario & Edge Case Handled
*Scenario*: A family stalling on a medical form does not block enrollment. The system continues reminder cadence while core student ID and provisioning proceed in parallel.

---

### Phase 9: LMS & Student Information System (SIS) Handover

#### 1. Trigger / Entry
Onboarding forms complete and student ID generated.

#### 2. Key Actions in Execution Order
1. **Action: Sync Student & Family Profile to School SIS / ERP via API**: Hands source-of-truth role to core SIS.
2. **Action: Provision Student & Family Platform Accounts**: Parent and student credentials provisioned before day one.
3. **Action: Assign Homeroom Teacher, Bus Route & Notify School Nurse**: Automated operational assignments.
4. **Communicate: Orientation Day Invitation & Class Timetable**: Final touchpoint handing family their first day timetable.
5. **Terminal End: `Student Active in Ecosystem`**: All admissions reminders cancelled.

---

## 5. Document Checklist & Status Values

| Status | Meaning | System Behavior |
| :--- | :--- | :--- |
| **Required** | Mandatory document must be provided | Blocks phase completion until uploaded |
| **Not Submitted** | Parent has not yet uploaded | Included in missing document reminder digest |
| **Uploaded** | File received, awaiting validation | Triggers AI OCR scan and staff review queue |
| **Under Review** | Staff / OCR validation in progress | Lock file to prevent concurrent overwrite |
| **Verified** | Accepted and approved | Marks checklist item complete |
| **Rejected** | Invalid, blurry, or expired | Generates specific correction request to parent |
| **Replacement Required**| New updated document requested | Sets 48h SLA timer |
| **Expired** | Previously valid document expired | Flags profile for renewal |

---

## 6. Exception Handling Matrix

| Scenario | System Response & Safeguard |
| :--- | :--- |
| **Duplicate / Existing Applicant** | Matches name, DOB, guardian contact. Links to existing profile, skips duplicate welcome messages, resumes current stage. |
| **Parent Withdraws Mid-Process** | Immediately cancels all scheduled reminders; sets status `Withdrawn`; preserves full audit history for future reapplication. |
| **Parent Pays via Offline Bank Wire** | Bursar marks payment received; **instantly satisfies persistent Fee Goal**; skips all reminders; jumps directly to Enrollment. |
| **Interview No-Show** | Logs no-show outcome; alerts admissions counselor; offers rescheduling link; sets `On Hold` if no response (never auto-declines). |
| **Payment Succeeded but Webhook Delayed** | Sets status `Payment Verification Pending`; avoids duplicate payment prompt; queries payment gateway API. |
| **Application Deadline Passes** | Sends final warning reminder first; notifies counselor; sets `Application Expired`; staff can still reopen if needed. |
| **Student Ineligible Mid-Process** | Triggers eligibility recheck; records specific reason code rather than silently rejecting. |
| **Two Automations Update Same Record** | Idempotency keys + status optimistic locking prevent race conditions. |
| **Staff Manual Override** | Any automated decision can be overridden by authorized staff; every override is written to the audit log. |

---

## 7. Communication Matrix

| Trigger Event | Channel | Merge Fields Used | Template Purpose |
| :--- | :--- | :--- | :--- |
| **New Enquiry** | Email | `{{applicant.parentName}}`, `{{applicant.grade}}`, `{{applicant.campus}}` | AI Personalized Prospectus & Virtual Tour |
| **Application Started, Abandoned**| Email / SMS | `{{applicant.name}}`, `{{portal.magicLink}}` | Gentle progress reminder before expiry |
| **Application Submitted** | Email | `{{applicant.id}}`, `{{applicant.name}}` | Official submission confirmation + Portal Magic Link |
| **Documents Rejected** | Email / SMS | `{{doc.name}}`, `{{doc.rejectionReason}}` | Specific correction request with direct upload link |
| **Interview Scheduled** | Email + Calendar | `{{interview.date}}`, `{{interviewer.name}}`, `{{room.link}}` | Google Calendar / Outlook sync invite |
| **24h Before Interview** | WhatsApp / SMS | `{{applicant.name}}`, `{{campus.mapUrl}}` | Date-anchored zero no-show reminder |
| **Offer Generated** | Email + PDF | `{{applicant.name}}`, `{{offer.pdfUrl}}`, `{{payment.link}}`| Official Offer Letter PDF with 7-day payment link |
| **Offer Expiring (Day 3 & 5)** | Multi-channel | `{{daysRemaining}}`, `{{payment.link}}` | Escalating reminder before seat release |
| **Payment Confirmed** | Email | `{{payment.receiptId}}`, `{{payment.amount}}` | Payment receipt + Welcome-to-School pack |
| **Active Enrolled** | Email + Portal | `{{student.id}}`, `{{homeroom.teacher}}`, `{{timetable.url}}`| Orientation invitation & first day timetable |

---

## 8. Product Success Criteria Checklist

- [x] **Clear Status**: Every applicant has an unambiguous current status and defined next action.
- [x] **Explicit Exits**: Every waiting period has a concrete exit condition.
- [x] **Auditable Recovery**: Every automated action is logged; every failed path has a recovery route.
- [x] **Reminder Cancellation**: Completed actions automatically cancel obsolete scheduled reminders.
- [x] **Independent Payment Verification**: Payment states are verified independently against payment gateway webhooks.
- [x] **Human-in-the-Loop**: Committee decisions, rubric evaluations, and exceptions remain human-controlled.
- [x] **Deduplication Safeguards**: Duplicate communications and duplicate applicant records are prevented.
- [x] **Plug-and-Play Flexibility**: Schools can add, remove, rearrange, or omit phases (e.g. no interview) without code changes.


Today 1:57 AM

CampusCast_Deck(3).pptx: "D:\Major Project 2\PPT\22-08-2026\V2\CampusCast Review 1 prep.pptx"

literature_survey_tabular(2).md: "D:\Major Project 2\literature_survey_tabular.md"

references(2).md: "D:\Major Project 2\papers\references.md"

where can i fit these in ppt and also i have a review tomorrow in morning so prep me

Yep. I went through the CampusCast deck, literature survey, references, architecture, PRD, rules, abstract, design, memory, and phase plan. 

 

 


And honestly: your current PPT is excellent as a product pitch, but for a Major Project Review it needs a small academic layer. Right now it jumps from problem → solution → features → architecture. A panel will almost certainly ask:

“What did you study from existing systems?”
“What is the research gap?”
“What are your objectives?”
“What exactly have you implemented?”
“What is your novelty?”

So don't rebuild the whole deck. Insert 3–4 academic slides into the existing 11-slide deck.

1. Exactly where to fit the literature survey
Your current deck is:

Title

Problem

Solution / What if...

How it works

Features

Security

Architecture

Roles

Development status

Why it matters

Closing



I'd change it to:

New order	Slide	Action
1	Title	Keep
2	Problem Statement	Keep
3	Objectives	ADD
4	Literature Survey	ADD
5	Research Gap / Proposed Contribution	ADD
6	Proposed Solution	Existing slide 3
7	How It Works	Existing slide 4
8	Key Features	Existing slide 5
9	Security	Existing slide 6
10	Architecture	Existing slide 7
11	Roles	Existing slide 8
12	Implementation / Phases	Existing slide 9
13	Expected/Current Results	Existing slide 10, modified
14	Conclusion / Future Scope	Existing slide 11, modified
15	References	ADD
That's a 15-slide review deck, which is completely reasonable.

2. Literature Survey — don't put all 20 papers
This is important.

Your literature survey document has 20 ranked papers, and your references document contains 25 references. 

 


Do NOT put 20 papers on one PPT slide.

For tomorrow, use 6 papers that directly establish the research progression:

Literature Survey slide
Study	Year	What it provides	Limitation / Gap
IoT-Based Smart Notice Board & Class Schedule Notification	2023	Real-time digital notice board	Doesn't use WhatsApp as publishing interface
Real-Time Cloud Based Smart Digital Notice Board	2025	Cloud-based real-time notice distribution	Requires web-based publishing
WhatsApp Integrated Information System	2025	WhatsApp API for institutional communication	Limited to attendance/notification use case
Employee Attendance Application based on WhatsApp	2025	WhatsApp-based institutional workflow	Not designed for physical digital signage
Guiding Interactive Public Displays in Education	2024	Public-display design and centralized publishing	Doesn't solve zero-friction faculty publishing
Modular Event-Driven Smart Campus Platform	2025	Event-driven real-time campus architecture	Broad smart-campus scope; no WhatsApp → signage pipeline
The first five are directly supported by your literature-survey document; the event-driven smart-campus paper is also included there. 


What you say
“The existing literature shows two separate directions. One direction focuses on digital notice boards and real-time cloud displays, while another focuses on WhatsApp-based institutional communication. However, these approaches are generally treated as separate systems. Our work combines the two: WhatsApp becomes the publishing interface, while cloud-based real-time synchronization delivers the notice to department-specific LCD displays.”

That sentence is your literature-survey money shot.

3. Immediately after Literature Survey: Research Gap
This slide is probably more important than the literature slide itself.

Title:

Research Gap & Proposed Contribution
Three columns:

Existing Digital Notice Boards
Web/admin portal required

Manual publishing workflow

Limited adoption

Often hardware-centric

No direct WhatsApp workflow

WhatsApp-Based Systems
High user familiarity

Low learning curve

Good notification capability

Mostly attendance/reminders

Not connected to physical campus signage

CampusCast
WhatsApp → publishing interface

Verified faculty identity

Department-aware routing

Real-time LCD synchronization

Scheduling + priority + media

Offline display resilience

Your literature survey specifically supports this distinction between WhatsApp systems and digital notice-board systems. 


Panel answer
If they ask:

“What is the novelty?”

Say:

“The novelty is not simply using WhatsApp or simply creating a digital notice board. The contribution is combining WhatsApp-based institutional communication with a real-time, department-scoped digital signage infrastructure, while removing the need for faculty to learn another publishing interface.”

That's much stronger than saying “Our project is unique because it uses WhatsApp.”

4. Add Objectives before Literature Survey
Your current deck doesn't explicitly show project objectives.

Put this after the problem slide.

Objectives
01 — Simplify Publishing
Allow authorized faculty to publish notices using their existing WhatsApp workflow.

02 — Real-Time Distribution
Deliver notices to department LCD displays without manual refresh or upload.

03 — Secure Communication
Authenticate publishers through registered phone numbers and verify incoming webhooks.

04 — Intelligent Notice Handling
Support priority, scheduling, department routing and media attachments.

05 — Reliable Display
Ensure displays retain their last-known-good state during connectivity failures.

These map directly to the PRD, architecture, rules and design documents. 

 

 


5. Your Architecture slide is already good
Your existing slide 7 is one of the strongest slides.

It shows:

WhatsApp → Cloud API → Cloud Function → Firestore → Display/Admin Clients

with a scheduled function handling promotion/expiry. 


For the review, however, you need to be able to explain every arrow.

Memorize this:

“A faculty member sends a WhatsApp message to the institutional number. Meta's WhatsApp Cloud API delivers the message to our webhook. The Firebase Cloud Function verifies the webhook signature, authenticates the sender, parses the department and priority information, optionally stores media in Cloud Storage, and writes the notice to Firestore. Firestore acts as the real-time source of truth. The department display listens using onSnapshot, so the notice appears without polling or manual refresh.”

That answer alone will make you look like you actually understand the architecture rather than just having a diagram.

The architecture document confirms this exact flow. 


6. Be VERY careful about your “<5 seconds” claim
Your current slide 10 says:

<5s Target publish-to-display latency (p95)

That's good because you've labelled it Target. 


If the panel asks:

“Did you achieve less than 5 seconds?”

Do not say yes unless you have actual measurements.

Say:

“Less than five seconds is our non-functional target for p95 publish-to-display latency. The current implementation is end-to-end functional, but formal latency benchmarking is part of the validation and hardening stage.”

Your PRD explicitly defines <5 seconds as a requirement, while your phase plan still has Phase 4/5 work remaining. 

 


That distinction can save you from a nasty follow-up.

7. Your “Where the build stands” slide is excellent for tomorrow
Don't say:

“The project is completed.”

Say:

“The core end-to-end system has been implemented through Phase 3, and Phase 4 multi-department pilot deployment is currently in progress.”

Your phase plan says:

Phase 0 — completed

Phase 1 — completed

Phase 2 — completed

Phase 3 — completed

Phase 4 — in progress

Phase 5 — hardening remaining. 


Specifically, the current implementation already includes:

WhatsApp webhook

HMAC verification

phone authorization

Firestore integration

display client

admin portal

roster management

screen telemetry

audit logs

urgent notices

scheduling

media attachments


 


That's a very respectable Major Project II review position.

8. Add a References slide at the end
Your final slide should NOT be “Let’s put it on a screen.”

Instead:

Slide 14 — Conclusion & Future Scope
Then:

Slide 15 — References
Don't put all 25 references.

Use the 8–10 most relevant.

I'd prioritize:

Mondal et al. — IoT-Based Smart Notice Board, 2023

Cavus et al. — IoT and Smart Campus SLR, 2022

Domínguez-Bolaño et al. — Smart Campus IoT, 2024

Müller et al. — Interactive Public Displays in Education, 2024

Implementation of WhatsApp API Notification Feature, 2023

Real-Time Cloud Based Smart Digital Notice Board, 2025

Smart Campuses: Extensive Review, 2021

Design of Smart Campus Management System, 2020

These are already in your reference set. 


9. Now let's prepare you for the review
This is the important part.

I'm going to give you the questions I'd expect a panel to attack you with.

Q1. “Explain your project in one minute.”
Your answer:

“CampusCast is a real-time digital notice distribution system for college departments. Instead of asking faculty to log into a separate portal to publish notices, we use WhatsApp as the publishing interface. An authorized faculty member sends a text, image or PDF to the institutional WhatsApp number. The WhatsApp Cloud API forwards that message to our Firebase Cloud Function, where we verify the sender and webhook signature, parse the notice and department, and store it in Firestore. Department-specific LCD displays listen to Firestore in real time and immediately render the notice. The system also supports urgent notices, scheduling, media attachments, automatic expiry, role-based access and offline display resilience.”

STOP THERE.

Don't continue explaining unless they ask.

Q2. “Why WhatsApp?”
This is probably your #1 question.

Answer:

“The main problem we identified wasn't only the absence of a digital display. It was the publishing workflow. If faculty have to learn another dashboard or install another application, adoption becomes a bottleneck. WhatsApp already exists in their workflow, so CampusCast uses it as the publishing interface and removes that additional learning curve.”

This is directly aligned with your abstract's central argument: adoption through familiarity. 


Q3. “Why not just make a web application?”
Answer:

“A web application is actually included for administration, but I don't want it to be the primary faculty publishing interface. A web portal introduces login, navigation and training overhead. WhatsApp reduces those steps. The web admin portal is used for roster management, screen management, notice history and security auditing.”

Your architecture and implementation docs support this separation. 

 


Q4. “How do you know the person sending the message is authorized?”
Answer:

“We use the sender's WhatsApp phone number as the identity. The webhook extracts the sender's E.164 phone number and checks it against the registered users collection. Only active registered numbers are allowed to publish.”

Then add:

“Additionally, the incoming Meta webhook itself is HMAC verified using X-Hub-Signature-256.”

That's a two-layer answer:

Webhook authenticity + sender authorization.



Q5. “What happens if an unauthorized person sends a message?”
This one is beautiful because your architecture has a proper answer.

“The system doesn't send an error response. The attempt is recorded in the audit log and silently dropped.”

Then:

“The silent-drop behavior prevents unauthorized users from learning whether a particular phone number is registered in the system.”

Your development rules explicitly define this behavior. 


Q6. “Why Firebase?”
Answer:

“The workload is event-driven and relatively bursty. We don't need a continuously running backend server. Firebase Cloud Functions lets us execute backend logic when a WhatsApp event arrives, while Firestore provides real-time listeners for the display clients. This reduces infrastructure overhead and is appropriate for the scale of the pilot.”

Your project memory says the standalone Express/Railway backend was replaced with Firebase Cloud Functions specifically for cost and infrastructure simplicity. 


Q7. “Why Firestore instead of MySQL?”
Say:

“The core requirement is real-time state synchronization rather than complex relational querying. Firestore provides real-time listeners through onSnapshot, which fits the display use case very well. The display doesn't need to repeatedly poll the server; it listens for changes.”

Architecture confirms Firestore is the source of truth and displays use onSnapshot. 


If they ask about relational data, then discuss users/departments/screens/notices and why Firestore is sufficient at this scale.

Q8. “What happens if the Internet goes down?”
Very important.

“The display doesn't go blank. It retains the last-known-good rendered state and displays a reconnecting indicator. Once connectivity is restored, the Firestore listener reconnects and the display receives the latest state.”

That's one of your strongest engineering decisions.


 


Q9. “How do scheduled notices work?”
Answer:

“A scheduled notice is stored with a scheduled timestamp and status scheduled. A Cloud Scheduler-triggered Cloud Function runs every minute. When the scheduled time is reached, it promotes the notice from scheduled to active. The same function handles expiration of active notices.”

Your scheduler design explicitly works this way. 


Q10. “Why do you need a scheduler?”
“Because scheduling and expiry should be controlled centrally by the backend rather than by individual display clients. If each display managed its own timers, different screens could potentially disagree about notice state. Centralizing this logic keeps all displays consistent.”

Excellent technical answer.

Q11. “What is the role of #urgent?”
“#urgent is a parsing instruction. The backend converts the message into a notice with urgent priority, and the display renders it using the urgent visual treatment, including the red alert styling.”

Your rules explicitly define #urgent as a supported v1 parser tag. 


Q12. “What if the faculty member belongs to multiple departments?”
This is a good architecture question.

Answer:

“If a faculty member has access to multiple departments and doesn't specify the department, the parser doesn't guess. It asks for clarification. This prevents an important notice from accidentally being displayed on the wrong department's screen.”

Your rules explicitly require this behavior. 


Q13. “Can a faculty member directly modify Firestore?”
NO.

Say:

“No. Client-side writes are prohibited. The display and admin clients only read from Firestore. All writes go through Firebase Cloud Functions using the Admin SDK.”

This is one of your hard security rules. 


Q14. “What happens if someone tampers with the webhook?”
Answer:

“The webhook request contains an HMAC signature from Meta. We calculate and verify the signature against our Meta app secret before processing the payload. If the signature is invalid, the request is rejected with HTTP 403.”



Q15. “What exactly is stored in Firestore?”
Know these:

users
departments
screens
notices
audit_log
And particularly:

notices
departmentId
content
mediaUrl
mediaType
priority
status
createdBy
createdAt
scheduledAt
expiresAt
The architecture document defines these collections and fields. 


If they ask you this, don't panic. Just explain the major collections rather than every field.

Q16. “What is your hardware?”
This is one place where you need to be careful.

Your current documentation defines the display as:

LCD / Smart TV + fullscreen kiosk web client

and Phase 4 includes hardware kiosk deployment. 

 


If they ask:

“Are you using Raspberry Pi?”

Don't claim that you've deployed it unless you actually have.

Say:

“The display layer is a web-based kiosk client running on an LCD or smart TV. A Raspberry Pi or similar small computer can act as the reference kiosk controller, but the current project phase is focused on validating the software display client and pilot deployment.”

That's honest and technically defensible.

Q17. “What is your novelty compared with existing notice boards?”
Answer:

“Existing smart notice boards mainly improve the display and remote updating mechanism. WhatsApp-based academic systems mainly use WhatsApp for notifications or workflows such as attendance. CampusCast combines the two: WhatsApp becomes the authenticated publishing interface, while a cloud real-time backend routes the message to department-specific physical displays.”

Your literature survey supports exactly this research positioning. 


Q18. “Why not Telegram?”
Good question.

Don't say:

“Because everyone uses WhatsApp.”

That's too casual.

Say:

“The selection criterion was reducing adoption friction for faculty. WhatsApp was selected as the institutional publishing channel because it aligns with the existing communication workflow we are targeting. The architecture is conceptually extensible to another messaging provider, but WhatsApp is the v1 integration.”

Much safer.

Q19. “What happens if a faculty member sends a PDF?”
Answer:

“The WhatsApp webhook receives the media metadata, the backend retrieves and stores the media in Firebase Cloud Storage, and the notice stores the media URL and media type. The display client then renders the supported media inline.”

Supported by your PRD and architecture. 

 


Q20. “What are the limitations?”
Don't say “there are no limitations.”

Say:

“The current limitations are primarily deployment-related. Meta Business verification and production WhatsApp integration still need to be finalized for a real institutional rollout. Hardware deployment across departments is also part of the current pilot phase. Additionally, rate limiting and operational monitoring are planned as hardening work.”

Your PRD explicitly identifies Meta verification and hardware deployment as open questions, while Phase 5 includes rate limiting and monitoring. 

 


That's a very mature answer.

21. “What is future scope?”
Keep it short:

Future Scope
Institution-wide deployment

More messaging channels

Analytics on notice engagement

Centralized content moderation

Advanced display layouts

Health monitoring for display nodes

Multi-campus support

Automated notification escalation

But be careful about moderation.

Your current v1 explicitly says content moderation is out of scope. 


So say:

“Content moderation is a possible future extension, but it is intentionally outside the current v1 scope.”

22. One thing I would change in your current PPT tonight
Your slide 10 says:

“∞ Departments the model scales to — no redesign needed”

I'd change that.

It's a little too marketing-heavy for an academic review.

Use:

Multi-department architecture
Designed to add departments without changing the core publishing pipeline.

Because the actual phase plan currently has five departments:

ECE, CSE, MECH, CIVIL, EEE. 


Don't give the panel an easy opportunity to challenge “infinite scalability.”

23. Another thing: don't oversell “AI”
Your project does not need AI.

Your actual parser uses defined tags:

#urgent

#schedule

DEPT:



If somebody asks:

“Where is AI in this?”

Say:

“AI is not a requirement for the current v1. We intentionally use deterministic parsing because notice routing and priority are security-sensitive. A future version could use NLP for more flexible classification, but the current implementation favors predictable behavior.”

That's actually a strong engineering decision.

24. Your 60-second opening tomorrow
Don't start with:

“Good morning respected panel members, today I am going to present…”

That's generic.

Start with the problem:

“Imagine a faculty member needs to inform an entire department that today's lab has been cancelled. Today that information might be posted in a WhatsApp group, pinned on a notice board, or sent through another channel — and students can still miss it. CampusCast addresses this communication gap by turning WhatsApp itself into the publishing interface for a real-time department digital notice board.”

Then:

“The faculty member sends one message. CampusCast authenticates and processes it, routes it to the correct department, and pushes it to the corresponding LCD display in real time.”

Then move into your problem slide.

That's your hook.

25. The panel's likely attack sequence
I would expect something roughly like this:

Panel: What is the problem?

↓

You: Fragmented and delayed campus notice distribution.

↓

Panel: Why WhatsApp?

↓

You: Zero additional learning curve.

↓

Panel: How?

↓

You: WhatsApp Cloud API → Cloud Function → Firestore → display.

↓

Panel: Security?

↓

You: HMAC + registered phone authorization + zero client writes.

↓

Panel: What happens if unauthorized?

↓

You: Silent drop + audit log.

↓

Panel: What if Internet fails?

↓

You: Last-known-good state.

↓

Panel: Existing systems?

↓

You: Digital notice boards and WhatsApp institutional systems exist separately.

↓

Panel: Novelty?

↓

You: Combining authenticated WhatsApp publishing with department-scoped real-time digital signage.

↓

Panel: What's implemented?

↓

You: Phases 0–3 complete, Phase 4 pilot underway.

↓

Panel: What's remaining?

↓

You: Live WhatsApp sandbox testing, hardware deployment, rate limiting, monitoring.

That is a very defendable project story.

26. Your final PPT structure for tomorrow
I'd lock this:

1. Title
CampusCast
WhatsApp → Live Campus Signage

2. Problem Statement
Why existing channels fail.

3. Objectives
Five objectives.

4. Literature Survey
6 relevant papers.

5. Research Gap & Proposed Contribution
Existing systems vs CampusCast.

6. Proposed System
Your current “What if publishing...” slide.

7. System Workflow
WhatsApp → verification → parsing → Firestore → display.

8. Key Features
Urgent / scheduling / media / expiry / multi-department / offline.

9. Security
HMAC / phone identity / silent drop / zero client writes / audit.

10. Architecture
Your current architecture diagram.

11. Roles & Access Control
Super Admin / HOD / Faculty / Viewer.

12. Implementation Status
Phases 0–5.

13. Results / Current Validation
Implemented modules + target metrics. Clearly distinguish measured results from targets.

14. Conclusion + Future Scope
15. References
Most important thing tonight
Don't spend the night redesigning the entire PPT.

Your technical foundation is already strong. The biggest missing pieces are:

Objectives

Literature survey

Research gap

References

Clear distinction between implemented features and future/pilot work

Everything else in the current deck can largely stay.

And remember this one sentence tomorrow:

“Our contribution is not merely a digital notice board and not merely a WhatsApp integration; it is the combination of a familiar messaging interface with a secure, real-time, department-scoped physical signage network.”

That's the core defense of CampusCast.


 


If you want, we can now do a proper mock viva: I'll act like your review panel and hit you with questions one-by-one, including the annoying follow-up questions professors use when they think you're bluffing.


Today 3:09 AM

CampusCast Review 1 prep.pptx
Presentation
prepare me with respect to it

Absolutely. Now that you've uploaded the actual Review 1 PPT, I'll prepare you slide-by-slide according to exactly what is in this deck, not the older version. I’ve gone through all 15 slides, including the literature survey, research gap, implementation status, results, and references. 


Your deck now has a very clear academic story:

Problem → Objectives → Existing Research → Gap → Proposed Solution → Workflow → Features → Security → Architecture → Roles → Implementation → Validation → Future Scope → References

That is exactly the structure you want for a Major Project Review.

1. First: Your overall story
If you remember only one thing, remember this:

CampusCast solves the campus communication problem by using WhatsApp as the publishing interface and a secure real-time cloud backend to deliver department-specific notices to LCD displays.

Everything in your PPT should come back to that.

Your panel doesn't need to remember 15 slides.

They need to remember:

Existing problem: notices are fragmented and delayed.

Existing solutions: digital notice boards and WhatsApp systems exist separately.

Gap: no frictionless WhatsApp → department signage pipeline.

Your contribution: authenticated WhatsApp publishing + real-time department-scoped LCD signage.

Technical implementation: WhatsApp Cloud API → Firebase Cloud Function → Firestore → Next.js display.

Current status: Phases 0–3 implemented; Phase 4 pilot underway.

That's your project in 30 seconds.

2. Slide-by-slide preparation
SLIDE 1 — Title
What is on it
CAMPUSCAST
WhatsApp → Live Campus Signage

“The notice board that publishes itself the moment a faculty member hits send.”



What you say
“Good morning respected panel members. My project is CampusCast, a WhatsApp-driven real-time campus notice distribution system. The basic idea is simple: an authorized faculty member sends a notice through WhatsApp, and that notice is automatically authenticated, processed and displayed on the appropriate department's LCD screen.”

Then immediately move on.

Don't do this
Don't spend 1 minute explaining the name.

3. SLIDE 2 — Problem
This slide is important because it establishes why the project exists.

You have four problems:

Physical boards

Buried group chats

Delayed urgency

High-friction displays



Say:
“The problem is not simply that colleges don't have digital notice boards. The larger problem is the publishing and distribution workflow.”

“Physical boards require someone to manually print and post information. WhatsApp groups have high noise, so important notices can get buried. Urgent notices may reach students too late. And existing digital signage systems often require separate logins or technical assistance.”

“So we identified a missing layer between the communication tool faculty already use and the physical displays students actually see.”

That last sentence is important.

4. SLIDE 3 — Objectives
You have five objectives:

Simplify publishing

Real-time distribution

Secure communication

Intelligent notice handling

Reliable display



Say:
“Based on these problems, we defined five objectives.”

“First, publishing should happen through WhatsApp without requiring a new application or faculty login.”

“Second, notices should reach department displays in real time.”

“Third, publishing must be secure, so only authorized faculty can publish and incoming webhooks must be verified.”

“Fourth, the system should support priority, scheduling, department routing and media.”

“Finally, the display should remain usable even during connectivity failures.”

Likely question
“Why are these your objectives?”

Answer:

“Each objective directly corresponds to a failure point in the existing communication process. We're not adding features arbitrarily; the features are derived from the identified communication and reliability problems.”

Excellent academic answer.

5. SLIDE 4 — Literature Survey
This is where you need to sound like a researcher, not a developer.

Your slide says existing research broadly falls into two directions:

Direction 1
Digital / IoT / cloud notice boards.

Direction 2
WhatsApp-based institutional communication.



Your explanation
“Our literature survey showed two major directions.”

“The first focuses on smart notice boards and real-time digital signage. These systems improve remote distribution, scheduling and display capabilities, but publishing generally happens through a web portal or dedicated interface.”

“The second direction uses WhatsApp for institutional workflows such as attendance, notifications and reminders. These systems benefit from WhatsApp's familiarity, but they generally don't connect the messaging workflow to physical campus signage.”

“This separation is what led us to our research gap.”

If they ask:
“How many papers did you study?”

Your actual reference material says 25 referenced papers, while the PPT presents the 8 core sources supporting the literature survey and research gap. 

 


Say:

“We reviewed 25 references overall and selected the most directly relevant studies for the presentation.”

Good.

6. SLIDE 5 — Research Gap & Proposed Contribution
THIS IS YOUR MOST IMPORTANT ACADEMIC SLIDE.
Your slide says:

“The novelty isn't WhatsApp alone, or a notice board alone — it's combining authenticated WhatsApp publishing with real-time, department-scoped signage.”



Memorize this.

If asked “What is your research gap?”
Say:

“The literature shows that real-time digital notice boards and WhatsApp-based institutional communication have both been explored, but they are largely treated as separate systems. We identified the gap of connecting the familiar WhatsApp publishing workflow to a secure, real-time, department-specific physical signage network.”

If asked:
“What is your novelty?”

Say:

“Our novelty is the integration and workflow rather than an individual technology. We combine authenticated WhatsApp publishing, department-aware routing, real-time cloud synchronization and physical LCD signage into a single communication pipeline.”

If they challenge:
“But WhatsApp API already exists.”

Answer:

“Yes. We are not claiming that the WhatsApp API itself is novel. The contribution is its application as the authenticated publishing layer for a department-scoped real-time digital signage system.”

Never claim WhatsApp API as your innovation.

7. SLIDE 6 — Proposed System
This is your "wow" slide.

It demonstrates:

Faculty WhatsApp

↓

CampusCast

↓

ECE Display



Say:
“This is the proposed interaction from the user's perspective.”

“The faculty member simply sends a normal WhatsApp message such as ‘ECE: Microprocessor Lab cancelled today.’”

“The system processes it and confirms that it has been posted.”

“The corresponding ECE display then receives the notice automatically.”

“The important point is that the faculty member doesn't need to open a dashboard, upload a document or manually refresh the display.”

VERY IMPORTANT
Your slide says:

“That message is live — campus-wide, in under 5 seconds.”

But slide 13 correctly says:

Target p95 latency <5s — pending formal benchmarking.



If the panel catches this inconsistency:

Say:
“The under-five-second figure represents our target latency rather than a formally benchmarked result. Slide 13 explicitly separates the target metric from the currently implemented functionality. Formal p95 benchmarking is pending.”

That's your safest answer.

8. SLIDE 7 — How It Works
This is where they'll probably start technical questioning.

Your four stages:

01
Faculty sends

02
Verified & parsed

03
Stored live

04
Pushed to screens



Your explanation
“First, the faculty member sends a text, image or PDF through WhatsApp.”

“Meta's WhatsApp Cloud API delivers the message to our webhook.”

“The Firebase Cloud Function verifies the webhook signature and checks the sender against our authorized faculty roster. It then parses department, priority and scheduling information.”

“The resulting notice is written to Firestore, which acts as the source of truth.”

“The display clients listen to Firestore in real time, so once the notice changes state, the appropriate department display updates automatically.”

9. Learn this technical pipeline by heart
If they say:

“Explain your complete architecture in one flow.”

Say:

“WhatsApp → Meta Cloud API → Firebase Cloud Function → authentication and parsing → Firestore → real-time listener → Next.js display → LCD.”

Then explain each component.

That should be automatic in your head.

10. SLIDE 8 — Features
You have six:

Urgent tagging

Scheduled notices

Media attachments

Auto-expiry

Multi-department

Never goes blank



Don't explain every feature unless asked.

Say:

“These features are focused on reducing manual administration after publishing. Urgent notices receive special visual treatment, scheduled notices are automatically activated, media can be displayed inline, old notices expire automatically, one deployment can serve multiple departments, and the display retains its last-known state during connectivity problems.”

11. Know the parser
They may ask:

“How do you identify an urgent notice?”

Answer:

“We support the #urgent tag. The parser converts it into an urgent priority, and the display applies the corresponding visual treatment.”

Your project rules define #urgent, #schedule and DEPT: as the supported v1 parsing mechanisms. 


Example:
#urgent ECE: Project Review shifted to 2 PM
becomes approximately:

department = ECE
priority = urgent
content = Project Review shifted to 2 PM
12. SLIDE 9 — Security
This is another very strong slide.

You have:

Phone-verified identity

Signed webhooks

Silent drop

Zero client writes

Immutable audit log



Say:
“Security is important because a notice board that anyone can publish to is worse than having no board.”

“We therefore use multiple layers.”

“First, the sender's WhatsApp phone number must exist in the authorized roster.”

“Second, every incoming Meta webhook is HMAC verified using the app secret.”

“Third, unauthorized senders are silently dropped and the attempt is logged.”

“Fourth, clients don't have direct write access to Firestore. All writes are performed by backend Cloud Functions.”

“Finally, publication and security events are maintained in the audit log.”

That sounds very strong.

13. Panel trap: “Why both HMAC and phone authentication?”
This is a likely question.

Answer:
“They solve different problems.”

“HMAC verification establishes that the webhook request came from the trusted Meta integration and wasn't modified by an external party.”

“Phone authorization determines whether the actual WhatsApp sender is an authorized faculty member.”

“So one protects the integration boundary, while the other protects publishing authorization.”

Memorize this.

14. Panel trap: “Why silent drop?”
Answer:

“If we tell an unauthorized sender that their number isn't registered, we potentially reveal information about our authorization system. Silent dropping reduces that information leakage while still allowing us to record the attempt internally.”

Your rules explicitly define silent dropping for this reason. 


15. SLIDE 10 — Architecture
Your diagram:

WhatsApp

↓

Cloud API

↓

Cloud Function

↓

Firestore

↓

Display + Admin Clients

with a scheduled function running every minute. 


Explain it like this:
“The architecture is serverless.”

“WhatsApp Cloud API is our external ingestion layer.”

“Firebase Cloud Functions handle backend processing.”

“Firestore acts as the real-time source of truth.”

“Cloud Storage handles media attachments.”

“Next.js provides the display and administration clients.”

“A scheduled Cloud Function runs every minute to promote scheduled notices and expire old notices.”

16. Why serverless?
Panel:

“Why didn't you use Node.js with Express?”

Answer:

“The workload is event-driven and relatively bursty. We don't need a continuously running application server when there may be long periods with no publishing activity. Cloud Functions lets the backend execute in response to events, which reduces infrastructure overhead and is appropriate for our pilot.”

Your project memory records this architectural decision explicitly. 


17. Why Firestore?
Panel:

“Why Firestore?”

Answer:

“Our primary requirement is real-time state synchronization between the backend and multiple display clients. Firestore provides real-time listeners, so displays can subscribe to notice changes instead of continuously polling the backend.”

18. Why onSnapshot?
If they're technically strong:

“Because onSnapshot provides a real-time listener. When the relevant Firestore data changes, the display receives the updated state automatically. This eliminates manual refresh and reduces the need for polling.”

Your architecture specifically uses Firestore onSnapshot. 


19. SLIDE 11 — Roles
You have:

Super Admin
Everything.

HOD
Faculty capabilities + approval/override.

Faculty
Publish notices.

Student / Viewer
Only views the display.



Say:
“We use role-based responsibility rather than giving every user the same administrative capabilities. Super Admin manages the overall system, HOD handles department-level authority, faculty members publish notices, and students are passive viewers without requiring an account.”

20. Panel question: “Why don't students need login?”
Answer:

“The display is a public information surface. Requiring every student to authenticate would add unnecessary friction. Authentication is required at the publishing side because publishing is privileged; viewing is intentionally open.”

That's a good distinction:

Publishing = privileged

Viewing = public

21. SLIDE 12 — Implementation Status
This is where you need to be 100% honest.

Your slide says:

Completed:
Phase 0
Phase 1
Phase 2
Phase 3

In progress:
Phase 4

Remaining:
Phase 5



Say:
“The project is not being presented as completely production-deployed. Phases 0 through 3 are implemented end to end. Phase 4, which covers the multi-department pilot and hardware kiosk rollout, is currently in progress. Phase 5 covers hardening activities such as rate limiting, operational runbooks and monitoring.”

This makes you look more credible, not less.

22. SLIDE 13 — Results & Current Validation
This slide is extremely important.

You distinguish:

Implemented
WhatsApp webhook

HMAC verification

Phone authorization

Firestore

Display

Admin

Roster

Telemetry

Audit

Urgent

Scheduling

Media

Target Metrics
<5s p95 latency — pending benchmarking

0 new apps/passwords

5 departments in pilot



Say:
“At the current stage, our validation distinguishes implemented functionality from formal performance metrics.”

“The core publishing pipeline and associated modules have been implemented.”

“Our target publish-to-display latency is below five seconds at p95, but formal benchmarking is still pending.”

“The current pilot architecture covers five departments: ECE, CSE, MECH, CIVIL and EEE.”

23. If they ask “What are your results?”
Don't say:

“95% accuracy.”

There is no such metric in this project.

Instead:

“Our current result is a functional end-to-end publishing pipeline with authentication, routing, real-time display, scheduling, media handling and administrative controls. Quantitative latency benchmarking is the next validation activity.”

That is the correct answer based on your current deck.

24. SLIDE 14 — Conclusion
Your conclusion is:

“A real-time, department-scoped notice system doesn't need a new app or hardware overhaul.”



Say:
“The main conclusion from our work is that the major adoption barrier isn't necessarily the display hardware; it is the publishing workflow. By using WhatsApp as the publishing interface and combining it with verified identity and a serverless real-time backend, we can reduce that friction while maintaining centralized control.”

“The core system through Phase 3 is implemented, and the multi-department pilot is currently underway.”

25. SLIDE 15 — References
If they ask:

“How many papers did you refer to?”

Answer:

“We reviewed 25 references overall, and the eight most relevant sources are included on this slide for the review presentation.”

Your reference document contains 25 sources. 


Don't read all eight aloud.

Just say:

“These are the core references that informed our literature survey and research gap.”

26. NOW — THE QUESTIONS YOU MUST KNOW
I'm going to divide these into must know, technical, and danger questions.

A. MUST KNOW
1. What is CampusCast?
“A WhatsApp-driven real-time digital notice distribution system for department LCD displays.”

2. What problem are you solving?
“Fragmented, delayed and high-friction campus notice distribution.”

3. Why WhatsApp?
“To eliminate the learning and adoption barrier of a new publishing application.”

4. What is your novelty?
“Authenticated WhatsApp publishing combined with real-time department-scoped digital signage.”

5. What is your architecture?
“WhatsApp Cloud API → Firebase Cloud Functions → Firestore → Next.js display clients → LCD.”

6. What is your database?
“Cloud Firestore.”

7. What is your frontend?
“Next.js.”

8. What is your backend?
“Firebase Cloud Functions using Node.js/TypeScript.”

9. How is it secured?
“HMAC webhook verification, registered phone authorization, silent dropping, zero client-side writes and audit logging.”

10. What is implemented?
“Phases 0–3 are implemented; Phase 4 pilot is in progress.”

27. TECHNICAL QUESTIONS
“What is a webhook?”
“A webhook is an HTTP callback through which Meta sends an event to our backend when a WhatsApp message is received.”

“What is HMAC?”
“HMAC is a message authentication mechanism that uses a secret key and cryptographic hash to verify that the received webhook was generated by the trusted source and hasn't been tampered with.”

“What is X-Hub-Signature-256?”
“It's the SHA-256 based signature provided with Meta webhook requests, which we verify against our application secret before processing the request.”

“What is Firestore?”
“A cloud NoSQL document database from Firebase that provides real-time synchronization capabilities.”

“What is Cloud Function?”
“A serverless backend function that executes in response to events or HTTP requests without requiring us to maintain a continuously running server.”

“What is Cloud Storage?”
“It stores media attachments such as images and PDFs separately from the Firestore notice metadata.”

“Why don't you store PDFs directly in Firestore?”
“Firestore is being used for structured notice metadata and real-time state. Media files are better handled by object storage, so we use Cloud Storage and store the resulting media reference with the notice.”

28. SCHEDULING QUESTION
“How does scheduling work?”
“The faculty member can use the supported #schedule format. The backend validates and stores the scheduled timestamp. A scheduled Cloud Function runs every minute and promotes scheduled notices to active when their scheduled time is reached.”



“Why every minute?”
“It provides a simple predictable scheduling mechanism appropriate for campus notices without introducing unnecessary infrastructure complexity.”

29. OFFLINE QUESTION
“What happens if Wi-Fi goes down?”
“The display retains the last-known-good rendered state and shows a reconnecting indicator. It doesn't replace the content with a full-screen error.”



“Does it still receive new notices without Internet?”
“No. New notices require connectivity to receive the backend update. The resilience mechanism is designed to prevent the display from going blank while disconnected.”

That's an important distinction.

Don't claim offline publishing.

30. SECURITY ATTACK QUESTIONS
“Can someone directly write to Firestore?”
“No. Client-side writes are denied. All writes are performed through backend Cloud Functions using the Firebase Admin SDK.”



“Can someone fake a WhatsApp webhook?”
“A forged request without the correct HMAC signature should fail verification and be rejected.”

“Can someone use an unauthorized WhatsApp number?”
“The sender's phone number is checked against the authorized roster. Unauthorized attempts are logged and silently dropped.”

“Can students publish?”
“No. Students are viewers only.”

31. THE PANEL MAY ATTACK YOUR “NO LOGIN” CLAIM
They may say:

“You say there is no login. Isn't that insecure?”

Your answer:

“There is no separate faculty login. The WhatsApp phone identity itself acts as the publishing credential, and authorization is determined by the institutional roster. This is intentional because the objective is to remove a separate authentication workflow for faculty.”

Then:

“The admin portal is still authenticated separately because administrative operations are privileged.”

Very important distinction.

32. THE PANEL MAY ASK: “WHAT IF SOMEONE STEALS A FACULTY MEMBER'S PHONE?”
Don't overclaim.

Answer:

“Phone-based identity assumes the security of the registered WhatsApp account and device. The system protects the backend integration and authorization layer, but device/account compromise remains an operational security risk. A production deployment could add administrative suspension, number revocation and additional institutional controls.”

This is much better than pretending phone authentication solves everything.

33. “Why not use SMS?”
Your literature survey actually discusses GSM/SMS notice boards and their limitations. 


Answer:

“SMS-based notice boards are limited in message format and multimedia capability, and they introduce additional cellular hardware and messaging costs. WhatsApp allows us to support text, images and PDFs while using an existing communication interface.”

34. “Why not Bluetooth?”
Answer:

“Bluetooth-based smart notice boards have short-range communication limitations and generally require a device to be physically nearby. CampusCast uses cloud connectivity so authorized faculty can publish remotely and multiple department displays can receive the same infrastructure.”

35. “Why not just use a WhatsApp group?”
This is actually a great question.

Answer:

“A WhatsApp group solves communication but not visibility. Students can mute it, miss messages or have important notices buried under unrelated conversation. CampusCast separates publishing from viewing: WhatsApp is used for faculty input, while the physical display provides persistent, department-specific visibility.”

Very strong answer.

36. “Why not just put WhatsApp Web on the LCD?”
Answer:

“That would expose the communication interface itself rather than creating a controlled signage system. CampusCast provides department-specific filtering, notice formatting, priority handling, scheduling, expiry, offline resilience and centralized security controls.”

Excellent.

37. “What if faculty sends the wrong department?”
Your system supports department routing.

Say:

“The department is resolved from the supported department prefix or the sender's assigned department. For faculty members who can publish to multiple departments, ambiguity is not guessed; the system asks for clarification.”



38. “Can one faculty member publish to multiple departments?”
Yes, if authorized.

“A faculty account can have multiple department scopes. If the target department isn't specified when multiple departments are available, the system requests clarification rather than broadcasting unintentionally.”

39. “Why does your display need a heartbeat?”
Your architecture includes:

screenHeartbeat



Answer:

“The heartbeat allows the admin portal to know whether a registered display is recently active. This becomes useful for operational monitoring when multiple physical screens are deployed.”

40. “What is the biggest limitation of your project?”
This is where you should be honest:

“The biggest current limitation is that the project is at the pilot stage rather than institution-wide production deployment. Meta Business integration and live WhatsApp testing, hardware kiosk deployment and operational hardening are still part of the remaining work.”

Your PRD specifically identifies Meta Business verification and display hardware as open deployment questions. 


41. If they ask “Is this production-ready?”
Say:

“The core software pipeline is implemented, but I would not describe the current state as full production deployment. Phase 4 pilot validation and Phase 5 hardening are still required.”

This answer is much better than pretending it's production-ready.

42. If they ask “Where is the research?”
This could happen because the project looks very product-oriented.

Answer:

“The research component is in identifying the gap between two existing research directions: digital notice boards and WhatsApp-based institutional communication. We studied existing systems, identified the separation between those workflows, and designed an architecture that combines them with security, department routing and real-time signage.”

Then point to:

Slide 4 → Literature Survey

and

Slide 5 → Research Gap.

43. If they say “This is just CRUD”
Do NOT get defensive.

Say:

“CRUD is present in the administrative layer, but the core system isn't simply CRUD. The main pipeline is event-driven: a signed external webhook triggers backend authentication and parsing, the resulting state is propagated through Firestore's real-time mechanism, and the display reacts automatically. Scheduling, webhook security, routing and offline resilience are also part of the system.”

That's a killer answer.

44. If they say “This is just an API integration”
Answer:

“The WhatsApp API is one component. The project addresses the complete workflow around it: identity, webhook verification, parsing, department routing, persistent state, scheduling, media handling, real-time display synchronization, administrative control and auditability.”

45. If they ask “Where is IoT?”
This one is important because you're ECE.

Don't say “WhatsApp is IoT.”

Say:

“The current system is primarily a software-driven smart signage system. The physical LCD display nodes form the edge/display layer, and Phase 4 includes hardware kiosk deployment. We deliberately avoided unnecessary custom electronics because the objective is communication reliability rather than building another proprietary display controller.”

That is defensible.

If they specifically require an IoT framing:

“The display node can be treated as a connected edge device: it maintains a network connection, receives cloud state and renders the corresponding physical information surface.”

46. What NOT to say tomorrow
Avoid these:

Don't say:
“It's 100% secure.”

Say:

“We've implemented multiple security controls.”

Don't say:
“It works under 5 seconds.”

Say:

“<5 seconds is our target p95 metric; formal benchmarking is pending.”

Don't say:
“It's infinitely scalable.”

Say:

“The serverless architecture is designed to support multi-department expansion.”

Don't say:
“There are no limitations.”

Say:

“The current limitations are primarily pilot deployment and production hardening.”

Don't say:
“AI reads the WhatsApp message.”

You don't currently have an AI system.

Don't say:
“Raspberry Pi is already deployed.”

Unless you've actually deployed it.

47. Your 2-minute presentation version
If they tell you:

“Explain your project briefly.”

Give this:

“CampusCast is a WhatsApp-driven real-time campus notice distribution system designed to address fragmented and delayed communication in college departments.

Existing communication channels have different problems. Physical notice boards require manual posting, WhatsApp groups can bury important messages, urgent updates may arrive late, and digital signage systems often require separate publishing workflows.

Our objective is to make publishing as simple as sending a WhatsApp message. An authorized faculty member sends a text, image or PDF to the institutional WhatsApp number. Meta's WhatsApp Cloud API forwards the message to our Firebase Cloud Function. The function verifies the webhook signature, authenticates the sender using the registered phone number, parses department and priority information, and stores the notice in Firestore.

Firestore acts as the real-time source of truth. Department-specific Next.js display clients listen for changes and automatically update the corresponding LCD screens. The system also supports urgent notices, scheduling, media attachments, automatic expiry, multi-department routing and offline display resilience.

From our literature survey, we found that digital notice boards and WhatsApp-based institutional systems are generally treated as separate research directions. Our contribution is combining authenticated WhatsApp publishing with real-time, department-scoped digital signage.

Currently, Phases 0 through 3 are implemented end to end, while the multi-department pilot and hardware kiosk rollout are in progress. Formal latency benchmarking and production hardening remain future validation activities.”

That's your core speech.

48. Your emergency cheat sheet
If you completely blank tomorrow, remember this:

PROBLEM
Fragmented + delayed campus notices

WHY
Physical boards / noisy WhatsApp groups /
late urgent updates / high-friction signage

SOLUTION
WhatsApp → Live LCD

INPUT
Text / Image / PDF

SECURITY
HMAC + Phone Authorization

BACKEND
Firebase Cloud Functions

DATABASE
Firestore

MEDIA
Cloud Storage

DISPLAY
Next.js

REAL-TIME
Firestore onSnapshot

SCHEDULING
Cloud Scheduler + scheduledNoticeManager

ROUTING
Department-aware

RESILIENCE
Last-known-good state

ROLES
Super Admin / HOD / Faculty / Viewer

NOVELTY
WhatsApp publishing + real-time department signage

STATUS
Phase 0–3 complete
Phase 4 in progress
Phase 5 hardening

TARGET
<5 sec p95
BUT benchmarking pending
49. Your three strongest arguments
If the panel gets aggressive, come back to these.

Argument 1 — Adoption
“We aren't asking faculty to learn another system.”

Argument 2 — Architecture
“The entire publishing path is automated from webhook ingestion to real-time display.”

Argument 3 — Research gap
“Existing work largely explores WhatsApp-based institutional communication and digital notice boards separately; CampusCast combines them into one department-scoped workflow.”

These three arguments hold your entire project together.

50. One final warning about tomorrow
Your PPT is very polished and product-like. That's a strength, but it creates one danger.

The panel may look at it and think:

“This guy has a beautiful product pitch. Let's see whether he actually understands the engineering.”

So don't memorize the PPT sentences.

Memorize the system:

Faculty

→ WhatsApp

→ Meta webhook

→ HMAC verification

→ Phone authorization

→ Parser

→ Department routing

→ Firestore

→ onSnapshot

→ Next.js

→ LCD

And understand why each component exists.

If you can explain that pipeline, your security model, your research gap, and your current implementation status confidently, you're in a very good position for this review. 

 


Your review prep priority tonight
1. Memorize the 2-minute explanation.
2. Memorize Slides 4–5 (literature + gap).
3. Understand the architecture deeply.
4. Know HMAC vs phone authorization.
5. Know exactly what is implemented vs pending.
6. Practice the 10 “must know” questions aloud.

The goal tomorrow isn't to sound like you memorized a PPT.

The goal is to make the panel feel that you designed and understand the system.



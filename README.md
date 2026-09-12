# Pulse: Coordination Intelligence

BUILD / MIGRATE MY EXISTING APP — PULSE

==================================================

You are working on an existing application concept called "Pulse".

IMPORTANT:

This is NOT a request to create a completely different app.

I want the same Pulse product rebuilt in a clean, production-ready way while preserving its existing concept, UI structure, workflow, and functionality.

Do NOT redesign the product unnecessarily.

Do NOT add random features.

Do NOT change the core classification logic.

Do NOT simplify the app into a basic demo.

The existing Pulse app is the SOURCE OF TRUTH for the product requirements described below.

==================================================

1. PRODUCT NAME

==================================================

App name: Pulse

Pulse is an AI-powered coordination intelligence tool.

Its purpose is to analyze conversations, meeting notes, Slack-style messages, or pasted chat threads and identify:

1. GONE DARK

2. IN MOTION

3. CONFIRMED

==================================================

2. CORE CLASSIFICATION SYSTEM

==================================================

The dashboard MUST ALWAYS show these three categories in this order:

1. GONE DARK

2. IN MOTION

3. CONFIRMED

GONE DARK:

Items that are unresolved, unanswered, abandoned, blocked, forgotten, or have no clear owner/follow-up.

Examples:

- A question was asked but nobody answered it.

- A problem was mentioned but nobody took ownership.

- A promised follow-up never happened.

- An issue is waiting for someone/team and has no clear progress.

IN MOTION:

Actionable tasks that have a clear owner and are actively moving forward.

Examples:

- "Aman will check the logs tomorrow."

- "Neha will prepare the migration plan."

- "Rahul will contact the payment team."

The person responsible must be identified whenever possible.

CONFIRMED:

Clearly agreed decisions, facts, commitments, or conclusions.

Examples:

- "We will migrate to Stripe next month."

- "The release will happen after testing."

- "The meeting is scheduled for Friday."

IMPORTANT:

Do not mix these categories.

Do not randomly classify normal statements as tasks.

Use the context of the entire conversation to determine the correct category.

==================================================

3. MAIN USER FLOW

==================================================

The user should be able to:

1. Open Pulse.

2. See the main dashboard/interface.

3. Paste a conversation, meeting transcript, chat thread, or notes.

4. Click the Analysis button.

5. The AI analyzes the complete input.

6. Results appear in the three categories:

   - Gone dark

   - In motion

   - Confirmed

7. Each result should clearly explain what was detected.

8. When an owner/person is identifiable, display the person's name.

==================================================

3A. NEW CONVERSATION / CLEAR CONVERSATION

==================================================

The conversation input must support starting a completely new analysis.

Add a clearly visible "New Conversation" button near the conversation input area.

The user should NOT have to manually select all previous text and delete it.

When the user clicks "New Conversation":

1. Clear all text from the conversation input.

2. Clear the previous AI analysis results.

3. Reset the Gone Dark count.

4. Reset the In Motion count.

5. Reset the Confirmed count.

6. Remove all previous result cards from the dashboard.

7. Reset loading state.

8. Reset error state.

9. Allow the user to immediately paste a new conversation.

10. Do NOT reload the entire page.

11. Do NOT delete anything permanently from the database.

12. Only clear the current conversation and its current analysis state.

If a previous analysis result exists, show a small confirmation dialog:

"Start a new conversation?"

"This will clear the current conversation and analysis results."

Buttons:

- Cancel

- Start New

If the user clicks "Cancel":

- Keep the existing conversation and results unchanged.

If the user clicks "Start New":

- Clear the conversation input.

- Clear all analysis results.

- Reset all category counts.

- Return the dashboard to its initial empty state.

- Allow a new conversation to be pasted immediately.

The input should return to its original empty state and placeholder.

Example workflow:

Conversation A

      ↓

Analysis

      ↓

Results

      ↓

New Conversation

      ↓

Current input is cleared

      ↓

Previous results disappear

      ↓

User pastes Conversation B

      ↓

Analysis

      ↓

New results appear

IMPORTANT:

Do NOT make the user manually select and delete the previous conversation text.

==================================================

4. INPUT EXAMPLE

==================================================

The application should support input similar to:

Aman: I think we should migrate the payment service to Stripe next month.

Neha: That sounds good. Let's do it after the current release is stable.

Aman: I'll handle the Stripe integration and create the migration plan.

Rahul: What about the existing payment failure issue?

Neha: Good question. I haven't heard back from the payments team yet.

Aman: I'll also check the logs and share what I find tomorrow.

Rahul: Okay, let's keep the migration decision for next month.

Expected type of result:

GONE DARK:

Rahul — Resolution of the existing payment failure issue.

IN MOTION:

Aman — Handle Stripe integration and create the migration plan.

Aman — Investigate the existing payment failure issue by checking logs.

CONFIRMED:

Migrate the payment service to Stripe next month after the current release is stable.

==================================================

5. UI / DESIGN

==================================================

Keep the existing Pulse visual identity.

The application should feel like a premium modern SaaS product.

Use:

- Dark interface

- Clean professional layout

- Modern typography

- Cards

- Clear hierarchy

- Good spacing

- Subtle borders

- Professional dashboard appearance

- Responsive design

IMPORTANT:

Do NOT completely redesign the UI.

Do NOT turn it into a generic AI chatbot.

Pulse should look like a coordination intelligence / productivity intelligence dashboard.

The main experience should focus on:

Conversation Input

        ↓

AI Analysis

        ↓

Three-category Intelligence Dashboard

The "New Conversation" button should be visually consistent with the existing Pulse design and should not dominate the interface.

==================================================

6. DASHBOARD

==================================================

The dashboard must clearly display:

GONE DARK

--------------------------------

Unresolved / abandoned / unanswered items

IN MOTION

--------------------------------

Active tasks with clear ownership

CONFIRMED

--------------------------------

Confirmed decisions and facts

Each category should use cards or a similarly clear visual component.

Cards should contain useful information such as:

- Person/owner

- Task or issue

- Status

- Relevant context

- Confidence if available

Do not overload the dashboard with unnecessary information.

==================================================

7. AI ANALYSIS

==================================================

The AI must analyze the ENTIRE conversation rather than only individual messages.

The analysis should understand:

- Context

- Speaker names

- Questions

- Answers

- Commitments

- Ownership

- Unresolved issues

- Decisions

- Follow-ups

- Missing responses

- Time-related commitments

The AI should return STRUCTURED JSON.

Use a reliable schema similar to:

{

  "goneDark": [

    {

      "person": "Rahul",

      "item": "Resolution of the existing payment failure issue.",

      "reason": "No clear resolution or owner has been established."

    }

  ],

  "inMotion": [

    {

      "person": "Aman",

      "item": "Handle Stripe integration and create the migration plan."

    }

  ],

  "confirmed": [

    {

      "item": "Migrate the payment service to Stripe next month after the current release is stable."

    }

  ]

}

The exact implementation may be improved if necessary, but the frontend and backend must agree on ONE stable JSON schema.

==================================================

8. BACKEND

==================================================

Create/use a proper backend API.

Required endpoints:

POST /api/analyze

GET /api/status

POST /api/analyze:

- Accept conversation text.

- Validate input.

- Send it to the configured AI provider.

- Parse the AI response.

- Return valid JSON.

- Never return HTML when the frontend expects JSON.

- Handle malformed AI responses safely.

- Handle provider/API failures gracefully.

GET /api/status:

Return a simple JSON response showing that the API is running.

Example:

{

  "status": "ok"

}

==================================================

9. ERROR HANDLING

==================================================

This is VERY IMPORTANT.

The previous deployment had problems where the frontend expected JSON but received text/HTML.

DO NOT REPEAT THAT.

Every API endpoint must return predictable JSON.

Success:

{

  "success": true,

  "data": {...}

}

Error:

{

  "success": false,

  "error": "Human readable error message"

}

Never expose:

- [object Object]

- raw HTML

- Next/Vite/Vercel error pages

- unhandled stack traces

- undefined values

The frontend must safely handle both successful and failed API responses.

If the user clicks Analysis without entering a conversation, show a clear message such as:

"Please enter a conversation to analyze."

==================================================

10. FRONTEND ERROR HANDLING

==================================================

The frontend must NEVER blindly do:

JSON.parse(data.review)

or assume that every response contains a particular property.

Instead:

1. Check HTTP response status.

2. Parse JSON safely.

3. Validate the expected structure.

4. Display a useful error message if something is wrong.

For example:

"Analysis failed. Please check the AI configuration and try again."

Do not display:

"[object Object]"

Do not display raw server errors to the user.

==================================================

11. AI PROVIDER

==================================================

Make the AI provider configurable through environment variables.

Do NOT hardcode API keys.

Use environment variables such as:

GEMINI_API_KEY

or the appropriate provider variable required by the selected AI SDK.

The architecture should make it easy to change the AI provider later.

If Gemini is used, implement it properly for production.

If the provider fails, return a clean JSON error.

Do not fake AI results unless explicitly required for local development.

==================================================

12. SECURITY

==================================================

Never expose API keys in frontend/client-side code.

All AI API calls must happen server-side.

Use environment variables.

Do not commit .env files containing secrets.

Provide a safe .env.example file.

Example:

GEMINI_API_KEY=your_api_key_here

==================================================

13. DEPLOYMENT REQUIREMENTS

==================================================

The application MUST be production/deployment ready.

Avoid architecture that works only on localhost.

Do not hardcode:

localhost

127.0.0.1

for production API calls.

Frontend API requests should work correctly after deployment.

Make sure:

/api/analyze

and

/api/status

work in production.

The frontend and backend routing must be compatible with the selected deployment platform.

==================================================

14. IMPORTANT DEPLOYMENT RULE

==================================================

Before considering the project complete, test the complete production flow:

OPEN APP

↓

PASTE CONVERSATION

↓

CLICK ANALYSIS

↓

FRONTEND CALLS /api/analyze

↓

BACKEND RECEIVES REQUEST

↓

AI PROVIDER PROCESSES REQUEST

↓

BACKEND RETURNS VALID JSON

↓

FRONTEND PARSES JSON

↓

RESULTS DISPLAY IN:

GONE DARK

IN MOTION

CONFIRMED

Also test:

ANALYSIS RESULTS

↓

CLICK NEW CONVERSATION

↓

OLD INPUT CLEARS

↓

OLD RESULTS CLEAR

↓

NEW CONVERSATION CAN BE ENTERED

↓

ANALYSIS WORKS AGAIN

Do not stop at "the page loads".

The actual AI Analysis flow must work.

==================================================

15. RESPONSIVE DESIGN

==================================================

The app must work on:

- Desktop

- Laptop

- Tablet

- Mobile

Do not destroy the desktop layout while making it responsive.

==================================================

16. CODE QUALITY

==================================================

Use clean, maintainable code.

Separate:

- UI components

- API logic

- AI analysis logic

- Types/interfaces

- Utility functions

- Error handling

Avoid unnecessary duplication.

Avoid unnecessary dependencies.

Do not introduce complicated architecture when a simple architecture is sufficient.

==================================================

17. PRESERVE THE PRODUCT

==================================================

VERY IMPORTANT:

Do NOT:

- Change the Pulse concept

- Remove the three categories

- Rename Gone dark

- Rename In motion

- Rename Confirmed

- Turn Pulse into a chatbot

- Replace the dashboard with a completely different design

- Remove AI analysis

- Remove owner/person identification

- Remove conversation input

- Remove New Conversation / Clear Conversation functionality

- Add random features

- Add authentication unless it is actually required

- Add payments unless required

- Add unnecessary database infrastructure

- Rewrite the product into a different architecture just for the sake of rewriting

Only make architectural changes when they are required for:

- reliability

- security

- production deployment

- API functionality

- maintainability

==================================================

18. IF EXISTING CODE IS IMPORTED

==================================================

If I connect/import my existing GitHub repository:

FIRST inspect the existing project.

Do NOT immediately rebuild it.

Identify:

- current frontend framework

- current backend

- existing components

- existing routes

- existing API endpoints

- existing AI logic

- existing environment variables

- existing deployment configuration

Then preserve as much of the existing structure as reasonably possible.

Only modify files that actually need modification.

Do not rename files or move folders unnecessarily.

Do not replace working components without a technical reason.

==================================================

19. IF YOU NEED TO MODIFY THE ARCHITECTURE

==================================================

If the current architecture is incompatible with the deployment platform:

Make the SMALLEST possible architectural change.

Before changing the architecture, ensure that:

- UI remains visually consistent

- functionality remains the same

- API behavior remains the same

- classification logic remains the same

- user workflow remains the same

==================================================

20. FINAL QUALITY CHECK

==================================================

Before declaring the project complete, verify all of the following:

[ ] Pulse loads correctly

[ ] Main UI works

[ ] Conversation input works

[ ] Analysis button works

[ ] New Conversation button works

[ ] Previous conversation can be cleared without page reload

[ ] Previous analysis results are cleared

[ ] Category counts reset correctly

[ ] New conversation can be analyzed after clearing

[ ] POST /api/analyze works

[ ] GET /api/status works

[ ] AI provider works

[ ] Environment variables are correctly used

[ ] No API keys are exposed

[ ] AI returns structured JSON

[ ] Frontend safely parses responses

[ ] No "[object Object]"

[ ] No HTML returned from API

[ ] Errors are shown clearly

[ ] Gone dark works

[ ] In motion works

[ ] Confirmed works

[ ] Person/owner names appear when identifiable

[ ] Dashboard order is correct

[ ] Responsive UI works

[ ] Production deployment works

[ ] Production AI analysis works

==================================================

21. MOST IMPORTANT INSTRUCTION

==================================================

DO NOT JUST CREATE A MOCKUP.

I need a FUNCTIONAL FULL-STACK APPLICATION.

The final result must actually perform:

Conversation

→

AI Analysis

→

Structured JSON

→

Dashboard Results

AND:

New Conversation

→

Clear Current Input

→

Clear Current Results

→

Allow New Conversation

→

Run Analysis Again

The existing Pulse concept and product behavior are more important than introducing new technology.

Build the smallest reliable architecture required to make Pulse work consistently in production.

Do not stop after the frontend is generated.

Test the complete end-to-end Analysis workflow before considering the implementation finished.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://coordination-pulse.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3501ea7f-752d-4cc4-9e81-9c9697053264).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

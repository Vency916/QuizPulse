# PLAYFUL LIVE QUIZ PLATFORM — FULL DEVELOPMENT PROMPT

## 1. PROJECT OVERVIEW

Build a modern, playful, interactive web-based quiz platform inspired by the general gameplay experience of Wayground/Quizizz-style platforms, but with completely original UI, branding, layouts, illustrations, components, and implementation.

This is a dedicated quiz website, NOT a corporate/company website.

The platform allows a Super Admin to create quizzes and questions, launch live quiz sessions, share a unique quiz/session link with participants, organize participants into groups, and display a real-time leaderboard.

Participants do NOT create accounts.

A participant simply opens the quiz/session link provided by the host, enters a username, joins the session, and plays.

The application should feel:

* Playful
* Fast
* Colorful
* Interactive
* Friendly
* Game-like
* Modern
* Mobile-first
* Suitable for classrooms, school competitions, events, training sessions, and casual group quizzes

Do NOT copy Wayground's exact interface, branding, illustrations, assets, layouts, or proprietary design patterns. Use it only as high-level inspiration for the type of experience.

---

# 2. TECHNOLOGY STACK

## Frontend

Use:

* React
* Vite
* JavaScript or TypeScript
* React Router
* Tailwind CSS
* shadcn/ui where appropriate
* Lucide React icons
* Framer Motion for animations
* Axios for API communication

Frontend should be a SPA.

## Backend

Use:

* Laravel
* Laravel API
* PHP 8.2+
* Laravel Sanctum for Super Admin authentication
* RESTful API architecture

## Database

Use:

* SQLite

The project must work out of the box with SQLite without requiring MySQL.

Create proper Laravel migrations, models, relationships, factories where useful, and seeders.

## Real-Time Features

Live quiz gameplay and leaderboard updates should be real-time.

Use Laravel broadcasting/WebSockets or an appropriate Laravel-compatible real-time implementation.

The architecture should support:

* Participant joining
* Participant status
* Quiz start
* Question changes
* Answer submission
* Timer synchronization
* Question completion
* Score updates
* Leaderboard updates
* Quiz completion

Do not rely on constant full-page refreshes.

---

# 3. TYPOGRAPHY

Use the following free fonts throughout the application:

### Primary Font

Quicksand

Use it for:

* Navigation
* Body text
* Buttons
* Forms
* General UI
* Quiz content

### Display / Playful Font

Kiddosy

Use it selectively for:

* Large headings
* Game titles
* Question numbers
* Score celebrations
* Empty states
* Fun UI labels
* Special game moments

Do not overuse Kiddosy.

Typography should remain highly readable.

---

# 4. APPLICATION STRUCTURE

The application should have three major experiences:

## A. Public / Participant Experience

Participants can:

* View the landing page
* See currently live quizzes
* Open a quiz/session link
* Enter a username
* Join a quiz
* Wait for the host
* Play questions
* See immediate answer feedback
* See points earned
* View leaderboard
* Continue playing
* See final results

Participants must NOT need an account.

---

## B. Super Admin Experience

Only authenticated Super Admin users can access the administration system.

The Super Admin can:

* Create quizzes
* Edit quizzes
* Delete quizzes
* Duplicate quizzes
* Create questions
* Edit questions
* Delete questions
* Reorder questions
* Configure quiz settings
* Create and manage quiz groups/categories
* Launch live sessions
* Monitor participants
* Monitor answers
* View live leaderboard
* End sessions
* View previous quiz sessions
* View quiz statistics

No normal user should have permission to create quizzes or questions.

There should be no teacher/admin registration system.

The application starts with a Super Admin account created through the Laravel seeder.

---

# 5. PUBLIC LANDING PAGE

The public website should be intentionally simple.

It is NOT a traditional SaaS marketing landing page.

Do NOT include sections such as:

* About the company
* Pricing
* Testimonials
* Team
* Enterprise
* Blog
* Contact sales

Instead, the landing page should immediately communicate that this is a live quiz platform.

## Landing Page Layout

### Header

Include:

* Platform logo/name
* Live Quizzes button
* Join Quiz button

Keep the header compact.

No complicated navigation.

---

## Hero Section

Create a playful hero area.

Example messaging:

"Ready, Set, Quiz!"

Supporting text:

"Jump into a live quiz, pick your username, and see how high you can climb."

Primary CTA:

"Join a Quiz"

Secondary CTA:

"View Live Quizzes"

Use playful animated illustrations such as:

* Question marks
* Stars
* Trophy
* Confetti
* Floating answer cards
* Game controller-style elements

Do not make the page visually cluttered.

---

# 6. LIVE QUIZZES SECTION

The landing page should prominently display quizzes that are currently live or available to join.

Create a "Live Quizzes" section.

Each quiz card can show:

* Quiz title
* Short description
* Number of questions
* Host/session status
* Participants currently playing
* Quiz category
* Difficulty
* Join button

Example:

"Science Challenge"

12 Questions

24 Players

LIVE

[Join Quiz]

If there are no live quizzes:

Display a playful empty state:

"No quizzes are live right now."

"Check back soon!"

---

# 7. JOIN QUIZ FLOW

Participants should never be forced to create an account.

The participant flow should be:

### Step 1

Participant opens a quiz/session link.

Example:

/join/ABCD123

### Step 2

Display quiz information:

* Quiz title
* Host/session name
* Number of questions
* Optional category
* Session status

Then show:

"Choose your username"

Input:

Username

Button:

"Join Quiz"

---

# 8. USERNAME SYSTEM

Participants only need a username for the current quiz session.

Do not create a permanent participant account.

The backend should create a temporary participant/session record.

Requirements:

* Username must be required
* Username must have a reasonable maximum length
* Prevent duplicate usernames within the same session
* Username should be sanitized
* Prevent inappropriate HTML/script injection
* Allow participants to use the same username in different quizzes
* Participant identity should be tied to the current session

If a username is already taken:

"That username is already playing. Try another one."

---

# 9. WAITING ROOM

After joining, participants enter a waiting room.

Display:

* Quiz title
* Participant username
* Current participant count
* Other participants
* Group/team if assigned
* Animated waiting illustration

Example:

"You're in!"

"Waiting for the host to start the quiz..."

The participant should receive a real-time event when the host starts.

Do not require refreshing the page.

---

# 10. GROUP / TEAM SYSTEM

The platform must support grouping participants.

Groups are created and controlled by the Super Admin/host.

Example groups:

* Team Alpha
* Team Blue
* Team Red
* Team Green

A live quiz session can have multiple groups.

Participants can either:

### Option A

Select a group during joining.

OR

### Option B

Be assigned to a group by the host.

Implement the system so that the host can configure the preferred joining behavior.

---

# 11. GROUP SETTINGS

For every quiz session, allow:

* Groups enabled/disabled
* Number of groups
* Group names
* Group colors
* Maximum participants per group
* Automatic group assignment
* Manual group assignment

Example:

Team A
Team B
Team C
Team D

The system should support both:

### Individual leaderboard

Players compete individually.

### Group leaderboard

Players contribute points toward their group's total.

---

# 12. QUIZ CREATION SYSTEM

Only Super Admin users can create quizzes.

Admin dashboard should include:

"Create Quiz"

The quiz creation form should support:

* Quiz title
* Description
* Cover image/illustration
* Category
* Difficulty
* Estimated duration
* Tags
* Status
* Visibility
* Question settings

Quiz statuses:

* Draft
* Published
* Archived

Only published quizzes can be launched.

---

# 13. QUESTION BUILDER

The Super Admin should have a dedicated question builder.

Each question should support:

* Question text
* Question image
* Question audio optionally
* Answer options
* Correct answer
* Time limit
* Points
* Explanation
* Question order

Question types should include:

### Multiple Choice

Example:

What is 2 + 2?

A. 2
B. 3
C. 4
D. 5

Only one answer is correct.

### True / False

Example:

"The Earth revolves around the Sun."

True
False

### Multiple Select

Allow more than one correct answer.

### Short Answer

Participant types an answer.

The system should normalize answers where appropriate.

For example:

"Paris"

"paris"

should be treated as the same answer if case-insensitive matching is enabled.

---

# 14. QUESTION DESIGN

Questions should be visually engaging.

Use large readable question text.

Answer options should appear as large interactive cards.

Example:

┌──────────────┐
│      A       │
│   Answer A   │
└──────────────┘

┌──────────────┐
│      B       │
│   Answer B   │
└──────────────┘

Use responsive layouts:

Desktop:

2 × 2 answer grid

Mobile:

1 × 4 or 2 × 2 depending on screen size.

---

# 15. QUESTION TIMER

Each question can have a configurable time limit.

Examples:

5 seconds
10 seconds
15 seconds
20 seconds
30 seconds
60 seconds
120 seconds

Display a prominent countdown timer.

The timer must be synchronized with the server/session rather than relying entirely on the participant's local clock.

When time expires:

* Disable answering
* Automatically submit unanswered state
* Move to the appropriate quiz state

---

# 16. SCORING SYSTEM

Implement a configurable scoring system.

Base points should be awarded for correct answers.

Optionally apply speed-based scoring.

Example:

Correct answer:

+100 points

Fast correct answer:

+100 to +500 bonus depending on remaining time.

Incorrect answer:

0 points

Do not deduct points unless the quiz explicitly enables negative scoring.

Quiz settings should allow the Super Admin to configure:

* Base points
* Speed bonus
* Negative points
* Maximum points per question

---

# 17. ANSWER FEEDBACK

After answering, show a playful result state.

Correct:

"Correct!"

Incorrect:

"Not quite!"

Timed out:

"Time's up!"

Show:

* Correct answer
* Points earned
* Current score
* Current rank

Use animations and lightweight confetti for correct answers and major milestones.

Keep animations performant.

---

# 18. LIVE LEADERBOARD

This is a major feature.

Create a real-time leaderboard.

Leaderboard should display:

Rank
Username
Group
Score

Example:

1  Victory      Team Blue     1,250
2  Daniel       Team Red      1,180
3  Ada          Team Blue     1,090
4  Chris        Team Green      980

The leaderboard should update automatically whenever scores change.

No refresh should be required.

---

# 19. LEADERBOARD MODES

Support:

### Individual leaderboard

Rank participants individually.

### Group leaderboard

Rank teams/groups.

Example:

🏆 Team Blue — 5,430
🥈 Team Red — 5,120
🥉 Team Green — 4,890

The Super Admin can configure which leaderboard mode is active.

---

# 20. LIVE HOST / GAME CONTROL

Create a Super Admin live game control panel.

When a quiz is launched, the admin should see:

* Quiz title
* Session code
* Join URL
* Participant count
* Groups
* Current question
* Timer
* Number answered
* Correct answer percentage
* Leaderboard
* Participant list

Controls:

[Start Quiz]

[Next Question]

[Pause]

[Resume]

[Show Leaderboard]

[End Quiz]

The host should have full control of the game state.

---

# 21. LIVE SESSION CODE

Every live quiz session should generate a unique session code.

Example:

ABX729

Participants can use:

/join/ABX729

The session code should be:

* Unique
* Short
* Case-insensitive
* Easy to communicate verbally

The Super Admin should be able to copy:

"Join Quiz"

and

"Copy Session Code"

buttons.

---

# 22. QR CODE JOINING

Generate a QR code for every live session.

The QR code should point to the session's join URL.

Admin live screen should show:

"Scan to Join"

with a large QR code.

This is useful for classrooms and physical events.

---

# 23. PARTICIPANT PRESENCE

The backend should track whether participants are:

* Connected
* Waiting
* Playing
* Answered
* Disconnected
* Finished

If a participant temporarily disconnects, allow them to reconnect to the current session where possible.

Do not allow participants to manipulate their score from the frontend.

All scoring must be validated server-side.

---

# 24. ANTI-CHEATING / GAME INTEGRITY

Implement basic game integrity.

The frontend must NEVER be trusted for:

* Correct answers
* Score calculation
* Question progression
* Timer authority
* Leaderboard ranking

The server should validate:

* Participant belongs to session
* Question belongs to active quiz
* Question is currently active
* Participant has not already answered
* Answer is valid
* Answer timing is valid
* Score calculation

Do not expose the correct answer in public API responses before the question is completed.

---

# 25. ADMIN DASHBOARD

Create a polished Super Admin dashboard.

Dashboard cards:

### Total Quizzes

Example:

24

### Published Quizzes

16

### Live Sessions

3

### Total Participants

1,240

Include charts such as:

* Quiz activity
* Participants per session
* Average scores
* Questions answered
* Quiz completion rate

Use clean playful charts without making the dashboard look like an enterprise banking system.

---

# 26. ADMIN SIDEBAR

Sidebar:

Dashboard

Quizzes

Questions

Groups

Live Sessions

Results

Statistics

Settings

Logout

Only Super Admin should see these administrative routes.

---

# 27. QUIZ MANAGEMENT

Quiz management page should have:

Search

Filter

Sort

Create Quiz

Each quiz row/card should show:

* Title
* Category
* Number of questions
* Status
* Created date
* Last updated
* Actions

Actions:

Edit

Duplicate

Preview

Launch

Archive

Delete

---

# 28. QUESTION MANAGEMENT

Inside each quiz:

Display all questions in an ordered list.

Example:

01 — What is the capital of Nigeria?
02 — Which planet is known as the Red Planet?
03 — What is 5 × 8?

Allow:

* Drag-and-drop reordering
* Edit
* Duplicate
* Delete
* Preview

The question editor should be easy to use.

---

# 29. QUIZ PREVIEW

Before publishing a quiz, the Super Admin should be able to preview it exactly as participants will see it.

Provide:

"Preview Quiz"

The preview should simulate:

* Question screen
* Answer selection
* Timer
* Correct/incorrect feedback
* Leaderboard

Preview mode must not affect real statistics or scores.

---

# 30. RESULTS

After a quiz ends, save the complete session results.

Results should show:

* Winner
* Final leaderboard
* Participant scores
* Group scores
* Correct answers
* Incorrect answers
* Average score
* Average response time
* Question difficulty/performance

Allow Super Admin to open historical sessions.

---

# 31. DATABASE DESIGN

Create proper migrations.

Suggested tables:

### admins

* id
* name
* email
* password
* created_at
* updated_at

### quizzes

* id
* title
* slug
* description
* category
* difficulty
* cover_image
* status
* settings
* created_by
* created_at
* updated_at

### questions

* id
* quiz_id
* type
* question_text
* image
* audio
* explanation
* time_limit
* points
* negative_points
* order
* settings
* created_at
* updated_at

### answer_options

* id
* question_id
* option_text
* image
* is_correct
* order
* created_at
* updated_at

### quiz_sessions

* id
* quiz_id
* session_code
* status
* current_question_id
* current_question_started_at
* started_at
* ended_at
* settings
* created_at
* updated_at

### participants

* id
* quiz_session_id
* username
* group_id
* score
* correct_answers
* incorrect_answers
* status
* joined_at
* last_seen_at
* finished_at

### groups

* id
* quiz_session_id
* name
* color
* score
* created_at
* updated_at

### participant_answers

* id
* participant_id
* question_id
* answer
* is_correct
* points_earned
* response_time
* answered_at

### quiz_results

* id
* quiz_session_id
* participant_id
* final_score
* final_rank
* created_at

Use foreign keys and appropriate indexes.

---

# 32. API STRUCTURE

Organize Laravel controllers logically.

Example:

/api/auth

/api/quizzes

/api/questions

/api/sessions

/api/participants

/api/groups

/api/answers

/api/leaderboard

/api/results

/admin

Keep participant endpoints separate from Super Admin endpoints.

Use Form Requests for validation.

Use API Resources where useful.

---

# 33. AUTHENTICATION

Only Super Admin needs authentication.

Use Laravel Sanctum.

Admin login:

Email
Password

Include:

* Login
* Logout
* Session persistence
* Protected routes
* Middleware

Do NOT create participant authentication.

Participants should use temporary session identity.

---

# 34. SECURITY

Implement:

* CSRF protection where applicable
* Server-side validation
* Authorization middleware
* Rate limiting
* Input sanitization
* Password hashing
* Secure session handling
* SQL injection protection through Eloquent/query builder
* XSS protection
* Unique session codes
* Score validation
* Question access control

Never send correct answers to participants before answer submission is closed.

---

# 35. RESPONSIVE DESIGN

The platform must work beautifully on:

* Mobile phones
* Tablets
* Laptops
* Desktop monitors
* Large presentation screens

Participant gameplay should be mobile-first.

Admin dashboard can prioritize desktop/tablet but must still be responsive.

---

# 36. VISUAL DESIGN

Create an original playful visual system.

Avoid making the website look like a generic Laravel admin template.

Use:

* Rounded cards
* Large typography
* Soft shadows
* Playful illustrations
* Friendly icons
* Large buttons
* Smooth transitions
* Colorful quiz states
* Animated feedback
* Confetti
* Floating decorative elements

However, maintain strong accessibility and readability.

Avoid excessive:

* Glassmorphism
* Neon effects
* Gradients everywhere
* Heavy shadows
* Overly complicated animations

The UI should feel polished rather than childish.

---

# 37. COLOR SYSTEM

Create a flexible color system.

Use a bright primary color for interactive actions.

Suggested palette:

Primary:
#6C5CE7

Secondary:
#00B894

Accent:
#FDCB6E

Danger:
#FF7675

Background:
#F8F9FC

Text:
#252A34

White:
#FFFFFF

These are starting values and can be adjusted during implementation.

Use semantic color tokens rather than hardcoding colors throughout components.

---

# 38. ANIMATIONS

Use Framer Motion for meaningful animations.

Examples:

* Page transitions
* Quiz question transitions
* Answer selection
* Correct answer celebration
* Leaderboard rank changes
* Score count-up
* Participant joining
* Waiting room activity
* Confetti

Animations should be short and responsive.

Respect:

prefers-reduced-motion

---

# 39. ACCESSIBILITY

Implement:

* Keyboard navigation
* Proper focus states
* ARIA labels
* Sufficient color contrast
* Screen-reader-friendly controls
* Large touch targets
* Reduced-motion support

Do not use color alone to communicate correct/incorrect answers.

---

# 40. EMPTY STATES

Create polished empty states.

Examples:

No live quizzes:

"No live quizzes right now."

No quizzes:

"You haven't created any quizzes yet."

No participants:

"Waiting for players to join..."

No results:

"Results will appear here after a quiz session."

Use playful illustrations.

---

# 41. ERROR HANDLING

Create friendly error messages.

Examples:

Session not found:

"Oops! We couldn't find that quiz."

Session ended:

"This quiz has already ended."

Quiz unavailable:

"This quiz isn't available right now."

Username taken:

"That username is already playing."

Connection lost:

"Connection lost. Trying to reconnect..."

Do not expose raw Laravel errors to users.

---

# 42. LOADING STATES

Use skeleton loaders and animated loading states.

Avoid blank screens.

Examples:

Quiz loading skeleton

Leaderboard skeleton

Admin dashboard skeleton

Participant loading screen

---

# 43. LIVE CONNECTION HANDLING

The frontend should gracefully handle:

* WebSocket connection
* Reconnection
* Temporary network loss
* Participant reconnect
* Session state recovery

When the connection is lost:

"Reconnecting..."

When restored:

"You're back!"

The participant should not lose their current session unnecessarily.

---

# 44. ROUTING

Suggested frontend routes:

/

/join/:sessionCode

/play/:sessionCode

/play/:sessionCode/question

/play/:sessionCode/leaderboard

/play/:sessionCode/results

/admin/login

/admin

/admin/quizzes

/admin/quizzes/create

/admin/quizzes/:id

/admin/quizzes/:id/questions

/admin/sessions

/admin/sessions/:id

/admin/results

/admin/settings

Use protected route guards for admin routes.

---

# 45. COMPONENT ARCHITECTURE

Create reusable React components.

Examples:

Button

Card

Modal

Input

Select

QuizCard

QuestionCard

AnswerOption

Timer

Leaderboard

ParticipantList

GroupBadge

ScoreDisplay

QuizHeader

GameProgress

WaitingRoom

ConfettiEffect

SessionCode

QRCode

AdminSidebar

AdminHeader

StatsCard

QuizEditor

QuestionEditor

QuestionPreview

---

# 46. STATE MANAGEMENT

Use a clean state-management strategy.

Separate:

### Server state

Quiz data

Questions

Sessions

Participants

Results

### Client state

Current selected answer

UI state

Animations

Modal state

Temporary participant state

Do not duplicate server state unnecessarily.

---

# 47. ADMIN QUIZ EDITOR UX

The quiz editor should feel similar to a modern content creation tool.

Example layout:

LEFT:

Question list

CENTER:

Question editor

RIGHT:

Question settings

Top:

Quiz title

Save

Preview

Publish

Autosave can be implemented if appropriate.

Clearly indicate:

Saved

Saving...

Unsaved changes

---

# 48. QUIZ PUBLISHING

A quiz should have a publishing workflow.

Draft:

Only Super Admin can access.

Published:

Available for launching.

Archived:

Cannot be launched unless restored.

Before publishing:

Validate that:

* Quiz has a title
* Quiz has at least one question
* Questions are valid
* Each question has valid answer options
* Correct answers exist where required

---

# 49. LIVE SESSION LIFECYCLE

Implement the following lifecycle:

DRAFT QUIZ

↓

PUBLISHED QUIZ

↓

CREATE SESSION

↓

WAITING

↓

LIVE

↓

PAUSED

↓

LIVE

↓

FINISHED

↓

RESULTS

A session should never accidentally return to an invalid state.

---

# 50. REAL-TIME EVENT EXAMPLES

Create appropriate backend events such as:

QuizSessionStarted

QuestionStarted

QuestionEnded

ParticipantJoined

ParticipantLeft

ParticipantAnswered

ScoreUpdated

LeaderboardUpdated

QuizPaused

QuizResumed

QuizFinished

Broadcast these events to the appropriate session/channel.

---

# 51. DATA VALIDATION

Use Laravel Form Requests.

Examples:

CreateQuizRequest

UpdateQuizRequest

CreateQuestionRequest

UpdateQuestionRequest

JoinSessionRequest

SubmitAnswerRequest

CreateGroupRequest

Validate all input server-side.

---

# 52. SEED DATA

Create a database seeder containing:

* One Super Admin
* Several sample quizzes
* Sample questions
* Sample answer options
* Sample categories

Use clearly documented development credentials.

Do not hardcode production credentials.

---

# 53. ADMIN LOGIN EXPERIENCE

Create a simple dedicated admin login page.

Do not make it look like the participant experience.

Use the same overall brand language but make it more functional.

Fields:

Email

Password

Login

Include proper validation and error states.

---

# 54. PARTICIPANT EXPERIENCE PRIORITY

The participant gameplay experience is the most important part of the application.

A participant should be able to go from:

Quiz link

↓

Username

↓

Join

↓

Waiting room

↓

Question

↓

Answer

↓

Feedback

↓

Next question

↓

Leaderboard

↓

Final result

with as little friction as possible.

No registration.

No unnecessary forms.

No account creation.

No unnecessary navigation.

---

# 55. PERFORMANCE

Optimize for fast gameplay.

Use:

* Lazy-loaded routes
* Optimized images
* API caching where appropriate
* Efficient database queries
* Pagination in admin lists
* WebSocket updates instead of polling where possible
* Debounced search
* Minimal unnecessary React renders

Leaderboard updates should be efficient even when many participants are connected.

---

# 56. MOBILE GAMEPLAY

On mobile:

Question should occupy most of the viewport.

Keep:

* Timer visible
* Question readable
* Answer buttons large
* Score accessible
* Progress indicator visible

Do not force participants to zoom.

Avoid horizontal scrolling.

---

# 57. LARGE SCREEN / PROJECTOR MODE

Create a presentation-friendly live host view.

This should work well on:

* Classroom projectors
* TVs
* Large monitors

Use:

* Large question text
* Large timer
* Large answer choices
* Large leaderboard
* High contrast

The host should be able to display the current question while participants answer from their phones.

---

# 58. GROUP COMPETITION EXPERIENCE

When groups are enabled, visually highlight group identity.

Participants should see:

"You are playing for Team Blue"

Leaderboard can show:

TEAM BLUE
1,240 points

TEAM RED
1,180 points

TEAM GREEN
1,020 points

Animate changes in group ranking.

---

# 59. FINAL RESULTS

When the quiz finishes, participants see a final results screen.

Show:

* Final score
* Final rank
* Number correct
* Number incorrect
* Accuracy percentage
* Group
* Group ranking if enabled

Then display:

"Final Leaderboard"

Use celebration animations.

---

# 60. ADMIN ANALYTICS

For completed sessions, calculate:

* Total participants
* Completion rate
* Average score
* Highest score
* Lowest score
* Average response time
* Question accuracy
* Most difficult question
* Easiest question
* Group performance

Display charts and tables.

---

# 61. ORIGINAL BRANDING

Do not use the name "Wayground" anywhere in the application.

Do not copy:

* Wayground logo
* Wayground illustrations
* Wayground exact colors
* Wayground exact UI
* Wayground assets
* Wayground text
* Wayground source code

The application should have its own identity.

Create a simple original quiz-platform logo using a playful concept such as:

* Question mark
* Quiz card
* Trophy
* Lightning bolt
* Speech bubble

The final brand should feel like an independent Nigerian-built or globally usable quiz platform rather than a clone.

---

# 62. CODE QUALITY

Follow clean architecture principles.

Use:

* Reusable React components
* Laravel service classes where logic is complex
* Form Requests
* API Resources
* Policies
* Events
* Jobs where appropriate
* Proper database relationships
* Environment variables
* Clear naming conventions

Do not put large amounts of business logic inside React components.

Do not put complex business logic directly inside Laravel controllers.

---

# 63. DOCUMENTATION

Create a README containing:

* Project overview
* Requirements
* Installation
* Environment configuration
* SQLite setup
* Laravel setup
* React setup
* Database migrations
* Seeder instructions
* Admin login setup
* WebSocket/realtime setup
* Development commands
* Production build commands

---

# 64. DEVELOPMENT COMMANDS

The project should be straightforward to start.

Backend:

php artisan migrate

php artisan db:seed

php artisan serve

Frontend:

npm install

npm run dev

Document any additional real-time/WebSocket commands required.

---

# 65. FINAL DELIVERABLE

Build the application as a complete working system rather than a visual prototype.

The final implementation must include:

✓ React frontend

✓ Laravel backend

✓ SQLite database

✓ Super Admin authentication

✓ Quiz creation

✓ Question creation

✓ Question editing

✓ Question deletion

✓ Question ordering

✓ Quiz publishing

✓ Live sessions

✓ Unique session codes

✓ Guest participant joining

✓ Username-only participant identity

✓ Waiting room

✓ Groups/teams

✓ Individual leaderboard

✓ Group leaderboard

✓ Real-time gameplay

✓ Real-time leaderboard

✓ Server-side scoring

✓ Timers

✓ Answer validation

✓ Final results

✓ QR code joining

✓ Admin analytics

✓ Responsive UI

✓ Mobile gameplay

✓ Projector-friendly host mode

✓ Error handling

✓ Loading states

✓ Reconnection handling

✓ Accessibility

✓ Seed data

✓ Documentation

---

# 66. IMPLEMENTATION APPROACH

Do not attempt to build everything as one enormous component.

Build incrementally in this order:

PHASE 1
Project setup and design system

PHASE 2
Laravel database architecture

PHASE 3
Super Admin authentication

PHASE 4
Quiz CRUD

PHASE 5
Question builder

PHASE 6
Public landing page

PHASE 7
Guest join flow

PHASE 8
Waiting room

PHASE 9
Live session engine

PHASE 10
Question answering

PHASE 11
Scoring engine

PHASE 12
Real-time leaderboard

PHASE 13
Groups/team system

PHASE 14
Final results

PHASE 15
Admin analytics

PHASE 16
QR joining

PHASE 17
Responsive/mobile optimization

PHASE 18
Security hardening

PHASE 19
Performance optimization

PHASE 20
Final testing

---

# 67. IMPORTANT PRODUCT RULES

These rules are mandatory:

1. Guests do not register.

2. Guests do not create accounts.

3. Guests only provide a username when joining a quiz session.

4. Only Super Admin users can create quizzes.

5. Only Super Admin users can create or edit questions.

6. No public quiz creation.

7. No teacher accounts.

8. No student accounts.

9. Participant scores must be calculated server-side.

10. Correct answers must not be exposed before the appropriate point in the game.

11. Live leaderboard must update in real time.

12. Groups must be supported.

13. Individual and group rankings must be supported.

14. The public website should primarily focus on joining and discovering live quizzes.

15. The platform must work without requiring MySQL.

16. SQLite is the default database.

17. The participant interface must be mobile-first.

18. The host/admin interface must support large-screen presentation.

19. The UI must use Quicksand and Kiddosy.

20. The design must be original and must not directly copy Wayground.

---

# 68. STARTING INSTRUCTION TO THE AI DEVELOPER

Before writing the implementation:

1. Analyze the complete requirements.
2. Create the project architecture.
3. Define the database relationships.
4. Define the API endpoints.
5. Define the real-time event architecture.
6. Define the frontend route structure.
7. Define the reusable component system.
8. Define the design tokens.
9. Define the quiz/session state machine.
10. Then begin implementation phase-by-phase.

Do not skip architectural planning.

Do not create fake buttons or non-functional UI.

Every major button should connect to a real workflow.

Every CRUD operation should persist to SQLite.

Every quiz session should use real backend state.

Every score should be calculated and validated by Laravel.

Every live leaderboard update should come from actual session data.

The final result should feel like a polished, production-quality interactive quiz game rather than an admin dashboard with a quiz attached.

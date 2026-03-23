## ADDED Requirements

### Requirement: Landing page with slug claim
The system SHALL display a landing page at `/` with a prominent slug input field and "Claim your link" CTA button (cal.com style). The input SHALL show a live preview of the resulting URL (rezume.so/{input}).

#### Scenario: Slug input shows URL preview
- **WHEN** a visitor types "liam" into the slug input
- **THEN** the page shows a preview like "rezume.so/liam" updating in real-time

### Requirement: Live slug availability check
The system SHALL check slug availability in real-time as the user types (debounced). Available slugs show a green checkmark; taken or reserved slugs show a red indicator with a message.

#### Scenario: Available slug shows green
- **WHEN** a visitor types a slug that is not taken and not reserved
- **THEN** a green checkmark appears indicating availability

#### Scenario: Taken slug shows red
- **WHEN** a visitor types a slug that is already claimed
- **THEN** a red indicator appears with "This slug is taken"

### Requirement: Slug check API endpoint
The system SHALL provide a `GET /api/slug/check?slug={slug}` endpoint that returns availability status. The endpoint SHALL validate format, check the reserved list, and query the database.

#### Scenario: API returns availability
- **WHEN** a GET request is made to /api/slug/check?slug=liam
- **THEN** the response includes `{ available: true/false, reason?: string }`

### Requirement: Sign-up with slug pre-fill
The system SHALL pass the claimed slug to the sign-up page. After successful registration, the slug is associated with the new user's account. The sign-up page SHALL support email/password registration.

#### Scenario: Slug preserved through sign-up
- **WHEN** a visitor claims slug "liam" and completes sign-up
- **THEN** their account is created with slug "liam" reserved for them

### Requirement: First upload prompt
After sign-up with a claimed slug, the system SHALL redirect the user to an upload page prompting them to upload their first resume and set a display name.

#### Scenario: Post-signup upload flow
- **WHEN** a new user completes sign-up with a claimed slug
- **THEN** they are redirected to an upload page where they can upload a PDF and set a display/download filename

### Requirement: Login page
The system SHALL provide a login page at `/login` with email/password fields and a link to the sign-up page.

#### Scenario: Successful login
- **WHEN** a user enters valid credentials on /login
- **THEN** they are redirected to /app (dashboard)

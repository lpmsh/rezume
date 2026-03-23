## ADDED Requirements

### Requirement: Dashboard resume list
The system SHALL display the authenticated user's resumes on the dashboard page (`/app`) showing: display name, slug with copyable public link, view count, and last updated date.

#### Scenario: User sees their resume
- **WHEN** an authenticated user with one uploaded resume visits /app
- **THEN** they see their resume's display name, a copy-link button for rezume.so/{slug}, the view count, and the last updated date

#### Scenario: Empty state for new user
- **WHEN** an authenticated user with no resumes visits /app
- **THEN** they see a prompt to upload their first resume

### Requirement: Copy link button
The system SHALL provide a one-click copy button that copies the full public URL (`rezume.so/{slug}`) to the clipboard and shows a brief confirmation.

#### Scenario: Link copied to clipboard
- **WHEN** a user clicks the copy link button
- **THEN** the URL is copied to clipboard and a "Copied!" confirmation appears briefly

### Requirement: Re-upload from dashboard
The system SHALL allow users to re-upload a resume from the dashboard. The upload replaces the existing file while preserving the slug and URL.

#### Scenario: Re-upload from dashboard
- **WHEN** a user clicks "Update Resume" and selects a new PDF
- **THEN** the existing file is replaced and the dashboard shows the updated timestamp

### Requirement: Delete resume
The system SHALL allow users to delete a resume from the dashboard. Deletion removes both the R2 object and the database record, freeing the slug.

#### Scenario: Resume deleted
- **WHEN** a user clicks delete and confirms
- **THEN** the R2 file and database records (Resume + ResumeViews) are removed and the slug becomes available

### Requirement: Edit display name
The system SHALL allow users to edit the display name (used for download filename) from the dashboard.

#### Scenario: Display name updated
- **WHEN** a user edits their display name to "Updated Resume" and saves
- **THEN** the Resume record's displayName is updated and subsequent downloads use the new name

### Requirement: Auth-protected routes
All `/app/*` routes SHALL require authentication via Next.js middleware. Unauthenticated visitors SHALL be redirected to `/login`.

#### Scenario: Unauthenticated redirect
- **WHEN** an unauthenticated visitor navigates to /app
- **THEN** they are redirected to /login

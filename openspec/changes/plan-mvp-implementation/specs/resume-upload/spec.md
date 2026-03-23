## ADDED Requirements

### Requirement: PDF upload endpoint
The system SHALL provide a `POST /api/upload` endpoint that accepts multipart form data with a single PDF file. The endpoint SHALL require authentication.

#### Scenario: Successful first upload
- **WHEN** an authenticated user with no existing resume submits a valid PDF under 5MB
- **THEN** the system uploads the file to R2 at key `resumes/{userId}/{resumeId}.pdf`, creates a Resume record linked to the user's claimed slug, and returns the resume data with the public URL

#### Scenario: Unauthenticated upload rejected
- **WHEN** an unauthenticated request is sent to POST /api/upload
- **THEN** the system responds with 401 Unauthorized

### Requirement: File validation
The system SHALL validate that uploaded files are PDFs (checking both MIME type and file extension) and do not exceed 5MB. Invalid files SHALL be rejected before R2 upload.

#### Scenario: Non-PDF rejected
- **WHEN** a user uploads a .docx file
- **THEN** the system responds with 400 and an error message indicating only PDFs are accepted

#### Scenario: Oversized file rejected
- **WHEN** a user uploads a 6MB PDF
- **THEN** the system responds with 400 and an error message indicating the 5MB limit

### Requirement: Re-upload replaces file
The system SHALL allow a user to re-upload a resume, replacing the existing R2 object and updating the Resume record's r2Key, fileSize, and updatedAt. The slug and public URL SHALL remain unchanged.

#### Scenario: Re-upload preserves URL
- **WHEN** a user with existing slug "liam" uploads a new PDF
- **THEN** the old R2 object is deleted, the new file is uploaded, and rezume.so/liam still serves the new file

### Requirement: Upload rate limiting
The system SHALL rate-limit uploads using Upstash Redis to a maximum of 10 uploads per hour per user. Exceeded requests SHALL receive 429 Too Many Requests.

#### Scenario: Rate limit exceeded
- **WHEN** a user has uploaded 10 files in the past hour and attempts another upload
- **THEN** the system responds with 429 and a message indicating the rate limit

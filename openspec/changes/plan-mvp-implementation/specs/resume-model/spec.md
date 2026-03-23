## ADDED Requirements

### Requirement: Resume data model
The system SHALL store resumes in a `Resume` table with fields: id (cuid), userId (FK to User), displayName, slug, namedSlug (nullable), r2Key, fileSize (int), mimeType, isPublic (default true), password (nullable), viewCount (default 0), createdAt, updatedAt. A composite unique constraint SHALL exist on `[slug, namedSlug]`.

#### Scenario: Create resume record
- **WHEN** a user uploads a resume with slug "liam" and display name "Liam Resume"
- **THEN** the system creates a Resume record with the given slug, displayName, and links it to the authenticated user

#### Scenario: Slug uniqueness enforced
- **WHEN** a user attempts to claim slug "liam" and that slug already exists with null namedSlug
- **THEN** the system rejects the request with an error indicating the slug is taken

### Requirement: Resume view tracking model
The system SHALL store resume views in a `ResumeView` table with fields: id (cuid), resumeId (FK to Resume), ipHash (nullable), userAgent (nullable), viewedAt (default now).

#### Scenario: View recorded
- **WHEN** a unique visitor views a public resume
- **THEN** a ResumeView record is created with the hashed IP and user agent

### Requirement: Reserved slugs blocklist
The system SHALL maintain a static array of reserved slugs: app, www, api, admin, login, signup, register, pricing, blog, help, support, about, terms, privacy, contact, dashboard, upload, settings, account, pro, billing, favicon, robots, sitemap. Slug validation SHALL reject any slug matching this list (case-insensitive).

#### Scenario: Reserved slug rejected
- **WHEN** a user attempts to claim slug "admin"
- **THEN** the system rejects the request with an error indicating the slug is reserved

#### Scenario: Valid slug accepted
- **WHEN** a user attempts to claim slug "liam" and it is not reserved or taken
- **THEN** the system accepts the slug

### Requirement: Slug format validation
Slugs SHALL be 3-30 characters, lowercase, alphanumeric with hyphens allowed (no leading/trailing hyphens). The system SHALL normalize input to lowercase before validation.

#### Scenario: Invalid slug format rejected
- **WHEN** a user submits slug "A!" or "hi" or "-bad-"
- **THEN** the system rejects with a format validation error

#### Scenario: Valid slug normalized
- **WHEN** a user submits slug "Liam"
- **THEN** the system normalizes to "liam" and proceeds with validation

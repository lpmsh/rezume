## ADDED Requirements

### Requirement: Public resume route
The system SHALL serve a public resume page at `/[slug]` that fetches the Resume record by slug (where namedSlug is null for free-tier). The page SHALL render server-side for SEO.

#### Scenario: Valid slug renders resume
- **WHEN** a visitor navigates to rezume.so/liam and slug "liam" exists with isPublic true
- **THEN** the page renders an inline PDF viewer with the resume and a download button

#### Scenario: Unknown slug shows 404
- **WHEN** a visitor navigates to rezume.so/nonexistent
- **THEN** the system returns a 404 page

#### Scenario: Private resume shows 404
- **WHEN** a visitor navigates to a slug where isPublic is false
- **THEN** the system returns a 404 page (does not reveal the resume exists)

### Requirement: Inline PDF viewer
The system SHALL display the resume PDF inline using an iframe or embed element with the R2 presigned URL. The viewer SHALL fill the viewport width and use reasonable height.

#### Scenario: PDF loads in viewer
- **WHEN** the public resume page renders
- **THEN** the PDF is displayed inline without requiring a download

### Requirement: Download button
The system SHALL provide a download button that triggers a file download with `Content-Disposition: attachment; filename={displayName}.pdf`.

#### Scenario: Download uses display name
- **WHEN** a visitor clicks the download button for a resume with displayName "Liam Monaghan Resume"
- **THEN** the browser downloads the file as "Liam Monaghan Resume.pdf"

### Requirement: Powered by footer
The system SHALL display a "Powered by rezume.so" footer on all public resume pages for free-tier users. The footer SHALL link to the rezume.so landing page.

#### Scenario: Footer visible on free resume
- **WHEN** a free-tier user's resume page loads
- **THEN** a "Powered by rezume.so" link is visible at the bottom of the page

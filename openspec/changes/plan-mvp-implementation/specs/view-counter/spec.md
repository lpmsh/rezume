## ADDED Requirements

### Requirement: IP-deduplicated view counting
The system SHALL count unique views per resume using Redis-based IP deduplication. For each view, the system hashes the viewer's IP, checks Redis key `view:{resumeId}:{ipHash}`. If absent, the key is set with 24-hour TTL, the Resume's viewCount is incremented, and a ResumeView record is created.

#### Scenario: First view from IP counts
- **WHEN** a visitor with IP hash "abc123" views resume "r1" for the first time
- **THEN** viewCount increments by 1, a ResumeView is created, and a Redis key is set with 24h TTL

#### Scenario: Repeat view within 24h does not count
- **WHEN** the same visitor (same IP hash) views resume "r1" again within 24 hours
- **THEN** viewCount does not change and no new ResumeView is created

#### Scenario: Repeat view after 24h counts again
- **WHEN** the same visitor views resume "r1" after the 24h Redis TTL has expired
- **THEN** viewCount increments by 1 and a new ResumeView is created

### Requirement: Owner view exclusion
The system SHALL NOT count views from the resume owner. Owner detection is based on the authenticated session's userId matching the resume's userId.

#### Scenario: Owner viewing own resume
- **WHEN** the resume owner views their own public resume page while logged in
- **THEN** viewCount does not change and no ResumeView is created

### Requirement: Bot filtering
The system SHALL filter views from common bots by checking the User-Agent header against known bot patterns (Googlebot, Bingbot, crawlers, etc.). Bot views SHALL NOT increment the view count.

#### Scenario: Bot view ignored
- **WHEN** a request with User-Agent containing "Googlebot" accesses a public resume
- **THEN** viewCount does not change and no ResumeView is created

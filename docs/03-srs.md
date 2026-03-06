# Software Requirements Specification (SRS)

**Project:** Bumbershoot Collaboration  
**Sponsor:** Aaron Starkey, Acting CTO, Bumbershoot  
**Prepared by:** Bumbershoot Capstone Development Team  

---

## Table of Contents

1. [Introduction](#1-introduction)
   - 1.1 [Purpose](#11-purpose)
   - 1.2 [Scope](#12-scope)
2. [General Description](#2-general-description)
   - 2.1 [Product Purpose](#21-product-purpose)
   - 2.2 [Intended Users and User Characteristics](#22-intended-users-and-user-characteristics)
   - 2.3 [System Functions](#23-system-functions)
   - 2.4 [Benefits and Business Importance](#24-benefits-and-business-importance)
   - 2.5 [Operating Environment and Constraints](#25-operating-environment-and-constraints)
3. [System Capabilities](#3-system-capabilities)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [External Interfaces](#6-external-interfaces)
   - 6.1 [User Interface](#61-user-interface)
   - 6.2 [Software Interfaces](#62-software-interfaces)
7. [Data Requirements](#7-data-requirements)
8. [Constraints and Assumptions](#8-constraints-and-assumptions)
9. [Acceptance Criteria](#9-acceptance-criteria)
   - 9.1 [Core Functional Acceptance](#91-core-functional-acceptance)
   - 9.2 [Stability and Offline Operation Acceptance](#92-stability-and-offline-operation-acceptance)
   - 9.3 [Data Refresh and Change Handling Acceptance](#93-data-refresh-and-change-handling-acceptance)
   - 9.4 [Performance and Network Efficiency Acceptance](#94-performance-and-network-efficiency-acceptance)
   - 9.5 [Scope and Constraint Acceptance](#95-scope-and-constraint-acceptance)
10. [Security and Privacy Considerations](#10-security-and-privacy-considerations)
11. [Traceability Matrix](#11-traceability-matrix)
    - 11.1 [Business Objectives to System Capabilities](#111-business-objectives-to-system-capabilities)
    - 11.2 [System Capabilities to Functional Requirements](#112-system-capabilities-to-functional-requirements)
    - 11.3 [Functional Requirements to Non-Functional Requirements](#113-functional-requirements-to-non-functional-requirements)
    - 11.4 [Sponsor Priority Alignment](#114-sponsor-priority-alignment)
    - 11.5 [Development and Verification Traceability](#115-development-and-verification-traceability)
    - 11.6 [Change Control Traceability](#116-change-control-traceability)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the functional and non-functional requirements for the Bumbershoot Festival Companion Application. The purpose of this document is to establish a clear, unambiguous understanding of the system to be delivered, including its capabilities, constraints, and quality expectations, prior to implementation.

This document serves as the primary contractual reference for scope, behavior, and system performance between the sponsor and the development team.

### 1.2 Scope

The Bumbershoot Festival Companion Application is a native mobile application designed to support festival attendees before and during the event. The system focuses on providing a stable, reliable, and low-friction experience in high-density, low-connectivity festival environments.

The system enables attendees to:

- Browse the festival schedule by time, stage, and category.
- View detailed information for events, including location, timing, and tags.
- Save preferred events locally as favorites and manage a personal plan.
- Receive reminders for scheduled performances and associated venues.
- Navigate venues and key points of interest using an integrated festival map.
- Access the application and core features during offline or low-connectivity conditions.
- Share event and artist information externally using native device mechanisms.

The scope intentionally prioritizes predictable behavior, efficient network usage, and graceful handling of connectivity limitations over advanced personalization or real-time social features.

---

## 2. General Description

### 2.1 Product Purpose

The primary purpose of the system is to provide a stable, reliable, and customer-service-grade digital companion that functions effectively under real-world festival conditions.

The system supports attendee decision-making by providing timely access to official festival information and personal planning tools while minimizing friction and cognitive load.

### 2.2 Intended Users and User Characteristics

The primary users of the system are Bumbershoot festival attendees. Users interact with the application in short, frequent sessions while moving throughout the festival environment.

Key user characteristics include:

- High mobility across venues and stages.
- Intermittent attention and time-sensitive decision-making.
- Limited tolerance for slow load times or application failures.
- Expectation of immediate usability without account creation or setup.

The system is designed to accommodate a range of attendee behaviors, including planners, casual explorers, music-focused attendees, arts-focused attendees, and informal groups coordinating attendance without shared accounts.

### 2.3 System Functions

The system provides the following core functions:

- Browse the festival schedule by time, stage, and category
- View detailed information for events, artists, and booths
- Save preferred items locally for personal planning
- Receive reminders for scheduled performances and venues
- Navigate venues and points of interest using an integrated map
- Share event and artist information externally using native device mechanisms

### 2.4 Benefits and Business Importance

The application serves as a trusted source of festival information during periods of high usage and operational change. By prioritizing stability, predictable behavior, and efficient network usage, the system supports a consistent and dependable attendee experience.

Key benefits include:

- Reduced attendee frustration caused by unreliable connectivity
- Improved confidence in official festival information
- Decreased reliance on ad hoc communication channels
- A scalable digital foundation for future festival enhancements

### 2.5 Operating Environment and Constraints

The application operates on native mobile devices using the React Native framework and is intended for use in environments characterized by high device density and variable network availability.

System constraints include:

- The system shall not require user accounts, authentication, or identity management.
- The system shall not use embedded web views for core application workflows.
- The system shall employ a cache-first design to support offline and low-connectivity operation.
- The system shall limit network usage to predictable and bounded refresh activity.
- The system shall be delivered as a mobile-only application and shall not include a web-based client.

---

## 3. System Capabilities

The system provides the following integrated capabilities as part of a single, cohesive product offering aligned with sponsor requirements and stability goals:

- Discovery of events, artists, and booths through schedule browsing and search
- Detailed views for events, artists, and booths, including location and timing
- Personal planning through locally stored favorites and an automatically generated "My Plan" timeline
- Reminder and notification support for upcoming performances and schedule changes affecting favorited items
- Venue navigation using a festival map with stages, venues, and points of interest
- Access to festival announcements and operational service information
- External sharing of event and artist information, including links to external music platforms

These capabilities are designed to function reliably under low-connectivity conditions, with change-aware refresh behavior (lightweight change checks and conditional updates) and offline fallback to cached content.

---

## 4. Functional Requirements

### FR-01 Explore Screen — Discovery and Browsing

- **FR-01.1** The system shall display a discovery feed organized into sections: Artists, Events, Workshops, and Vendors.
- **FR-01.2** The system shall allow users to browse each section (Artists, Events, Workshops, Vendors) independently.
- **FR-01.3** The system shall allow users to tap any item in the discovery feed to view its full details.
- **FR-01.4** The system shall allow users to search the discovery feed by keyword.
- **FR-01.5** The system shall allow users to filter the discovery feed by category.

### FR-02 Event Information

- **FR-02.1** The system shall display an event title.
- **FR-02.2** The system shall display an event start time.
- **FR-02.3** The system shall display an event end time.
- **FR-02.4** The system shall display an event location.
- **FR-02.5** The system shall display tags or categories associated with an event.
- **FR-02.6** The system shall allow users to mark an event as attending from the event detail screen.
- **FR-02.7** The system shall allow users to remove an attending selection from the event detail screen.
- **FR-02.8** The system shall store attending selections locally on the device.

### FR-03 Artist Information

- **FR-03.1** The system shall display artist name information.
- **FR-03.2** The system shall display artist descriptions when available.
- **FR-03.3** The system shall provide external links to artist platforms.

### FR-04 Booth and Vendor Information

- **FR-04.1** The system shall display booth or vendor names.
- **FR-04.2** The system shall display booth or vendor locations.

### FR-05 Favorites Management

- **FR-05.1** The system shall allow users to mark an event as a favorite.
- **FR-05.2** The system shall allow users to mark an artist as a favorite.
- **FR-05.3** The system shall allow users to mark a booth/vendor as a favorite.
- **FR-05.4** The system shall store favorited items locally on the device.
- **FR-05.5** The system shall display a list of all favorited items.

### FR-06 Personal Schedule

- **FR-06.1** The system shall display a personal schedule screen showing only events the user has marked as attending.
- **FR-06.2** The system shall group personal schedule items by festival day with day headers.
- **FR-06.3** The system shall order personal schedule items within each day by start time.
- **FR-06.4** The system shall display an empty state message when no events have been marked as attending.

### FR-07 Reminders and Notifications

- **FR-07.1** The system shall allow users to create a reminder for a favorited event.
- **FR-07.2** The system shall trigger reminders without requiring network connectivity at trigger time.
- **FR-07.3** The system shall notify users when a favorited event is rescheduled.

### FR-08 Maps and Navigation

- **FR-08.1** The system shall display a festival map.
- **FR-08.2** The system shall display venue locations on the map.
- **FR-08.3** The system shall display points of interest on the map.
- **FR-08.4** The system shall associate events with map locations.

### FR-09 Announcements and Operations

- **FR-09.1** The system shall display festival announcements.
- **FR-09.2** The system shall display operational service information.

### FR-10 Sharing and External Access

- **FR-10.1** The system shall allow users to share event information externally.
- **FR-10.2** The system shall allow users to share artist information externally.
- **FR-10.3** The system shall display links to external music platforms (e.g., Spotify, Apple Music) on the event detail screen when available for the associated artist.

### FR-11 Data Refresh and Synchronization

- **FR-11.1** The system shall store a last successful synchronization timestamp ("Last Updated") for festival data.
- **FR-11.2** The system shall display the "Last Updated" timestamp to the user.
- **FR-11.3** The system shall perform a lightweight change check against a sponsor-provided change endpoint (e.g., /changes) when the application is opened or resumed to the foreground.
- **FR-11.4** The system shall perform a lightweight change check against /changes when the user enters data-critical views (Schedule, My Plan, Announcements), subject to a minimum check interval.
- **FR-11.5** The system shall allow the user to manually initiate a refresh (e.g., pull-to-refresh) from data-critical views.
- **FR-11.6** The system shall not perform /changes checks more frequently than the minimum check interval while the application is active.
- **FR-11.7** The system shall ensure only one /changes request is in flight at a time.
- **FR-11.8** The system shall fetch updated datasets only when the /changes response indicates new or changed data, or when cached data exceeds the maximum staleness threshold.
- **FR-11.9** The system shall reconcile updated festival data with locally stored favorites and the "My Plan" timeline.
- **FR-11.10** The system shall retain previously cached data when update retrieval fails.
- **FR-11.11** The system shall present a non-blocking indication when cached data is being used due to refresh failure.

---

## 5. Non-Functional Requirements

### NFR-01 Performance and Reliability

- **NFR-01.1** The application shall load to a usable schedule view within three seconds on representative devices.
- **NFR-01.2** The application shall continue operating without crashing when network connectivity is unavailable.

### NFR-02 Offline and Low-Bandwidth Operation

- **NFR-02.1** The application shall function using cached data when offline.
- **NFR-02.2** The application shall display the timestamp of the last successful data update.

### NFR-03 Network Efficiency

- **NFR-03.1** The application shall minimize network usage through caching, batching, and controlled refresh intervals.
- **NFR-03.2** The application shall avoid continuous real-time polling or streaming updates.
- **NFR-03.3** The system shall enforce a minimum change-check interval to prevent excessive refresh activity caused by frequent screen navigation.
- **NFR-03.4** The system shall apply retry backoff when change checks or updates fail due to connectivity or server errors.
- **NFR-03.5** The system shall use conditional retrieval mechanisms where supported to minimize payload transfer when data is unchanged.

### NFR-04 Usability and Theming

- **NFR-04.1** The application shall support a templated theming approach allowing primary color changes without redesign.
- **NFR-04.2** The user interface shall remain consistent and distraction-minimized during festival usage.

### NFR-05 Security and Privacy

- **NFR-05.1** The application shall not require user authentication or collect personal user data.

---

## 6. External Interfaces

### 6.1 User Interface

The system shall provide a native mobile user interface implemented using React Native. Core workflows shall not rely on embedded web views.

### 6.2 Software Interfaces

- Festival data source (API, CMS, or static feed), including a lightweight change-check endpoint (e.g., /changes)
- Map service provider
- External music platforms via outbound links

---

## 7. Data Requirements

The system shall manage the following data sets:

- Event schedules
- Artist information
- Booth and vendor information
- Venue and point-of-interest data
- Locally stored favorites and reminders
- Synchronization metadata (e.g., last updated timestamp, dataset version, or change token)

---

## 8. Constraints and Assumptions

**Constraints:**

- Mobile-only application delivery
- React Native implementation
- No user accounts or authentication
- No embedded web views
- Cache-first, offline-capable design
- Predictable and bounded network usage

**Assumptions:**

- Festival data is provided and maintained by sponsor-managed systems
- Schedule updates are authoritative
- Devices may operate offline for extended periods

---

## 9. Acceptance Criteria

The Bumbershoot Festival Companion Application shall be considered acceptable when the following criteria are met.

### 9.1 Core Functional Acceptance

- All Functional Requirements defined in Section 4 are implemented or formally deferred with sponsor approval.
- Users are able to browse the festival schedule, view event details, and access artist and booth information without application errors.
- Users are able to mark events, artists, and booths as favorites and view them in a personal planning timeline.
- Users are able to receive reminders for upcoming performances.
- Users are able to view venues and points of interest on the festival map.
- Users are able to view festival announcements and operational service information.
- Users are able to share event and artist information using native device sharing mechanisms.

### 9.2 Stability and Offline Operation Acceptance

- The application loads to a usable state using locally cached data when network connectivity is unavailable.
- Core user workflows (schedule browsing, favorites, map viewing) remain accessible in offline or low-connectivity conditions.
- The application does not crash or block user interaction when data refresh attempts fail.
- A visible "Last Updated" indicator accurately reflects the most recent successful data synchronization.

### 9.3 Data Refresh and Change Handling Acceptance

- The application performs lightweight change checks in accordance with the defined refresh rules.
- Updated data is fetched only when the change check indicates new or modified content or when cached data exceeds the maximum staleness threshold.
- The application does not perform redundant or overlapping refresh requests during active use.
- Cached data is retained and used when refresh attempts fail.
- Users are informed in a non-blocking manner when cached data is being used.

### 9.4 Performance and Network Efficiency Acceptance

- The application loads to a usable schedule view within three seconds on representative devices under normal conditions.
- Schedule and map interactions remain responsive when large datasets are present.
- Network usage remains bounded and does not rely on continuous polling or real-time streaming.

### 9.5 Scope and Constraint Acceptance

- The application operates without requiring user accounts, authentication, or identity management.
- The application does not rely on embedded web views for core functionality.
- The application is delivered as a mobile-only solution consistent with defined constraints.

---

## 10. Security and Privacy Considerations

The system is designed to minimize security and privacy risk by avoiding user identity, authentication, and personal data collection.

- The system shall not require user authentication or identity management.
- No personally identifiable information shall be collected or transmitted.
- User preferences shall be stored locally on-device only.
- External links shall open outside the application context.

---

## 11. Traceability Matrix

### 11.1 Business Objectives to System Capabilities

| Business Objective | Related System Capabilities |
|---|---|
| Provide a stable festival companion under live conditions | Schedule browsing, offline access, predictable refresh behavior |
| Enable attendees to curate their festival experience | Favorites, personal planning timeline, reminders |
| Support navigation and situational awareness | Festival map, venues, points of interest |
| Reduce attendee frustration during connectivity loss | Cache-first operation, offline fallback, non-blocking error handling |
| Minimize operational and infrastructure load | Change-aware refresh, bounded network usage |

### 11.2 System Capabilities to Functional Requirements

| System Capability | Functional Requirements |
|---|---|
| Schedule discovery and browsing | FR-01.1 – FR-01.5 |
| Event information display | FR-02.1 – FR-02.8 |
| Artist information and discovery | FR-03.1 – FR-03.3 |
| Booth and vendor information | FR-04.1 – FR-04.2 |
| Favorites management | FR-05.1 – FR-05.5 |
| Personal planning timeline | FR-06.1 – FR-06.4 |
| Reminders and notifications | FR-07.1 – FR-07.3 |
| Maps and navigation | FR-08.1 – FR-08.4 |
| Announcements and operations | FR-09.1 – FR-09.2 |
| External sharing and discovery | FR-10.1 – FR-10.3 |
| Data refresh and synchronization | FR-11.1 – FR-11.11 |

### 11.3 Functional Requirements to Non-Functional Requirements

| Functional Area | Functional Requirements | Supporting Non-Functional Requirements |
|---|---|---|
| Schedule browsing | FR-01 | NFR-01, NFR-02, NFR-03 |
| Event / Artist detail views | FR-02, FR-03 | NFR-01, NFR-04 |
| Favorites and planning | FR-05, FR-06 | NFR-02, NFR-05 |
| Reminders | FR-07 | NFR-01, NFR-02 |
| Maps and Navigation | FR-08 | NFR-01, NFR-03 |
| Announcements | FR-09 | NFR-01, NFR-02 |
| Sharing | FR-10 | NFR-05 |
| Data Refresh and Change Handling | FR-11 | NFR-01, NFR-02, NFR-03 |

### 11.4 Sponsor Priority Alignment

| Sponsor Priority | Requirements Supporting Priority |
|---|---|
| Most stable festival app | FR-11, NFR-01, NFR-02 |
| Offline and low-bandwidth usability | FR-11.10, NFR-02 |
| Least number of network calls | FR-11.6 – FR-11.8, NFR-03 |
| No user accounts or tokens | NFR-05.1 |
| Predictable refresh behavior | FR-11.3 – FR-11.8 |
| Graceful failure handling | FR-11.10 – FR-11.11 |

### 11.5 Development and Verification Traceability

| Artifact | Traceability Method |
|---|---|
| Product backlog items | Referenced by FR and NFR identifiers |
| Source control commits | Commit messages reference FR/NFR IDs |
| Defect tracking | Bugs linked to impacted FR/NFR IDs |
| Testing and validation | Test cases mapped to FR/NFR IDs |
| Acceptance review | Acceptance Criteria mapped to FR/NFR groups |

### 11.6 Change Control Traceability

All changes to Functional or Non-Functional Requirements must:

- Reference impacted FR/NFR identifiers
- Be reviewed by the Product Owner
- Be approved by the Sponsor and Course Instructor when affecting scope or objectives
- Be reflected in updated traceability mappings
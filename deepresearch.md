# Deep Research Feature Implementation Plan

This document outlines the steps required to implement the "Deep Research" feature for creating new webs.

## Phase 1: Core Frontend and Backend Changes

### Frontend (`frontend/`)

- [ ] **Update `NewWebModal.tsx` Component:**

  - [x] Replace the `Textarea` for `name` with an `Input` component.
  - [x] Replace the `Textarea` for `description` with a smaller `Input` or `Textarea` component.
  - [x] Add a `Switch` component for the "Start with deep research" toggle.
  - [ ] When the switch is toggled, display a section for research hyperparameters (initially a placeholder).
  - [x] Update the `onSubmit` handler to pass the new `deepResearch` flag and any hyperparameters to the `useCreateWeb` hook.
  - [x] If deep research is enabled, redirect the user to a new `/queued-webs` page upon submission.

- [ ] **Create Queued Webs Page:**
  - [ ] Create a new page at `frontend/src/pages/queued-webs/index.tsx`.
  - [ ] This page will display a list of webs that are currently undergoing deep research.
  - [ ] It should show the status of each web (e.g., "Researching...", "Processing...", "Complete").
  - [ ] Webs should be fetched from a new backend endpoint.
  - [ ] Once a web is complete, clicking on it should navigate to the web's page (`/web/:id`).

### Backend (`backend/`)

- [ ] **Update `useCreateWeb` Hook:**

  - [x] Modify the `useCreateWeb` hook in `frontend/src/hooks/webs.ts` to accept the `deepResearch` boolean and hyperparameter object.
  - [x] Pass these new parameters in the API call to the backend.

- [ ] **Update Create Web Endpoint:**

  - [ ] Locate the `/webs/create` endpoint handler in the backend (likely in `backend/src/routes/webs/...`).
  - [ ] Update the Pydantic model for the request body to include `deep_research: bool = False` and an optional dictionary for hyperparameters.
  - [ ] In the endpoint logic, if `deep_research` is true, trigger a background task to perform the research.
  - [ ] The web should be created immediately with a `status` field (e.g., `status='processing'`).

- [ ] **Create Endpoint for Queued Webs:**
  - [ ] Create a new endpoint (e.g., `/webs/queued`) that returns all webs for the current user that have a `status` of 'processing' or 'queued'.

## Phase 2: Deep Research Service

- [ ] **Design Research Agent:**

  - [ ] Define a new service or agent responsible for the deep research.
  - [ ] This service will take a query (the web's name/description) and hyperparameters as input.

- [ ] **Integrate with External Search API:**

  - [ ] Choose a deep research/search API (e.g., Tavily, Metaphor, or a custom solution).
  - [ ] Implement the logic to call this API and gather a list of sources (URLs, documents).

- [ ] **Process and Store Sources:**

  - [ ] Once sources are collected, process them to extract relevant information.
  - [ ] Add the collected sources to the newly created web in the database.

- [ ] **Integrate with AutoLinker:**

  - [ ] After adding the sources, trigger the existing `autolinker` service to create connections and build the initial graph.

- [ ] **Update Web Status:**
  - [ ] Once the entire process is complete, update the web's `status` to `completed`.

## Phase 3: Hyperparameter Customization

- [ ] **Frontend UI for Hyperparameters:**

  - [ ] In `NewWebModal.tsx`, replace the placeholder with actual UI components for customizing research hyperparameters. Examples:
    - Number of sources to fetch.
    - Depth of research.
    - Types of sources (e.g., articles, papers, videos).

- [ ] **Backend Handling of Hyperparameters:**
  - [ ] Update the deep research service to accept and use these hyperparameters to modify its behavior.

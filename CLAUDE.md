# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SpyderWeb is a full-stack web application that provides intelligent content processing, web crawling, and AI-powered chat functionality. The system allows users to create "webs" (knowledge bases) by processing various content sources and enables AI-assisted exploration through chat interfaces.

## Development Commands

### Backend (FastAPI - Python)
```bash
# From project root
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.main:app --reload
```

### Frontend (Next.js - TypeScript)
```bash
# From project root
cd frontend
npm install
npm run dev        # Development server
npm run build      # Production build
npm run start      # Production server
npm run lint       # ESLint check
```

### Full Project Setup
```bash
# Quick start both services
make start

# Using Docker
make docker-start

# Stop services
make stop
```

## Architecture Overview

### Backend Structure (Python/FastAPI)
- **Entry Point**: `backend/src/main.py` - FastAPI application with CORS, route registration, and background credit reset tasks
- **Models**: `backend/src/models/` - Pydantic models for users, webs, connections, sources, chats, feeds, etc.
- **Routes**: `backend/src/routes/` - API endpoints organized by feature (auth, webs, sources, chat, etc.)
- **Services**: `backend/src/service/` - Business logic for chunking, embedding, extraction, file processing
- **Database**: MongoDB (primary) + Neo4j (graph relationships) + Pinecone (vector storage)
- **External Integrations**: OpenAI, Stytch (auth), Firecrawl (web crawling), AWS S3, YouTube API

### Frontend Structure (Next.js/TypeScript)
- **Pages Router**: `frontend/src/pages/` - Route-based page components
- **Components**: `frontend/src/components/` - Reusable UI components organized by feature
- **Hooks**: `frontend/src/hooks/` - Custom React hooks for API calls and state management
- **Providers**: `frontend/src/providers/` - Context providers for auth, theming, analytics
- **Store**: `frontend/src/store/` - Zustand state management for popups, sources, theme

### Key Features
- **Web Processing**: Users create "webs" by uploading documents, adding URLs, or connecting data sources
- **Auto-linking Engine**: `backend/src/engine/autolinking_engine/` - Automatically creates connections between content pieces
- **Chat Interface**: AI-powered conversations with access to processed web content
- **Feeds**: RSS-like content aggregation and processing
- **Browser Extension**: `clipper/` - Chrome extension for content capture

## Database Schema
- **MongoDB**: Primary data storage for users, webs, sources, chats, connections
- **Neo4j**: Graph relationships between content pieces for advanced querying
- **Pinecone**: Vector embeddings for semantic search and content similarity

## Authentication
Uses Stytch for authentication with OAuth2 support. Auth state managed through custom providers and hooks.

## Environment Setup
Copy `.env.example` to `.env` in both `backend/` and `frontend/` directories. Required services:
- MongoDB, Neo4j, Pinecone
- OpenAI API, Firecrawl API, YouTube API
- AWS S3, Stytch OAuth

## Testing
Backend tests in `backend/tests/`, Frontend tests in `frontend/tests/`. Use pytest for backend, Jest/Playwright for frontend.

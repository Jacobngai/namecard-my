# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NAMECARD.MY is a React/TypeScript-based smart networking app prototype focused on business card scanning and contact management. The project is currently in the design/prototype phase with no backend implementation yet.

## Architecture

### Current State
- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS with custom components
- **State Management**: Local React state (useState)
- **Data**: Mock/hardcoded data for prototyping
- **Components**: Modular component-based architecture

### Planned Architecture (from documentation)
- **Platform**: React Native + Expo (mobile app)
- **Backend**: Supabase (authentication, database, cloud storage)
- **Database**: Supabase PostgreSQL
- **OCR**: Google Vision API
- **Voice**: OpenAI Whisper
- **Storage**: Supabase Storage for card images

## Code Structure

```
NAMECARD.MY FIGMA FILE/
├── App.tsx                    # Main app component with screen routing
├── components/
│   ├── BottomNavigation.tsx   # Main navigation component
│   ├── CameraScreen.tsx       # Card scanning interface
│   ├── ContactDetail.tsx      # Individual contact view
│   ├── ContactForm.tsx        # Add/edit contact form
│   ├── ContactList.tsx        # Contacts listing with search
│   ├── ProfileScreen.tsx      # User profile settings
│   ├── RemindersScreen.tsx    # Premium feature - follow-up reminders
│   ├── UpgradePrompt.tsx      # Subscription upgrade modal
│   └── ui/
│       ├── utils.ts           # Tailwind utility functions
│       └── use-mobile.ts      # Mobile detection hook
├── styles/
│   └── globals.css            # Global CSS and Tailwind config
└── guidelines/
    └── Guidelines.md          # Design system documentation
```

## Key Features

### Core Functionality (Free Tier)
- Business card OCR scanning
- Contact management (add, edit, delete, search)
- WhatsApp integration for networking
- Excel export functionality

### Premium Features (Pro/Enterprise Tiers)
- Follow-up reminders with smart filtering
- Voice notes with AI transcription
- Advanced analytics and reporting
- Team collaboration features

## Development Commands

**Note**: This is currently a prototype with no build system configured. The following commands are planned for the React Native implementation:

```bash
# Development (planned)
cd NamecardMobile npx expo start          # Start Expo development server
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator

# Testing (from roadmap)
npm test               # Run Jest unit tests
npm run test:e2e       # Run Detox end-to-end tests
npm run test:coverage  # Generate test coverage report

# Code Quality (planned)
npm run lint           # ESLint code checking
npm run typecheck      # TypeScript type checking
npm run format         # Prettier code formatting
```

## Business Model

### Subscription Tiers
- **Free** ($0): Basic OCR and contact management
- **Pro** (RM199/year): + reminders, voice notes, AI features
- **Enterprise** (RM599/year): + analytics, team features, priority support

### Distributor Network
- Global distributor system with commission tracking
- 50% discount codes generate distributor profits
- Automated payout and withdrawal management

## Development Approach

### Testing Strategy (TDD)
- **Unit Tests** (70%): Individual functions and components
- **Integration Tests** (20%): Component interactions and API integrations  
- **End-to-End Tests** (10%): Complete user workflows
- Target: 90%+ test coverage

### Database Schema
Uses Supabase PostgreSQL with 5 main tables:
- `users` (authentication + profile + subscription)
- `contacts` (business cards + networking data)
- `distributors` (partner network)
- `transactions` (all financial records)
- `pricing` (dynamic pricing control)

## Key Implementation Notes

- **Contact State**: All contact data stored in React state (`contacts` array in App.tsx)
- **Screen Navigation**: Simple string-based routing in main App component
- **Premium Features**: Gated behind `isPremiumUser` state flag
- **Mock Data**: Currently uses hardcoded sample contacts for prototyping
- **Component Pattern**: Props-based communication between parent App and child components

## Development Priorities

1. **Phase 1** (Weeks 1-3): Core scanning app
2. **Phase 2** (Weeks 4-5): Contact management
3. **Phase 3** (Week 6): WhatsApp integration
4. **Phase 4** (Week 7): Testing & polish
5. **Phase 5** (Week 8): App store launch
6. **Phase 6** (Weeks 9-11): Premium features
7. **Phase 7** (Weeks 12-14): Distributor system

## Important Considerations

- This is currently a static prototype - no backend integration exists
- Real implementation will require migration to React Native + Expo
- OCR functionality is mocked - needs Google Vision API integration
- Database operations are simulated - needs Supabase implementation
- Payment processing is conceptual - needs Stripe/RevenueCat integration

## Supabase MCP Server Configuration

This project uses the Supabase MCP (Model Context Protocol) server for database interactions with Claude Code.

### MCP Server Setup
The Supabase MCP server is configured in `.claude.json`:

```json
{
  "mcp-servers": {
    "supabase": {
      "command": "npx",
      "args": ["@supabase/mcp-server-supabase"],
      "env": {
        "SUPABASE_URL": "your-project-url",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key"
      }
    }
  }
}
```

### Available MCP Tools
When connected, the following Supabase tools are available:
- Database queries and mutations
- Table operations (create, read, update, delete)
- Authentication management
- Storage operations
- Real-time subscriptions

### Usage in Development
The MCP server provides direct database access during development with Claude Code, enabling:
- Live database schema inspection
- Direct SQL query execution
- Table data manipulation
- User and auth management
- File storage operations

**Note**: Service role key should be kept secure and never committed to version control.
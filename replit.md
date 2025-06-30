# Astora Phone Inspection System

## Overview

The Astora Phone Inspection System is a comprehensive web application designed for a used phone exportation company that purchases, inspects, and resells used phones overseas. The system streamlines the inspection workflow through two distinct stations: Scanning Station for IMEI scanning and defect documentation, and Photographing Station for image capture and upload.

## System Architecture

The application follows a full-stack architecture with a React frontend, Express.js backend, and PostgreSQL database managed through Drizzle ORM. The system is designed with simplicity and maintainability in mind, using modern web technologies while keeping the codebase clean and minimal.

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Styling**: Tailwind CSS with custom Astora branding colors
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication**: Express sessions with bcrypt password hashing
- **File Upload**: Multer for handling multipart form data
- **External Services**: DigitalOcean Spaces for image storage

### Database Schema
- **Users**: Inspector authentication and role management
- **Orders**: Order tracking with number, quantity, and completion status
- **Inspections**: Core inspection data including IMEI, phone specs, defects, images, and workflow status

## Key Components

### Authentication System
- Session-based authentication using express-session
- User roles (inspector, admin) for access control
- Password hashing with bcrypt for security
- Protected routes requiring authentication

### Inspection Workflow
- **Order Creation**: Mandatory order entry before inspections begin
- **Scanning Station**: IMEI lookup, phone specification retrieval, defect documentation, and grading
- **Photographing Station**: Image capture and upload linked to existing inspection data
- **Status Tracking**: Three-stage workflow (scanning → photographed → completed)

### IMEI Lookup Service
- Automated phone specification retrieval based on IMEI numbers
- TAC (Type Allocation Code) mapping for brand and model identification
- Fallback handling for unknown device types

### File Storage Integration
- DigitalOcean Spaces integration for scalable image storage
- Public URL generation for inspection images
- Automatic cleanup of temporary upload files

### Reporting System
- Excel report generation using Python pandas integration
- Order-based reporting with inspection summaries
- Grade distribution analytics and completion tracking

## Data Flow

1. **Authentication**: User signs in → Session established → Access granted to dashboard
2. **Order Management**: Create new order → Select inspection station → Begin workflow
3. **Scanning Process**: Scan IMEI → Lookup specifications → Document defects → Save inspection
4. **Photography Process**: Scan IMEI → Load existing data → Upload images → Complete inspection
5. **Reporting**: Generate Excel reports → Upload to cloud storage → Provide download links

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/react-***: Accessible UI component primitives
- **bcrypt**: Password hashing for secure authentication
- **multer**: File upload handling for images
- **express-session**: Session management for authentication

### Development Dependencies
- **tsx**: TypeScript execution for development server
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-***: Replit-specific development tools

### External Services
- **Neon Database**: Managed PostgreSQL hosting
- **DigitalOcean Spaces**: Object storage for inspection images
- **Python/Pandas**: Excel report generation (external script execution)

## Deployment Strategy

### Development Environment
- Vite development server with hot module replacement
- TSX for TypeScript execution without compilation
- Environment variables for database and service configuration
- Replit-specific plugins for enhanced development experience

### Production Build
- Vite builds optimized frontend bundle to `dist/public`
- ESBuild bundles server code to `dist/index.js`
- Single deployment artifact with static assets and server bundle
- Environment variable configuration for production services

### Database Management
- Drizzle migrations stored in `./migrations` directory
- Schema definitions in shared TypeScript files
- Push-based deployment with `drizzle-kit push` command
- PostgreSQL dialect with connection pooling

## Changelog
- June 30, 2025. Initial setup
- June 30, 2025. Fixed authentication system - test user credentials working (inspector/password)
- June 30, 2025. Fixed Continue Order workflow - Dashboard button now routes to Reports page, removed runtime errors

## User Preferences

Preferred communication style: Simple, everyday language.
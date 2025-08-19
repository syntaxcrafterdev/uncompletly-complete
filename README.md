# Synap Events

A full-stack event management application built with React, Node.js, and TypeScript.

## Project Structure

- `frontend/` - React frontend application
- `backend/` - Node.js backend server
- `shared/` - Shared TypeScript types
- `infra/` - Infrastructure as Code (Terraform, etc.)

## Prerequisites

- Node.js 16.x or higher
- npm 8.x or higher
- TypeScript 4.7+

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd synap-events
   ```

2. Install dependencies for all workspaces:
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install
   
   # Install backend dependencies
   cd ../backend
   npm install
   
   # Install shared dependencies
   cd ../shared
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in both frontend and backend directories
   - Update the environment variables as needed

4. Start the development servers:
   ```bash
   # In one terminal (backend)
   cd backend
   npm run dev
   
   # In another terminal (frontend)
   cd frontend
   npm run dev
   ```

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run linter
- `npm run test` - Run tests

### Backend
- `npm run dev` - Start development server with hot-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run linter

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

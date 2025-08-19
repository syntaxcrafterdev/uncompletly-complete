<div align="center">
  <h1>🎉 Synap Events</h1>
  <p><strong>Your Ultimate Event Management Platform</strong></p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-4.7%2B-blue.svg)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-16.x-339933.svg)](https://nodejs.org/)
  
  <p>✨ A modern, full-stack event management solution for hosting, managing, and attending events with ease.</p>
</div>

## 🚀 Features

- **Event Management** - Create, update, and manage events effortlessly
- **User Authentication** - Secure signup and login system
- **Real-time Updates** - Stay updated with live event notifications
- **Responsive Design** - Works seamlessly on all devices
- **Modern Tech Stack** - Built with the latest technologies

## 🛠 Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for blazing fast development
- TailwindCSS for beautiful UI components
- React Query for data fetching
- React Hook Form for form handling

**Backend:**
- Node.js with Express
- TypeScript for type safety
- MongoDB with Mongoose
- JWT Authentication
- RESTful API design

## 📦 Project Structure

```
synap-events/
├── frontend/         # React frontend application
├── backend/          # Node.js backend server
├── shared/           # Shared TypeScript types
└── infra/            # Infrastructure as Code (Terraform)
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16.x or higher
- npm 8.x or higher
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/synap-events.git
   cd synap-events
   ```

2. **Install dependencies**
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

3. **Configure environment variables**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Frontend
   cp frontend/.env.example frontend/.env
   ```
   
   Update the environment variables in both `.env` files as needed.

4. **Start the development servers**
   ```bash
   # Terminal 1 - Start backend
   cd backend
   npm run dev
   
   # Terminal 2 - Start frontend
   cd frontend
   npm run dev
   ```

5. **Open in browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a pull request.

## 📬 Contact

Have questions? Reach out to us at [your.email@example.com](mailto:your.email@example.com)

---

<div align="center">
  Made with ❤️ by Your Name | 2023
</div>

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

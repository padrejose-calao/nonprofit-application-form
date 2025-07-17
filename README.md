# Nonprofit Application Form - Basic Information

A comprehensive web application for nonprofit organizations to submit grant applications. Features a new Basic Information Form with 6 sections, progressive disclosure, real-time validation, and extensive field management.

## Features

- Multi-section application form with 16,700+ lines of comprehensive fields
- Real-time form validation and error handling
- File upload capabilities for supporting documents
- SQLite database for data persistence
- JWT-based authentication
- Responsive design with Tailwind CSS
- Error tracking with Sentry integration

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: SQLite
- **Authentication**: JWT
- **Build Tools**: Create React App, npm scripts

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd nonprofit-application-form
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with necessary environment variables.

### Development

Run the full application (frontend + backend):
```bash
npm run dev
```

Run frontend only:
```bash
npm start
```

Run backend only:
```bash
npm run server
```

### Building for Production

```bash
npm run build
```

## Project Structure

```
├── src/
│   ├── components/
│   │   └── BasicInformation/        # New comprehensive form component
│   │       ├── BasicInformation.tsx
│   │       ├── types.ts
│   │       ├── constants.ts
│   │       ├── components/
│   │       └── sections/
│   ├── config/
│   │   └── constants.ts
│   ├── utils/
│   │   ├── errorHandler.ts
│   │   ├── formValidation.ts
│   │   └── basicInformationValidation.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── Public/
│   ├── index.html
│   └── _redirects
├── Downloads/
│   ├── server.js                      # Express backend
│   ├── package.json
│   └── various utility scripts
├── tailwind.config.js
├── netlify.toml
└── README.md
```

## Available Scripts

- `npm run dev` - Run full application
- `npm start` - Start frontend development server
- `npm run server` - Start backend server
- `npm run build` - Create production build
- `npm test` - Run tests

## Deployment

The application is configured for deployment on Netlify. The `netlify.toml` file contains the necessary configuration.

## Maintenance

See `CLAUDE.md` for detailed maintenance guidelines, common issues, and fixes.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
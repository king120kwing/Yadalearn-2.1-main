# YadaLearn - Learn Together

A collaborative learning platform connecting students and teachers for personalized education.

## Features

- **Student Dashboard**: Track your courses, assignments, and progress
- **Teacher Dashboard**: Manage classes, students, and schedules
- **Real-time Sessions**: Connect with teachers through video sessions
- **Progress Tracking**: Monitor learning progress with visual charts
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Material Symbols Outlined & Lucide React
- **Authentication**: Clerk
- **Routing**: React Router v6
- **Build Tool**: Vite
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd yadalearn
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key_here
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts (Auth, etc.)
├── data/          # Mock data and constants
├── pages/         # Page components
├── types/         # TypeScript type definitions
└── main.tsx       # Application entry point
```

## Design System

The app uses a custom design system with:
- **Poppins** font family
- Gradient backgrounds (peach, mint, lavender, sky)
- Material Symbols icons
- Rounded corners (3xl, 4xl)
- Soft shadows for depth

## Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

### Deploy to Netlify

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is private and proprietary.

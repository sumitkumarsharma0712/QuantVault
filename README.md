# QuantVault

A modern web application for quantitative finance and investment management built with React, TypeScript, and Vite.

## Features

- **Portfolio Management** - Track and manage your investment portfolio
- **Market Analysis** - Real-time market data and analysis tools
- **Research Tools** - Advanced research capabilities for investment decisions
- **Audit View** - Comprehensive audit trail and transaction history
- **User Authentication** - Secure login and onboarding system
- **Responsive Design** - Works seamlessly on desktop and tablet devices

## Tech Stack

- **Frontend Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Lucide React
- **Animation**: Motion
- **Backend**: Express.js
- **AI Integration**: Google GenAI

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/sumitkumarsharma0712/QuantVault.git
cd QuantVault
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Add your configuration variables to `.env`

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Building

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run clean` - Clean build artifacts
- `npm run lint` - Run TypeScript type checking

## Project Structure

```
src/
├── components/          # React components
│   ├── AuditView.tsx   # Audit history view
│   ├── Header.tsx      # Application header
│   ├── LoginView.tsx   # Login component
│   ├── MarketsView.tsx # Market analysis view
│   ├── OnboardingView.tsx # User onboarding
│   ├── PortfolioView.tsx  # Portfolio management
│   ├── ResearchView.tsx   # Research tools
│   └── Sidebar.tsx     # Navigation sidebar
├── data/               # Mock data and utilities
│   └── mockData.ts     # Sample data
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
├── types.ts            # TypeScript type definitions
└── index.css           # Global styles
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Support

For support, please open an issue on the GitHub repository.

---

Built with ❤️ by the QuantVault team

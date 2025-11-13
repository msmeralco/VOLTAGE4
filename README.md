# GridPulse - Energy Consumption Monitoring Platform

GridPulse is a comprehensive energy monitoring and analytics platform for Meralco, Barangay administrators, and consumers. It provides real-time grid health monitoring, transformer load analytics, weather-based predictive insights, and smart meter data visualization.

## Features

- **Multi-Level Dashboards**: Role-based dashboards for Meralco, Barangay, and Consumer users
- **Interactive Maps**: Visualize transformers and households on interactive maps with real-time grid health indicators
- **Analytics & Insights**: Track consumption trends, grid health metrics, and predictive insights
- **Weather Integration**: Weather-based predictions for energy consumption patterns
- **Smart Meter Visualization**: Detailed consumption tracking for consumers
- **Dark Mode Support**: Full dark mode support with theme switching
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Charts**: Recharts
- **Maps**: Leaflet with React-Leaflet
- **Authentication**: JWT-based authentication
- **Backend**: Next.js API Routes

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Login Credentials

### Meralco Admin
- Email: `meralco@gridpulse.com`
- Password: `meralco123`
- User Type: `Meralco`

### Barangay Admin
- Email: `barangay@gridpulse.com`
- Password: `barangay123`
- User Type: `Barangay`

### Consumer
- Email: `consumer@gridpulse.com`
- Password: `consumer123`
- User Type: `Consumer`

## Project Structure

```
HMeralco/
├── app/
│   ├── api/              # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── login/            # Login page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Landing page
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── dashboard-layout.tsx
│   └── map-view.tsx
├── lib/
│   ├── auth.ts           # Authentication utilities
│   ├── mock-data.ts      # Mock data generators
│   └── utils.ts          # Utility functions
└── middleware.ts         # Route protection
```

## API Endpoints

- `POST /api/login` - User authentication
- `GET /api/grid?city={city}` - Get grid data for a city
- `GET /api/transformers?city={city}&barangay={barangay}` - Get transformers
- `GET /api/weather?city={city}` - Get weather data
- `GET /api/smartmeter?consumerId={id}` - Get smart meter data

## Features by User Type

### Meralco Dashboard
- City selector for viewing different regions
- Interactive map with all transformers and households
- Transformer load monitoring
- Weather-based grid health predictions
- Predictive insights and recommendations
- Comprehensive analytics charts

### Barangay Dashboard
- Barangay-specific grid view
- Transformer monitoring for the barangay
- Grid health indicators
- Predictive insights for local area
- Load distribution analytics

### Consumer Dashboard
- Real-time consumption display
- Daily, weekly, and monthly consumption trends
- Comparison to average household usage
- Detailed consumption statistics
- Interactive charts and visualizations

## Development

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

Create a `.env.local` file for production:

```
JWT_SECRET=your-secret-key-here
```

## Future Enhancements

- Real database integration (MongoDB/PostgreSQL)
- Real-time data updates via WebSockets
- Integration with actual weather APIs
- Advanced machine learning predictions
- Mobile app support
- Export functionality for reports
- Notification system

## License

MIT


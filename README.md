# 🏋️‍♂️ BroncoFit

Revolutionary fitness tracking app that combines personalized workout plans with intelligent weight loss coaching. Our AI coach adapts to your progress, lifestyle, and goals to provide real-time guidance and motivation.

## 🚀 Features

- **AI-Powered Coaching**: Intelligent fitness guidance (future Ollama integration)
- **Progress Tracking**: Comprehensive data storage (future MongoDB integration)
- **Custom Workouts**: Adaptive plans that evolve with your progress
- **RESTful API**: Modern Express.js backend with JSON responses
- **React Frontend**: Modern React + Vite frontend application

## 📋 Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)
- Git

## 🛠️ Quick Setup

### 1. Clone and Navigate
```bash
git clone https://github.com/GPT-Warriors/BroncoFit.git
cd BroncoFit
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the API Server
```bash
npm run server
```

### 4. Test the API
Open your browser or use curl to test these endpoints:

- **Hello endpoint**: http://localhost:3001/api/hello
- **Fitness tip**: http://localhost:3001/api/fitness-tip
- **Status check**: http://localhost:3001/api/status
- **Health check**: http://localhost:3001/health

### 5. Test POST Endpoint (Optional)
```bash
curl -X POST http://localhost:3001/api/coach \
  -H "Content-Type: application/json" \
  -d '{"goal": "Lose 10 pounds"}'
```

### 6. Start Frontend (Optional)
In a new terminal window:
```bash
npm run dev
```
Frontend will be available at http://localhost:3000

### 7. Run Both Together (Optional)
```bash
npm run start:all
```

## 📡 API Endpoints

### GET `/api/hello`
Returns a welcome message from the BroncoFit API.

**Response:**
```json
{
  "message": "Hello from BroncoFit API!",
  "service": "AI Fitness Coaching",
  "status": "active",
  "timestamp": "2025-09-22T10:30:00.000Z"
}
```

### GET `/api/fitness-tip`
Returns a random fitness tip.

**Response:**
```json
{
  "tip": "Stay hydrated during workouts!",
  "category": "fitness",
  "timestamp": "2025-09-22T10:30:00.000Z"
}
```

### GET `/api/status`
Returns the current status of the BroncoFit API service.

**Response:**
```json
{
  "service": "BroncoFit API",
  "version": "1.0.0",
  "status": "healthy",
  "features": ["AI Coaching", "Progress Tracking", "Custom Workouts"],
  "uptime": 3600,
  "timestamp": "2025-09-22T10:30:00.000Z"
}
```

### POST `/api/coach`
Submit a fitness goal to the AI coach (placeholder for future Ollama integration).

**Request Body:**
```json
{
  "goal": "Lose 10 pounds in 3 months"
}
```

**Response:**
```json
{
  "message": "Thanks for sharing your goal: \"Lose 10 pounds in 3 months\"",
  "response": "Your AI coach will analyze this goal and create a personalized plan soon!",
  "nextSteps": ["Connect to MongoDB for data storage", "Integrate Ollama AI service"],
  "timestamp": "2025-09-22T10:30:00.000Z"
}
```

### GET `/health`
Simple health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "service": "BroncoFit API"
}
```

## 🏗️ Project Structure

```
BroncoFit/
├── public/           # Static assets
├── src/              # React frontend source
│   ├── App.jsx       # Main React component
│   ├── App.css       # Styling
│   ├── main.jsx      # React entry point
│   └── index.css     # Global styles
├── server.js         # Express.js API server
├── package.json      # Dependencies and scripts
├── vite.config.js    # Vite configuration
└── README.md         # This file
```

## 📦 Available Scripts

- `npm run dev` - Start the React development server
- `npm run build` - Build the React app for production
- `npm run preview` - Preview the production build
- `npm run server` - Start the Express API server
- `npm run server:dev` - Start the API server with auto-restart
- `npm run start:all` - Run both frontend and backend together
- `npm run lint` - Run ESLint on the source code

## 🔧 Expected Output

When the server starts, you should see:
```
🏋️‍♂️ BroncoFit API server running on http://localhost:3001
📱 Test endpoints:
   GET  http://localhost:3001/api/hello
   GET  http://localhost:3001/api/fitness-tip
   GET  http://localhost:3001/api/status
   POST http://localhost:3001/api/coach
```

## 🚨 Troubleshooting

- **Port 3001 is busy**: The server will automatically use the next available port
- **Permission errors**: Try running `npm install` again or use `sudo` if necessary
- **Node.js version**: Make sure you have Node.js version 14 or higher installed
- **403 Forbidden on port 5000**: This was resolved by changing to port 3001 to avoid macOS AirTunes conflicts

## 🔮 Future Integrations

This project is designed to integrate with:

- **MongoDB**: For user data storage and progress tracking
- **Ollama**: For local AI coaching and workout plan generation
- **Authentication**: User registration and login system
- **Real-time Features**: WebSocket integration for live coaching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 👥 Team

**GPT-Warriors** - CS 4800 Class Project

---

**BroncoFit** - Your AI-Powered Fitness Companion 💪

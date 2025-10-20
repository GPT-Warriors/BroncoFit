[![CI/CD Pipeline](https://github.com/GPT-Warriors/BroncoFit/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/GPT-Warriors/BroncoFit/actions/workflows/ci-cd.yml)
# 🏋️‍♂️ BroncoFit

Revolutionary fitness tracking app that combines personalized workout plans with intelligent weight loss coaching. Track your measurements, visualize your progress, and achieve your fitness goals.

## 🚀 Features

- **User Authentication**: Secure JWT-based authentication system
- **Progress Tracking**: Track weight, body fat percentage, and measurements over time
- **Data Visualization**: Interactive charts showing your fitness journey
- **Profile Management**: Comprehensive user profiles with fitness goals
- **Modern UI**: Responsive React frontend with intuitive navigation
- **RESTful API**: FastAPI backend with automatic API documentation

## 📋 Prerequisites

### Frontend
- Node.js (version 16 or higher)
- npm (comes with Node.js)

### Backend
- Python 3.8 or higher
- pip (Python package manager)

### General
- Git

## 🛠️ Quick Setup

### 1. Clone the Repository
```bash
git clone https://github.com/GPT-Warriors/BroncoFit.git
cd BroncoFit
```

### 2. Backend Setup (FastAPI)

```bash
# Navigate to the API directory
cd api

# Create a virtual environment (optional but recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example if available)
# Add your configuration:
# SECRET_KEY=your-secret-key-here
# DATABASE_URL=your-database-url (if using real database)

# Start the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at:
- **API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

### 3. Frontend Setup (React + Vite)

Open a **new terminal window** in the project root directory:

```bash
# Install frontend dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at: http://localhost:5173

## 🏗️ Project Structure

```
BroncoFit/
├── api/                      # FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI application entry point
│   │   ├── models.py        # Database models
│   │   ├── auth.py          # Authentication logic
│   │   ├── database.py      # Database connection
│   │   ├── config.py        # Configuration settings
│   │   └── routers/         # API route handlers
│   │       ├── auth.py      # Authentication endpoints
│   │       ├── profile.py   # User profile endpoints
│   │       ├── measurements.py  # Measurements endpoints
│   │       └── calculations.py  # Body metrics calculations
│   ├── requirements.txt     # Python dependencies
│   └── README.md
├── src/                     # React frontend
│   ├── components/
│   │   ├── LoginPage.jsx    # Login component
│   │   ├── SignupPage.jsx   # Registration component
│   │   ├── ProfilePage.jsx  # User profile & dashboard
│   │   └── HamburgerMenu.jsx # Navigation menu
│   ├── services/
│   │   └── api.js           # API service layer
│   ├── App.jsx              # Main React component
│   └── main.jsx             # React entry point
├── public/                  # Static assets
├── index.html
├── package.json             # Frontend dependencies
├── vite.config.js           # Vite configuration
└── README.md                # This file
```

## 📦 Available Scripts

### Frontend
- `npm run dev` - Start the React development server
- `npm run build` - Build the React app for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint on the source code

### Backend
- `uvicorn app.main:app --reload` - Start FastAPI with auto-reload
- `uvicorn app.main:app --host 0.0.0.0 --port 8000` - Start with custom host/port

## 🔌 API Endpoints

The backend provides the following main endpoint groups:

- **Authentication** (`/auth`)
  - POST `/auth/register` - Create new user account
  - POST `/auth/login` - User login
  - GET `/auth/me` - Get current user info

- **Profile** (`/profile`)
  - GET `/profile` - Get user profile
  - PUT `/profile` - Update user profile
  - POST `/profile/initialize` - Create initial profile with stats

- **Measurements** (`/measurements`)
  - GET `/measurements` - Get all measurements
  - POST `/measurements` - Add new measurement
  - GET `/measurements/latest` - Get most recent measurement

- **Calculations** (`/calculations`)
  - POST `/calculations/bmi` - Calculate BMI
  - POST `/calculations/bmr` - Calculate BMR
  - POST `/calculations/tdee` - Calculate TDEE

Visit http://localhost:8000/docs for interactive API documentation.

## 🚨 Troubleshooting

### Frontend Issues
- **Port 5173 is busy**: Vite will automatically suggest the next available port
- **Module not found errors**: Run `npm install` to ensure all dependencies are installed
- **Build errors**: Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`

### Backend Issues
- **Port 8000 is busy**: Change the port using `--port` flag (e.g., `--port 8001`)
- **Module import errors**: Ensure virtual environment is activated and dependencies are installed
- **Database connection errors**: Check your `.env` file configuration
- **CORS errors**: Backend is configured to allow localhost:5173, adjust in `app/main.py` if needed

### General Tips
- Make sure both frontend and backend are running simultaneously
- Check that the API URL in `src/services/api.js` matches your backend URL
- Clear browser cache if seeing stale data
- Check browser console and terminal for error messages

## 🔮 Future Enhancements

- **AI-Powered Coaching**: Integration with AI models for personalized fitness advice
- **MongoDB Integration**: Production-ready database for user data
- **Social Features**: Share progress with friends and fitness community
- **Workout Plans**: Custom workout routines based on goals
- **Nutrition Tracking**: Meal planning and calorie tracking
- **Mobile App**: Native iOS and Android applications

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

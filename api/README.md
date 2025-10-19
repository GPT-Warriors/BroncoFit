# BroncoFit API - Phase 1

FastAPI backend for BroncoFit AI Fitness Coach application.

## Features (Phase 1)

✅ **User Authentication**
- User registration with email and password
- JWT-based login/logout
- Secure password hashing with bcrypt

✅ **Profile Management**
- Create, read, update, delete user fitness profiles
- Store age, sex, height, weight, activity level, and fitness goals

✅ **TDEE Calculator**
- Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor equation
- Calculate Total Daily Energy Expenditure (TDEE)
- Macro recommendations (protein, carbs, fats)
- Weight goal calorie recommendations

✅ **Measurement Tracking**
- Log weight measurements over time
- Track body fat percentage (optional)
- View measurement history for progress graphs

## Tech Stack

- **FastAPI** - Modern, fast web framework
- **MongoDB** - NoSQL database with Motor async driver
- **JWT** - Secure authentication tokens
- **Pydantic** - Data validation and settings management
- **bcrypt** - Password hashing

## Installation

### 1. Install Python Dependencies

```bash
cd api
pip install -r requirements.txt
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Edit `.env` and set:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET_KEY` - A long, random secret key

### 3. Install and Start MongoDB

**On Windows (local development):**
```bash
# Download MongoDB Community Server from mongodb.com
# Or use MongoDB Atlas (cloud) - recommended for EC2 deployment
```

**On EC2 (Amazon Linux):**
```bash
# Create MongoDB repo file
sudo tee /etc/yum.repos.d/mongodb-org-7.0.repo <<EOF
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/amazon/2/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-7.0.asc
EOF

# Install MongoDB
sudo yum install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Running the API

### Development (Local)

```bash
cd api
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Access the API:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

### Production (EC2)

Create a systemd service file `/etc/systemd/system/broncofit-api.service`:

```ini
[Unit]
Description=BroncoFit FastAPI Service
After=network.target mongod.service

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/BroncoFit/api
Environment="PATH=/home/ec2-user/venv/bin"
ExecStart=/home/ec2-user/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 4
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable broncofit-api
sudo systemctl start broncofit-api
sudo systemctl status broncofit-api
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns JWT token)
- `GET /api/auth/me` - Get current user info

### Profile Management
- `GET /api/profile` - Get user profile
- `POST /api/profile` - Create profile
- `PUT /api/profile` - Update profile
- `DELETE /api/profile` - Delete profile

### Calculations
- `POST /api/calculations/tdee` - Calculate TDEE (public, no auth)
- `GET /api/calculations/bmi` - Calculate BMI (public)
- `POST /api/calculations/tdee/from-profile` - Calculate TDEE from user profile (auth required)

### Measurements
- `POST /api/measurements` - Log new measurement
- `GET /api/measurements` - Get measurement history
- `GET /api/measurements/latest` - Get most recent measurement
- `DELETE /api/measurements/{id}` - Delete measurement

## Project Structure

```
api/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Settings and configuration
│   ├── database.py          # MongoDB connection
│   ├── models.py            # Pydantic models
│   ├── auth.py              # Authentication utilities
│   ├── dependencies.py      # Dependency injection (get_current_user)
│   ├── calculations.py      # TDEE/BMR calculations
│   └── routers/
│       ├── __init__.py
│       ├── auth.py          # Auth endpoints
│       ├── profile.py       # Profile endpoints
│       ├── calculations.py  # Calculator endpoints
│       └── measurements.py  # Measurement endpoints
├── requirements.txt
├── .env
└── .env.example
```

## Database Collections

### users
```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "password_hash": "hashed_password",
  "name": "John Doe",
  "created_at": "2025-10-18T00:00:00Z"
}
```

### profiles
```json
{
  "_id": "ObjectId",
  "user_id": "user_object_id",
  "age": 25,
  "sex": "male",
  "height_cm": 175,
  "current_weight_kg": 75,
  "target_weight_kg": 70,
  "activity_level": "moderate",
  "fitness_goal": "lose_weight",
  "updated_at": "2025-10-18T00:00:00Z"
}
```

### measurements
```json
{
  "_id": "ObjectId",
  "user_id": "user_object_id",
  "weight_kg": 75.5,
  "body_fat_pct": 18.5,
  "notes": "Morning weight after workout",
  "measurement_date": "2025-10-18T00:00:00Z",
  "created_at": "2025-10-18T00:00:00Z"
}
```

## Testing the API

### Using cURL

**Register a user:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=password123"
```

**Calculate TDEE:**
```bash
curl -X POST http://localhost:8000/api/calculations/tdee \
  -H "Content-Type: application/json" \
  -d '{"age":25,"sex":"male","height_cm":175,"weight_kg":75,"activity_level":"moderate"}'
```

### Using Python requests

See `test_api.py` for examples.

## Next Steps (Future Phases)

- **Phase 2**: Weight progress graphs and analytics
- **Phase 3**: Gemini AI integration for fitness insights
- **Phase 4**: AI-powered progress analysis
- **Phase 5**: Workout and nutrition logging

## Security Notes

- Change `JWT_SECRET_KEY` in production to a strong random string
- Use HTTPS in production (handled by Nginx + Certbot)
- Consider using MongoDB Atlas for managed database
- Implement rate limiting for production
- Add password strength requirements
- Consider adding email verification

## License

MIT


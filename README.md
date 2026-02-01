# Finance Tracker

A modern financial tracking web application with a luxury trading-app aesthetic, focused on expense tracking, savings encouragement, and clean data visualization.

## Tech Stack

### Backend
- **.NET 8** - ASP.NET Core Web API
- **MongoDB** - NoSQL database
- **JWT Authentication** - Secure token-based auth
- **BCrypt** - Password hashing

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Recharts** - Beautiful charts
- **Lucide Icons** - Modern icon library

## Features

- 📊 **Dashboard** - Overview with spending trends, category breakdown, and budget progress
- 💰 **Expense Tracking** - Full CRUD operations with categories and notes
- 🎯 **Budget Management** - Set monthly budgets with progress tracking
- 👥 **User Management** - Admin panel for managing users
- 🏷️ **Category Management** - Custom expense categories with colors and icons
- 🌙 **Dark Mode** - Premium dark theme by default
- 📱 **Responsive Design** - Works on desktop and mobile

## Project Structure

```
finance-tracker/
├── backend/
│   └── FinanceTracker.API/
│       ├── Controllers/      # API endpoints
│       ├── Services/         # Business logic
│       ├── Repositories/     # Data access
│       ├── Models/           # Domain models
│       ├── DTOs/             # Data transfer objects
│       └── Data/             # Database context & seeding
│
└── frontend/
    ├── app/                  # Next.js App Router pages
    │   ├── (dashboard)/      # Protected dashboard routes
    │   └── login/            # Auth pages
    ├── components/           # React components
    │   ├── charts/           # Chart components
    │   ├── dashboard/        # Dashboard widgets
    │   ├── expenses/         # Expense components
    │   └── layout/           # Layout components
    ├── hooks/                # React hooks
    ├── services/             # API service
    └── types/                # TypeScript types
```

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend/FinanceTracker.API
   ```

2. Update `appsettings.json` with your MongoDB connection string

3. Run the API:
   ```bash
   dotnet run
   ```

The API will start on `http://localhost:5000` with Swagger UI at `/swagger`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`.

## Default Users

The database seeder creates these test users:

| Email | Password | Role |
|-------|----------|------|
| admin@financetracker.com | Admin@123 | Admin |
| johndoe@example.com | User@123 | User |

## API Endpoints

### Auth
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Expenses
- `GET /api/expenses` - List expenses (with pagination/filters)
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/{id}` - Update category (Admin)
- `DELETE /api/categories/{id}` - Delete category (Admin)

### Budgets
- `GET /api/budgets/current` - Get current month budget
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create/update budget

### Dashboard
- `GET /api/dashboard` - User dashboard summary
- `GET /api/dashboard/admin` - Admin dashboard

### Users (Admin only)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

## Design Philosophy

The app follows a **luxury trading-app aesthetic**:
- Premium dark theme with subtle gradients
- Glassmorphism cards with backdrop blur
- Smooth micro-interactions with Framer Motion
- Clean typography with the Inter font family
- Motivational messaging for budget tracking
- Mobile-first responsive design

## 🌐 Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Set root directory to `frontend`
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = Your deployed backend URL (e.g., `https://your-api.azurewebsites.net`)
5. Deploy!

### Backend (.NET 8)

Since Vercel doesn't support .NET, deploy your backend to one of these platforms:

**Option 1: Azure App Service (Recommended)**
```bash
# Install Azure CLI, then:
az webapp up --name your-api-name --resource-group your-rg --runtime "DOTNET|8.0"
```

**Option 2: Railway**
1. Create a new project on [Railway](https://railway.app)
2. Connect your GitHub repo
3. Set root directory to `backend/FinanceTracker.API`
4. Add environment variables for MongoDB and JWT

**Option 3: Render**
1. Create a new Web Service on [Render](https://render.com)
2. Connect your repo, set root to `backend/FinanceTracker.API`
3. Build command: `dotnet publish -c Release -o out`
4. Start command: `dotnet out/FinanceTracker.API.dll`

### Environment Variables (Backend)

| Variable | Description |
|----------|-------------|
| `MongoDB__ConnectionString` | MongoDB Atlas connection string |
| `MongoDB__DatabaseName` | Database name (e.g., `financetracker`) |
| `Jwt__Secret` | JWT signing key (min 32 chars) |
| `Jwt__Issuer` | API issuer URL |
| `Jwt__Audience` | Frontend URL |

## License

MIT

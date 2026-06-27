# OmniNova

A modern React admin dashboard application built with Vite, featuring JWT authentication and comprehensive user management capabilities.

## Features

- **Modern React with Vite**: Fast development and build times with React 19
- **JWT Authentication**: Secure login with automatic token refresh and storage
- **Admin Dashboard**: Complete admin profile management with password changes
- **User Management**: Full CRUD operations for user accounts
- **Company Management**: Company profile and settings management
- **Protected Routes**: Route-based authentication with automatic redirects
- **Responsive Design**: Mobile-friendly UI components
- **API Integration**: RESTful API consumption with error handling

## Project Structure

```
src/
├── components/              # React components
│   ├── Login.jsx           # Authentication login form
│   ├── AdminProfile.jsx    # Admin profile management
│   ├── Users.jsx           # User management interface
│   ├── Company.jsx         # Company settings management
│   ├── Navbar.jsx          # Navigation component
│   └── ProtectedRoute.jsx  # Route protection wrapper
├── utils/                  # Utility functions
│   └── auth.js            # Authentication & token management
├── config/                # Configuration files
│   └── api.js            # API endpoints configuration
├── App.jsx               # Main app component with routing
└── main.jsx              # Application entry point
```

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure API endpoints:**
   Edit `src/config/api.js` to set your API base URL:

   ```javascript
   BASE_URL: "https://your-api-domain.com";
   ```

3. **Start development server:**

   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Available Routes

- `/` - Login page
- `/admin-profile` - Admin dashboard and profile management
- `/users` - User management interface
- `/company` - Company settings and management
- `/dashboard` - Redirects to `/admin-profile` (legacy support)

## API Integration

### Authentication Endpoints

**Login**: `POST /api/login`
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Token Refresh**: `POST /api/refresh`
```json
{
  "refresh_token": "refresh_token_here"
}
```

### User Management Endpoints

- `GET /api/users` - Fetch all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Admin Endpoints

- `GET /api/admin/profile` - Get admin profile
- `PUT /api/admin/profile` - Update admin profile
- `POST /api/admin/change-password` - Change admin password

### Authentication Features

- JWT tokens with automatic refresh
- Secure token storage in localStorage
- Automatic logout on token expiration
- Protected route authentication
- Request interceptors for API calls

## Customization

### Styling

- CSS files are organized by component
- Modern design with CSS Grid and Flexbox
- Responsive breakpoints for mobile devices

### Adding New Components

1. Create component file in `src/components/`
2. Create corresponding CSS file
3. Import and use in `App.jsx` or other components

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=https://your-api-domain.com
```

## Development

### Scripts Available

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint for code quality
npm run preview  # Preview production build
```

### Development Features

- **Hot Module Replacement**: Enabled for fast development
- **ESLint**: Code quality and consistency checks
- **Vite**: Modern build tool with excellent performance
- **React Router**: Client-side routing with protected routes
- **Modern React**: Using React 19 with latest features

### Tech Stack

- **Frontend**: React 19, React Router DOM 7.8
- **Build Tool**: Vite 7.1
- **Linting**: ESLint 9.33
- **Authentication**: JWT with refresh tokens
- **Styling**: CSS modules with responsive design

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is open source and available under the MIT License.

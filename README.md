# 🛒 Shopr — E-Commerce Web App

A full-stack e-commerce application built with **React**, **Node.js**, **Express**, and **MongoDB**.

🔗 **Live Demo**: [shopr-first.vercel.app](https://shopr-first.vercel.app)

---

## ✨ Features

### 🛍️ Shopping
- Browse products with search, category filters, and sorting
- Product detail pages with image, description, price, and reviews
- User ratings and reviews with edit/delete support
- Wishlist to save favorite products
- Shopping cart with quantity controls (guest + logged-in)
- Guest cart merges into your account on login

### 🔐 Authentication
- Email/password registration and login
- Google OAuth sign-in
- **JWT-based** auth with httpOnly cookies (tamper-proof)
- Forgot password via **email OTP** (6-digit code, 10-min expiry)
- Role-based access (user / admin)

### 👤 User
- Account settings (edit profile, change password)
- Complete profile flow for Google sign-in users
- Notification bell with in-app notifications

### 🛡️ Admin
- Admin dashboard to manage users
- Promote/demote user roles
- Delete users

### 📄 Other
- About, Contact, Privacy Policy, Terms of Service pages
- Dark mode support
- Responsive design (mobile + desktop)
- Skeleton loading states
- Toast notifications (success, error, info)

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, React Router, Tailwind CSS |
| **UI Components** | shadcn/ui (Radix UI primitives) |
| **Icons** | Lucide React |
| **Auth (frontend)** | js-cookie, @react-oauth/google |
| **Backend** | Node.js, Express |
| **Database** | MongoDB Atlas, Mongoose |
| **Auth (backend)** | JWT (jsonwebtoken), bcryptjs |
| **Email** | Nodemailer (Gmail) |
| **Deployment** | Vercel (frontend), Render (backend) |

---

## 📂 Project Structure

```
shopr/
├── src/                    # Frontend (React + Vite)
│   ├── comps/              # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Cards.jsx
│   │   ├── Cart.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Footer.jsx
│   │   └── ...
│   ├── pages/              # Page-level components
│   │   ├── Home.jsx
│   │   ├── ProductPage.jsx
│   │   ├── AccountSettings.jsx
│   │   ├── AdminUsers.jsx
│   │   ├── Wishlist.jsx
│   │   ├── ForgotPassword.jsx
│   │   └── ...
│   ├── lib/                # Utility modules
│   │   ├── cookieUtils.js      # Auth cookie helpers
│   │   ├── cartService.js      # Cart operations (guest + logged-in)
│   │   ├── wishlistService.js  # Wishlist operations
│   │   └── notificationService.js
│   ├── components/ui/      # shadcn/ui components
│   ├── App.jsx             # Route definitions
│   └── main.jsx            # Entry point
│
├── server/                 # Backend (Node.js + Express)
│   ├── server.js           # API routes + middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   └── Notification.js
│   ├── seed.js             # Database seed script
│   ├── .env                # Environment variables
│   └── package.json
│
├── vercel.json             # Vercel deployment config
└── package.json            # Frontend dependencies
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Gmail account with App Password (for OTP emails)

### 1. Clone the repo
```bash
git clone https://github.com/Salman5646/react-shadcn.git
cd react-shadcn
```

### 2. Setup Backend
```bash
cd server
npm install
```

Create `server/.env`:
```env
MONGO_URI=your-mongodb-connection-string
PORT=5000
JWT_SECRET=your-jwt-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
```

Start the server:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd ..
npm install
```

Create `.env` in the root:
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

Start the dev server:
```bash
npm run dev
```

### 4. Seed the Database (optional)
```bash
cd server
npm run seed
```

---

## 🔑 API Endpoints

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| POST | `/api/products/:id/reviews` | Add/update review (auth) |
| DELETE | `/api/products/:id/reviews` | Delete review (auth) |

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/register` | Register new user |
| POST | `/api/login` | Login |
| POST | `/api/google-auth` | Google OAuth login |
| GET | `/api/me` | Verify JWT session |
| POST | `/api/logout` | Logout |
| PUT | `/api/update-profile` | Update profile |

### Password Reset
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/forgot-password` | Send OTP to email |
| POST | `/api/verify-otp` | Verify OTP |
| POST | `/api/reset-password` | Reset password |

### Cart (auth required)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/cart` | Get cart |
| POST | `/api/cart` | Add to cart |
| POST | `/api/cart/merge` | Merge guest cart |
| PUT | `/api/cart/:productId` | Update quantity |
| DELETE | `/api/cart/:productId` | Remove item |
| DELETE | `/api/cart` | Clear cart |

### Admin (admin only)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/users` | Get all users |
| DELETE | `/api/admin/users/:id` | Delete user |
| PUT | `/api/admin/users/:id/role` | Update user role |

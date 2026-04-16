# Inventory Management & POS Web App

A production-ready inventory management and point-of-sale system built with Next.js 14+, featuring cloud-based image storage via Cloudinary, real-time stock management, and multi-role authentication.

## Features

- **Point of Sale (POS)**
  - Three ways to add products: barcode scanning, search, or product grid
  - Cart management with discounts and multiple payment modes
  - Cash handling with change calculation
  - Hold and recall cart functionality

- **Inventory Management**
  - Product CRUD with image upload (Cloudinary or URL)
  - Category-based filtering
  - Low stock alerts
  - Bulk CSV import/export

- **Reporting & Analytics**
  - Dashboard with KPIs
  - Sales trends and profit tracking
  - Top products analysis
  - Export to CSV

- **Authentication & Roles**
  - JWT-based authentication
  - Admin and Cashier roles
  - Protected routes and API endpoints

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: MongoDB Atlas with Mongoose
- **Styling**: Tailwind CSS + shadcn/ui
- **Auth**: JWT in httpOnly cookies + bcrypt
- **Image Upload**: Cloudinary (with URL fallback)
- **Barcode Scanning**: html5-qrcode

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- (Optional) Cloudinary account for image uploads

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Cloudinary (Optional - leave empty to disable uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Seed the database (creates admin user and sample data)
# Run once after starting the server
npm run seed
```

### Default Admin Credentials

After seeding:
- **Email**: admin@example.com
- **Password**: admin123

## Project Structure

```
app/
├── (auth)/login/          # Login page
├── (dashboard)/           # Protected dashboard routes
│   ├── layout.tsx         # Dashboard layout with sidebar
│   ├── page.tsx          # Dashboard home
│   ├── inventory/        # Inventory management
│   ├── pos/              # Point of Sale
│   ├── sales/            # Sales history
│   └── reports/          # Reports & analytics
├── api/                  # API routes
│   ├── auth/             # Authentication endpoints
│   ├── products/         # Product CRUD
│   ├── sales/            # Sales operations
│   ├── stock/            # Stock adjustments
│   └── dashboard/        # Dashboard stats
├── components/           # React components
│   ├── ui/               # shadcn/ui components
│   ├── pos/              # POS-specific components
│   ├── inventory/        # Inventory components
│   └── layout/           # Layout components
├── lib/                  # Utilities and configs
│   ├── models/           # Mongoose models
│   ├── auth.ts           # Authentication helpers
│   ├── db.ts             # Database connection
│   └── cloudinary.ts     # Cloudinary config
└── middleware.ts         # Route protection
```

## Cloudinary Setup (Optional)

1. Create a Cloudinary account at https://cloudinary.com
2. Go to Dashboard → Settings → Upload
3. Create an unsigned upload preset
4. Copy your cloud name and upload preset to `.env.local`

If Cloudinary is not configured, the app will fall back to manual URL input for product images.

## Deployment

This app is optimized for Vercel deployment:

1. Push to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## API Endpoints

### Authentication
- `POST /api/auth` - Login or register
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products (with search/filter)
- `POST /api/products` - Create product (admin only)
- `GET /api/products/[id]` - Get single product
- `PUT /api/products/[id]` - Update product (admin only)
- `DELETE /api/products/[id]` - Delete product (admin only)

### Sales
- `GET /api/sales` - List sales (paginated)
- `POST /api/sales` - Create sale (processes transaction)

### Dashboard
- `GET /api/dashboard` - Dashboard statistics

### Stock
- `POST /api/stock/adjust` - Adjust stock level (admin only)

## License

MIT

# Inventory Management & POS Web App Specification

## 1. Project Overview
A production-ready inventory management and point-of-sale system built with Next.js 14+ App Router, featuring cloud-based image storage via Cloudinary, real-time stock management, and multi-role authentication.

## 2. Tech Stack
- **Framework**: Next.js 14+ with App Router
- **Database**: MongoDB Atlas with Mongoose ODM
- **Styling**: Tailwind CSS + shadcn/ui components
- **Auth**: JWT in httpOnly cookies with bcrypt password hashing
- **Image Upload**: Cloudinary upload widget with manual URL fallback
- **Barcode Scanning**: html5-qrcode library
- **State Management**: React Context + SWR for data fetching
- **Validation**: Zod schemas

## 3. Environment Variables
```
MONGODB_URI=<MongoDB connection string>
JWT_SECRET=<secret for JWT signing>
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<cloud name>
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=<upload preset>
CLOUDINARY_API_KEY=<api key>
CLOUDINARY_API_SECRET=<api secret>
```

## 4. Database Schemas

### User
- email: string (unique)
- password: string (bcrypt hashed)
- name: string
- role: 'admin' | 'cashier'
- createdAt: Date

### Product
- name: string
- SKU: string (unique)
- barcode: string (optional, unique)
- category: string
- costPrice: number
- sellingPrice: number
- stockQuantity: number
- lowStockThreshold: number
- imageUrl: string (Cloudinary URL or external)
- createdAt: Date
- updatedAt: Date

### Sale
- invoiceNumber: string (unique)
- items: Array<{productId, name, quantity, unitPrice, subtotal}>
- subtotal: number
- tax: number
- total: number
- discount: number
- paymentMode: 'cash' | 'card' | 'mobile_money' | 'other'
- amountReceived: number
- change: number
- createdBy: ObjectId (ref User)
- createdAt: Date

## 5. Authentication & Authorization
- Login via email/password returns JWT in httpOnly cookie
- Middleware protects /dashboard/** and /api/** routes
- Role-based access:
  - **Admin**: Full CRUD on products, view sales/reports, manage users
  - **Cashier**: Use POS, view products only

## 6. POS Functionality

### Three Ways to Add Products to Cart
1. **Barcode/QR Scanner**: Opens camera modal, decodes barcode, looks up product by barcode field
2. **Manual Search**: Autocomplete search by name, SKU, or barcode
3. **Product Grid**: Filterable catalog with category tabs, click to add with quantity picker

### Cart Features
- Item list with quantity edit/remove
- Item-level and cart-level discount
- Tax calculation (configurable rate, default 0%)
- Subtotal, tax, total display
- Payment mode selection (cash/card/mobile money/other)
- Cash payment: amount received + change calculation
- Hold cart / Recall cart (localStorage persistence)

## 7. Inventory Management
- Product CRUD with image upload options
- Cloudinary upload widget OR manual URL input
- Bulk CSV import/export
- Low stock alerts on dashboard
- Stock adjustments with reason tracking

## 8. Reporting
- Dashboard KPIs: daily sales, low stock count, chart (7 days), top products
- Profit calculation: (sellingPrice - costPrice) * quantity
- Sales history with filters

## 9. Design System
- Primary: Indigo (#6366f1)
- Secondary: Slate (#64748b)
- Success: Emerald (#10b981)
- Warning: Amber (#f59e0b)
- Destructive: Rose (#f43f5e)
- Background: Zinc (#fafafa)
- Dark mode support via shadcn/ui

## 10. Project Structure
```
app/
├── (auth)/login/
├── (dashboard)/
│   ├── layout.tsx
│   ├── page.tsx (dashboard)
│   ├── inventory/
│   ├── pos/
│   ├── sales/
│   └── reports/
├── api/
├── components/
├── lib/
└── middleware.ts
```

## 11. Seed Data
- Admin: admin@example.com / admin123
- 8-10 sample products with placeholder images
- Sample sale record

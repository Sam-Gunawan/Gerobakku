# Gerobakku — Digital Discovery Platform for Indonesian Street Food Vendors

**Gerobakku** is a web-based discovery platform designed to bridge the gap between Indonesia's vibrant street food culture and modern consumers. By providing real-time vendor location tracking, menu browsing, and community-driven reviews, Gerobakku empowers street food vendors (*Pedagang Kaki Lima* or PKL) to expand their reach while enabling customers to discover authentic local cuisine with ease.

Built as a Software Engineering academic project, Gerobakku demonstrates full-stack web development principles using **Angular** for the frontend, **FastAPI** (Python) for the backend, and **PostgreSQL** with PostGIS for geospatial data management.

---

## Problem Statement

Indonesia's street food vendors (*Pedagang Kaki Lima*) are a cornerstone of the nation's culinary identity and local economy. However, these vendors face significant challenges in reaching potential customers:

- **Limited Visibility**: Most PKL operate without a digital presence, relying solely on foot traffic and word-of-mouth.
- **Unpredictable Mobility**: Many vendors move locations frequently, making it difficult for customers to find them consistently.
- **No Centralized Discovery Tool**: Customers lack a unified platform to browse menus, read reviews, or track vendor locations in real-time.

These barriers prevent PKL from fully capitalizing on their market potential, while customers miss out on discovering exceptional local food experiences.

---

## Our Solution

Gerobakku addresses these challenges by providing a **centralized, map-based platform** that connects street food vendors with customers through:

1. **Real-Time Location Tracking**: Vendors can update their current location, and customers can view nearby vendors on an interactive map powered by OpenStreetMap.
2. **Digital Menu Browsing**: Each vendor maintains a customizable menu with item names, descriptions, prices, and availability status.
3. **Community Reviews & Ratings**: Customers can leave reviews and ratings, helping vendors build credibility and attract more customers.
4. **Vendor Registration & Management**: Vendors can register their stores, manage operating hours, upload images, and toggle halal certification status.
5. **User Authentication & Profiles**: Secure login system with JWT-based authentication for both customers and vendors.

By digitizing vendor information and enabling location-based discovery, Gerobakku empowers PKL to increase their customer base while preserving the authenticity and spontaneity of Indonesia's street food culture.

---

## Key Features

### For Customers
- **Interactive Map Dashboard**: Browse nearby street food vendors with real-time location updates.
- **Vendor Discovery**: Filter vendors by category, view operating hours, and check halal certification.
- **Menu Browsing**: Explore vendor menus with item descriptions, prices, and availability.
- **Review System**: Submit ratings and comments to help others discover quality vendors.
- **User Profile Management**: Maintain account details and view review history.

### For Vendors
- **Vendor Dashboard**: Centralized hub for managing store information and business operations.
- **Location Updates**: Manually update current location or enable simulation for demonstration purposes.
- **Menu Management**: Add, edit, or remove menu items; toggle item availability in real-time. (Coming soon!)
- **Operating Hours Control**: Set standard hours and manually open/close the store as needed.
- **Store Customization**: Upload store images, update descriptions, and manage halal certification status. (In development)

### Core System Features
- **JWT-Based Authentication**: Secure token-based authentication with protected routes.
- **Role-Based Access Control**: Separate permissions for customers and vendors.
- **Geospatial Queries**: PostGIS-powered location tracking and proximity search.
- **RESTful API Architecture**: Clean API design following FastAPI best practices.
- **Docker Deployment**: Containerized application for consistent cross-platform deployment.

---

## Technology Stack

### Frontend
- **Angular 19**: Modern TypeScript-based SPA framework.
- **OpenLayers**: Open-source mapping library for interactive geospatial visualization.
- **SCSS**: Component-scoped styling with global design tokens.
- **Reactive Forms**: Form validation and state management.

### Backend
- **FastAPI**: High-performance Python web framework with automatic OpenAPI documentation.
- **psycopg3**: Modern PostgreSQL adapter with connection pooling.
- **Pydantic**: Data validation and serialization using Python type hints.
- **JWT Authentication**: Token-based security with bcrypt password hashing.

### Database & Infrastructure
- **PostgreSQL 16**: Robust relational database with ACID compliance.
- **PostGIS Extension**: Geospatial indexing and queries for location-based features.
- **Docker Compose**: Multi-container orchestration for backend, frontend, and database.
- **nginx**: Production-ready web server for serving Angular build.

---

## Project Structure

```
Gerobakku/
├── backend/                    # FastAPI backend application
│   ├── app/
│   │   ├── routers/           # API route handlers
│   │   ├── services/          # Business logic layer
│   │   ├── repositories/      # Database access layer
│   │   ├── schemas/           # Pydantic request/response models
│   │   ├── database.py        # PostgreSQL connection pool
│   │   ├── security.py        # JWT authentication logic
│   │   └── main.py           # FastAPI application entry point
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/                   # Angular frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/         # Page components (home, login, vendor dashboard)
│   │   │   ├── shared/        # Reusable components (map, modals, forms)
│   │   │   ├── services/      # HTTP services for API calls
│   │   │   └── auth/          # Authentication guards & interceptors
│   │   └── styles/            # Global SCSS styles
│   ├── Dockerfile
│   ├── nginx.conf            # nginx configuration for production
│   └── package.json
│
├── docker-compose.yml         # Service orchestration configuration
├── .env.example              # Environment variable template
├── DOCKER_SETUP.md           # Detailed Docker deployment guide
└── README.md                 # This file
```

---

## Team

| Name | Role |
|------|------|
| **Samuel Theodore Gunawan** | Project Manager & QA Engineer |
| Jorel Alexander Setiabudi | Backend Developer |
| Revananda Aimandzaky | Backend Developer |
| Evan Aditya Chandra | Database Engineer & Backend Developer |
| Rainer Dylan Elias | UI/UX Developer & Frontend Engineer |
| Emilia Loho | UI/UX Designer & Frontend Engineer |
| Calvin Willyanto | Full-Stack Developer |

---

## Getting Started

### Prerequisites
- Docker Desktop (recommended)
- OR: Node.js 24+, Python 3.13+, PostgreSQL 16+ (for local development)

### Quick Start with Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sam-Gunawan/Gerobakku
   cd Gerobakku
   ```

2. **Set up environment variables**
   ```bash
   # Windows (PowerShell)
   Copy-Item .env.example .env

   # macOS/Linux
   cp .env.example .env
   ```

3. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: [http://localhost:4200](http://localhost:4200)
   - Backend API: [http://localhost:8000](http://localhost:8000)

For detailed deployment instructions, troubleshooting, and production deployment notes, see [DOCKER_SETUP.md](./DOCKER_SETUP.md).

---

## Local Development (Without Docker)

### Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt

# Configure database connection in .env
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=your_user
# DB_PASS=your_password
# DB_DATABASE=gerobakku_db

uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Access the development server at [http://localhost:4200](http://localhost:4200).

---

### Core API Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/auth/register` | POST | Register new user account | No |
| `/auth/login` | POST | User login (returns JWT) | No |
| `/stores` | GET | Fetch all stores with locations | No |
| `/stores/{id}` | GET | Get store details with menu | No |
| `/stores` | POST | Create new store | Yes (Vendor) |
| `/stores/{id}/reviews` | GET | Get store reviews | No |
| `/stores/{id}/reviews` | POST | Submit review | Yes (Customer) |
| `/vendors/application` | POST | Apply for vendor account | Yes |

---

## Database Schema

The PostgreSQL database uses the following core entities:

- **users**: Authentication and user profiles
- **customers**: Customer-specific data (extends users)
- **vendors**: Vendor-specific data (extends users)
- **stores**: Vendor store information
- **menu_items**: Store menu with pricing
- **transactional_store_location**: Geospatial location history
- **transactional_reviews**: Customer reviews and ratings
- **master_categories**: Store category taxonomy

PostGIS is utilized for efficient geospatial queries such as proximity search and real-time location tracking.

---

## Known Limitations

This project is a software engineering academic prototype and has the following limitations:

1. **Not Production-Ready**
   - No comprehensive error handling for edge cases
   - Limited input validation and sanitization
   - No rate limiting or DDoS protection
   - Missing backup and disaster recovery mechanisms

2. **Browsing-Only Platform**
   - Does not support in-app ordering or payment processing
   - No real-time order management or fulfillment
   - Not a food delivery service—focuses solely on discovery

3. **Location Tracking**
   - Relies on manual location updates by vendors
   - No automatic GPS tracking integration
   - Location simulation feature for demonstration purposes only

4. **Scalability Considerations**
   - Single-instance database without replication
   - No CDN for static asset delivery
   - Limited concurrent user testing

5. **Feature Scope**
   - Favorites and wishlist features defined in schema but not fully implemented in UI
   - Messaging system planned but not integrated
   - No analytics or business intelligence dashboard for vendors

6. **Security**
   - Basic JWT authentication without refresh token rotation
   - No two-factor authentication (2FA)
   - Limited logging and audit trails

Despite these limitations, Gerobakku effectively demonstrates core full-stack development competencies and serves as a proof-of-concept for digitizing street food vendor discovery in Indonesia.

---

## Future Enhancements

Potential improvements for production readiness:

- **Mobile Application**: Native iOS/Android apps for better on-the-go experience.
- **Real-Time GPS Integration**: Automatic vendor location updates via mobile GPS.
- **Advanced Search & Filtering**: Search by cuisine type, price range, and dietary preferences.
- **In-App Ordering**: Enable customers to place pre-orders for pickup.
- **Payment Integration**: Support digital payments and vendor payouts.
- **Vendor Analytics Dashboard**: Business insights, customer demographics, and revenue tracking.
- **Push Notifications**: Alert customers when favorite vendors are nearby.
- **Social Features**: User profiles, follower system, and social sharing.

---

## Acknowledgments

We extend our gratitude to:

- Our university supervisor for guidance throughout the project development.
- The OpenStreetMap and OpenLayers communities for excellent mapping tools.
- All open-source contributors whose libraries made this project possible.

---

## License

This project is developed for academic purposes as part of a Software Engineering coursework. All rights reserved to the contributors.

---

**Gerobakku** — Cari. Cek. Cuss
# Harishma Sarees Zone - Complete eCommerce Application

A full-stack eCommerce web application for selling sarees and accessories, built with Spring Boot (Java) backend and React frontend.

## 🚀 Features

### User Features
- **Homepage** with featured products and banners
- **Product Listing** with filters (category, price, color, fabric)
- **Product Details** with images, description, and reviews
- **Shopping Cart** and **Wishlist** functionality
- **User Authentication** (Login/Signup)
- **Checkout** with Razorpay payment integration
- **Order Tracking** and history
- **User Profile** management
- **Product Reviews** and ratings

### Admin Features
- **Admin Dashboard** with sales analytics
- **Product Management** (CRUD operations)
- **Order Management** (status updates)
- **User Management**
- **Banner Management** for homepage
- **Coupon Management** for discounts

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React + Tailwind CSS |
| **Backend** | Spring Boot (Java) |
| **Database** | MySQL |
| **Authentication** | Spring Security + JWT |
| **Payment** | Razorpay |
| **Storage** | Local File System |

## 📁 Project Structure

```
harishma-sarees-zone/
├── src/main/java/com/hsz/          # Spring Boot Backend
│   ├── controller/                 # REST API Controllers
│   ├── model/                      # JPA Entities
│   ├── repository/                 # Data Access Layer
│   ├── config/                     # Security & JWT Configuration
│   ├── dto/                        # Data Transfer Objects
│   └── HarishmaSareesZoneApplication.java
├── src/main/resources/
│   ├── application.properties      # Database & App Configuration
│   └── static/uploads/             # Image Storage
├── frontend/                       # React Frontend
│   ├── src/
│   │   ├── components/             # Reusable Components
│   │   ├── pages/                  # Page Components
│   │   ├── context/                # React Context (Auth, Cart)
│   │   ├── App.js                  # Main App Component
│   │   └── index.js                # Entry Point
│   ├── public/
│   └── package.json
├── database/
│   └── init.sql                    # Database Initialization Script
└── pom.xml                         # Maven Dependencies
```

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 16+
- MySQL 8.0+
- Maven 3.6+

### 1. Database Setup
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE harishma_sarees_zone;

# Run initialization script
mysql -u root -p harishma_sarees_zone < database/init.sql
```

### 2. Backend Setup
```bash
# Navigate to project root
cd "Harishma Sarees Zone"

# Update database credentials in src/main/resources/application.properties
# spring.datasource.username=your_username
# spring.datasource.password=your_password

# Create uploads directory
mkdir -p src/main/resources/static/uploads/products
mkdir -p src/main/resources/static/uploads/banners

# Run Spring Boot application
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start React development server
npm start
```

The frontend will start on `http://localhost:3000`

## 🔐 Default Credentials

### Admin Account
- **Email:** admin@harishmasarees.com
- **Password:** admin123

### Test User Account
- **Email:** user@example.com
- **Password:** user123

## 📊 Database Schema

### Core Tables
- **users** - User accounts and profiles
- **products** - Product catalog
- **orders** - Customer orders
- **order_items** - Order line items
- **cart** - Shopping cart items
- **wishlist** - User wishlists
- **reviews** - Product reviews
- **banners** - Homepage banners
- **coupons** - Discount coupons

## 🔧 Configuration

### Backend Configuration (`application.properties`)
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/harishma_sarees_zone
spring.datasource.username=root
spring.datasource.password=password

# JWT
app.jwt.secret=harishmaSareesZoneSecretKey2024
app.jwt.expiration=86400000

# File Upload
spring.servlet.multipart.max-file-size=10MB
```

### Frontend Configuration
- Proxy configured in `package.json` to connect to backend
- Tailwind CSS for styling
- Axios for API calls
- React Router for navigation

## 🎨 UI/UX Design

### Color Scheme
- **Primary:** Maroon (#be185d)
- **Secondary:** Gold (#f59e0b)
- **Accent:** Pink and cream tones

### Typography
- **Headers:** Inter font family
- **Body:** System fonts for readability

## 🔒 Security Features

- **JWT Authentication** for secure API access
- **Role-based Authorization** (USER/ADMIN)
- **Password Encryption** using BCrypt
- **CORS Configuration** for cross-origin requests
- **Input Validation** on all forms

## 💳 Payment Integration

### Razorpay Setup
1. Create Razorpay account
2. Get API keys from dashboard
3. Add keys to frontend configuration
4. Test with Razorpay test mode

## 📱 Responsive Design

- **Mobile-first** approach
- **Tailwind CSS** for responsive utilities
- **Optimized** for all screen sizes
- **Touch-friendly** interface

## 🚀 Deployment

### Local Deployment
1. Backend runs on port 8080
2. Frontend runs on port 3000
3. MySQL database on port 3306

### Production Deployment
- Build React app: `npm run build`
- Package Spring Boot: `mvn clean package`
- Deploy JAR file to server
- Configure production database
- Set up reverse proxy (Nginx)

## 🧪 Testing

### Backend Testing
```bash
mvn test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📈 Future Enhancements

- [ ] **AI Recommendations** based on user preferences
- [ ] **Multi-language Support** (Hindi, Tamil)
- [ ] **Progressive Web App** (PWA) features
- [ ] **WhatsApp Integration** for orders
- [ ] **Loyalty Points** system
- [ ] **Bulk Order** functionality
- [ ] **Advanced Analytics** dashboard
- [ ] **Email Notifications**
- [ ] **Social Media Integration**

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer:** Loyo Jeswin
- **Project:** Harishma Sarees Zone
- **Type:** Full-Stack eCommerce Application

## 📞 Support

For support and queries:
- **Email:** info@harishmasarees.com
- **Phone:** +91 9876543210

---

**Made with ❤️ for traditional saree lovers**
# Harishma-Sarees-Zone

# 🚀 Social Media Backend - Microservices Architecture

## 📌 Project Overview

This project implements a Microservices Architecture using Node.js and MongoDB.

It simulates the backend of a Social Media platform with independent services communicating via REST APIs and secured with JWT authentication.

The system demonstrates:
- Service decoupling
- API Gateway pattern
- Authentication & Authorization
- Scalable backend architecture

---

## 🏗 Architecture Overview

The system is composed of multiple independent services:

- 🔐 User Service → User registration, login, follow/unfollow
- 📝 Post Service → Post creation, feed, likes
- 🌐 API Gateway → Central entry point, routing, authentication, rate limiting

Architecture flow:

Client  
   │  
   ▼  
API Gateway (Port 3000)  
   │  
   ├── User Service (3001)  
   └── Post Service (3002)  

Each service runs independently and communicates via HTTP.

---

## 🧠 Microservices Concepts Implemented

- Service isolation
- Independent deployment
- RESTful communication
- Stateless JWT authentication
- Centralized routing via API Gateway
- Rate limiting & security middlewares
- MongoDB document modeling
- Pagination & indexing

---

## ⚙️ Technologies Used

- Node.js
- Express
- MongoDB
- Mongoose
- jsonwebtoken (JWT)
- bcryptjs
- http-proxy-middleware
- dotenv
- cors
- helmet
- express-rate-limit

---

## 📂 Project Structure

tp-microservices/
│
├── api-gateway/
│   ├── server.js
│   └── package.json
│
├── user-service/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── post-service/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── .env
├── .gitignore
└── package.json

---

## 🔐 Authentication Flow

1. User registers
2. Password is hashed using bcrypt
3. User logs in
4. Server generates JWT token
5. Client stores token
6. Client sends token in header:

Authorization: Bearer <token>

7. Gateway verifies token before forwarding protected requests

---

## 🚀 Getting Started

### 1️⃣ Clone the repository

git clone https://github.com/YOUR_USERNAME/social-media-microservices-nodejs.git  
cd social-media-microservices-nodejs  

---

### 2️⃣ Install dependencies

cd user-service  
npm install  

cd ../post-service  
npm install  

cd ../api-gateway  
npm install  

---

### 3️⃣ Setup Environment Variables

Create a `.env` file in the root directory:

MONGODB_URI=mongodb://localhost:27017/social_media  
JWT_SECRET=your_super_secure_secret_32_characters  
API_GATEWAY_PORT=3000  
USER_SERVICE_PORT=3001  
POST_SERVICE_PORT=3002  
NODE_ENV=development  

⚠️ Never commit the `.env` file.

---

### 4️⃣ Run the Services

Run each service separately:

npm run dev:gateway  
npm run dev:user  
npm run dev:post  

Or create a global script to start all services.

---

## 📡 API Endpoints

### 🔐 User Service

POST   /api/users/register  
POST   /api/users/login  
GET    /api/users/:id  
POST   /api/users/:id/follow  
DELETE /api/users/:id/unfollow  

### 📝 Post Service

POST   /api/posts  
GET    /api/posts  
GET    /api/posts/:id  
PUT    /api/posts/:id  
DELETE /api/posts/:id  
POST   /api/posts/:id/like  

---

## 🧪 Testing

You can test the API using:

- Postman
- Thunder Client
- cURL

Example:

curl -X POST http://localhost:3000/api/users/register \
-H "Content-Type: application/json" \
-d '{"username":"john","email":"john@example.com","password":"123456"}'

---

## 📈 Performance & Scalability

This architecture allows:

- Independent scaling of services
- Fault isolation
- Easier maintenance
- Better separation of concerns
- Flexible technology stack per service

---

## ⚠️ Challenges of Microservices

- Increased architectural complexity
- Network latency
- Distributed transactions
- Monitoring difficulty
- Deployment orchestration

---

## 🔮 Future Improvements

- Docker containerization
- Kubernetes orchestration
- Redis caching
- Message queues (RabbitMQ / Kafka)
- Monitoring (Prometheus / Grafana)
- CI/CD pipeline integration

---

## 🎓 Learning Outcomes

Through this project, I learned:

- Designing distributed systems
- Implementing secure authentication
- Structuring scalable backend systems
- Managing inter-service communication
- Applying the API Gateway pattern

---

## 👩‍💻 Author

Mariem Balegi  
Engineering Student – Computer Science ENIT

---

## 📄 License

MIT License

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Authentication API',
      version: '1.0.0',
      description:
        'API for user registration and login with JWT authentication',
      contact: {
        name: 'Ashwani',
      },
      servers: [
        {
          url: 'http://localhost:5000',
        },
      ],
    },
  },
  apis: ['./routes/*.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.use('/api/auth', authRoutes);

// Routes
const patientRoutes = require('./routes/patients');
const authorizationRoutes = require('./routes/authorizationRequests');

app.use('/api/patients', patientRoutes);
app.use('/api/authorization', authorizationRoutes);

app.get('/', (req, res) => {
  res.send('Healthcare API Running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

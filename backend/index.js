// index.js

const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config()

// Create the express app
const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
const jobsRouter = require('./routes/jobs')
app.use('/api/jobs', jobsRouter)

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Koyo Backend is running!' })
})

// Start the server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
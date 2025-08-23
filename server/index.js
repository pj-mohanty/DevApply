require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001; 

app.use(cors());
app.use(express.json());

const interviewRoutes = require('./routes/interview');
const applicationRoutes = require('./routes/applications');
const journalRoutes = require('./routes/journal');
const profileRoutes = require('./routes/profile');
const resumeRoutes = require('./routes/resume');
const dashboardRoutes = require('./routes/dashboard');
const questionHistoryRoutes = require('./routes/questionHistory');
app.use('/api/dashboard', dashboardRoutes);
// Use profile routes under /api
app.use('/api', profileRoutes);
app.use('/api', interviewRoutes);
app.use('/api', applicationRoutes);
app.use('/api', journalRoutes);
app.use('/api', resumeRoutes);
app.use('/api', questionHistoryRoutes);
app.use('/api', require('./routes/ai'));

 app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})
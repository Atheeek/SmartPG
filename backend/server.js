import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
// Add these to your imports at the top
import propertyRoutes from './routes/property.routes.js';
import roomRoutes from './routes/room.routes.js';
import bedRoutes from './routes/bed.routes.js';
import tenantRoutes from './routes/tenant.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import { startScheduler } from './utils/scheduler.js'; // <-- Import the scheduler
import expenseRoutes from './routes/expense.routes.js';
import reportRoutes from './routes/report.routes.js';



dotenv.config();
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // To accept JSON data in the body
app.use('/api/auth', authRoutes);
// Add these under your auth routes
app.use('/api/properties', propertyRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);






// Test Route
app.get('/', (req, res) => {
  res.send('PG-Pal API is up and running!');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, console.log(`Server is active on port ${PORT}`));

startScheduler(); // <-- Start the alarm clock

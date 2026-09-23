import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'your_password',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'POS_Tracking',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

export const connectDB = async () => {
  try {
    const pool = await sql.connect(config);
    console.log('MS SQL Database Connected successfully');
    return pool;
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
};

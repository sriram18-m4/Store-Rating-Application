require('dotenv').config();

const requiredVariables = ['DATABASE_URL', 'JWT_SECRET'];
const missingVariables = requiredVariables.filter((key) => !process.env[key]);

if (missingVariables.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVariables.join(', ')}. Copy backend/.env.example to backend/.env and set valid values.`
  );
}

module.exports = process.env;

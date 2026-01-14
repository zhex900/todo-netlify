import "dotenv/config";
import { Sequelize } from "sequelize";

// Get database connection string from environment variables
const databaseUrl =
  process.env.POSTGRES_URL || process.env.NETLIFY_DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "NETLIFY_DATABASE_URL or POSTGRES_URL environment variable is required"
  );
}

// Parse the connection string
const sequelize = new Sequelize(databaseUrl, {
  dialect: "postgres",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  dialectOptions: {
    ssl:
      process.env.NODE_ENV === "production"
        ? {
            require: true,
            rejectUnauthorized: false,
          }
        : false,
  },
});

export default sequelize;

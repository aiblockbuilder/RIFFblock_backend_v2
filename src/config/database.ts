import { Dialect } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export type Environment = 'development' | 'test' | 'production';

interface SequelizeConfig {
  username: string;
  password: string;
  database: string;
  host: string | undefined;
  port: number | undefined;
  dialect: Dialect;
  logging: boolean | ((sql: string) => void);
  pool?: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
}

const config: Record<Environment, SequelizeConfig> = {
  development: {
    username: process.env.DB_USER || "",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    dialect: 'postgres',
    logging: console.log,
  },
  test: {
    username: process.env.DB_USER || "",
    password: process.env.DB_PASSWORD || "",
    database: `${process.env.DB_NAME}_test` || "",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    dialect: 'postgres',
    logging: false,
  },
  production: {
    username: process.env.DB_USER || "",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
};

export default config;

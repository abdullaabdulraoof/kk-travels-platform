import 'dotenv/config';
import { DataSource } from 'typeorm';

import {
  AdminUser,
  Enquiry,
  MedicalEnquiryDetails,
  TourismEnquiryDetails,
  EnquiryNote,
  ActivityLog,
} from './entities/index.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  entities: [
    AdminUser,
    Enquiry,
    MedicalEnquiryDetails,
    TourismEnquiryDetails,
    EnquiryNote,
    ActivityLog,
  ],

  migrations: ['dist/database/migrations/*.js'],

  synchronize: false,
  migrationsRun: false,
});
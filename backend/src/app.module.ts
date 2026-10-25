import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { EnquiriesModule } from './enquiries/enquiries.module.js';
import {
  AdminUser,
  Enquiry,
  MedicalEnquiryDetails,
  TourismEnquiryDetails,
  EnquiryNote,
  ActivityLog,
} from './database/entities/index.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    EnquiriesModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.getOrThrow<string>('DB_HOST'),
        port: Number(configService.getOrThrow<string>('DB_PORT')),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: false,
        retryAttempts: 3,
        retryDelay: 3000,
      }),
    }),
    TypeOrmModule.forFeature([
      AdminUser,
      Enquiry,
      MedicalEnquiryDetails,
      TourismEnquiryDetails,
      EnquiryNote,
      ActivityLog,
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

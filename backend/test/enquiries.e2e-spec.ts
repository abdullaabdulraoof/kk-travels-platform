import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  AdminRole,
  AdminUser,
} from '../src/database/entities/admin-user.entity.js';
import { AuthController } from '../src/auth/auth.controller.js';
import { AuthService } from '../src/auth/auth.service.js';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard.js';
import { OwnerGuard } from '../src/auth/owner.guard.js';
import { JwtStrategy } from '../src/auth/jwt.strategy.js';
import { EnquiriesController } from '../src/enquiries/enquiries.controller.js';
import { EnquiriesService } from '../src/enquiries/enquiries.service.js';

describe('Public enquiry endpoints (e2e)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;
  let adminToken: string;
  const adminId = 'b6219718-74b8-41f0-a22d-14d842a144f5';
  const jwtSecret = 'test-secret-that-is-at-least-32-characters';
  const adminUsers = {
    findOneBy: vi.fn().mockResolvedValue({
      id: adminId,
      email: 'admin@example.com',
      isActive: true,
      role: AdminRole.OWNER,
    }),
  };
  const enquiriesService = {
    createNote: vi.fn().mockResolvedValue({
      id: 'd6219718-74b8-41f0-a22d-14d842a144f5',
      enquiryId: 'b6219718-74b8-41f0-a22d-14d842a144f5',
      content: 'Please call the customer',
      createdAt: '2026-10-25T00:00:00.000Z',
      author: { id: adminId, email: 'admin@example.com' },
    }),
    listNotes: vi.fn().mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    }),
    updateStatus: vi.fn().mockResolvedValue({
      message: 'Enquiry status updated successfully',
      id: 'b6219718-74b8-41f0-a22d-14d842a144f5',
      status: 'REVIEWING',
      updatedAt: '2026-10-25T00:00:00.000Z',
    }),
    getActivityHistory: vi.fn().mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    }),
    getById: vi.fn().mockResolvedValue({
      id: 'b6219718-74b8-41f0-a22d-14d842a144f5',
      enquiryNumber: 'ENQ-MEDICAL',
      type: 'MEDICAL',
      status: 'NEW',
      customerName: 'Medical Customer',
      email: null,
      phone: '+1 555 0100',
      country: 'United States',
      preferredLanguage: 'ENGLISH',
      message: null,
      createdAt: '2026-10-25T00:00:00.000Z',
      updatedAt: '2026-10-25T00:00:00.000Z',
      medicalDetails: {
        treatmentSpecialty: 'Cardiology',
        preferredHospital: null,
      },
    }),
    list: vi.fn().mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    }),
    createMedical: vi.fn().mockResolvedValue({
      message: 'Enquiry submitted successfully',
      enquiryNumber: 'ENQ-0123456789ABCDEF0123456789',
    }),
    createTourism: vi.fn().mockResolvedValue({
      message: 'Enquiry submitted successfully',
      enquiryNumber: 'ENQ-0123456789ABCDEF0123456789',
    }),
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: jwtSecret,
          signOptions: { algorithm: 'HS256', expiresIn: '5m' },
        }),
      ],
      controllers: [AuthController, EnquiriesController],
      providers: [
        { provide: EnquiriesService, useValue: enquiriesService },
        { provide: AuthService, useValue: { login: vi.fn() } },
        JwtAuthGuard,
        OwnerGuard,
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: { getOrThrow: vi.fn().mockReturnValue(jwtSecret) },
        },
        { provide: getRepositoryToken(AdminUser), useValue: adminUsers },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    jwtService = app.get(JwtService);
    adminToken = await jwtService.signAsync({ sub: adminId });
  });

  beforeEach(() => {
    enquiriesService.createNote.mockClear();
    enquiriesService.listNotes.mockClear();
    enquiriesService.updateStatus.mockClear();
    enquiriesService.getActivityHistory.mockClear();
    enquiriesService.getById.mockClear();
    enquiriesService.list.mockClear();
    enquiriesService.createMedical.mockClear();
    enquiriesService.createTourism.mockClear();
    adminUsers.findOneBy.mockClear();
    adminUsers.findOneBy.mockResolvedValue({
      id: adminId,
      email: 'admin@example.com',
      isActive: true,
      role: AdminRole.OWNER,
    });
  });

  it('creates an internal note using the authenticated admin identity', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/enquiries/b6219718-74b8-41f0-a22d-14d842a144f5/notes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ content: '  Please call the customer  ' })
      .expect(201);

    expect(response.body).toMatchObject({
      content: 'Please call the customer',
      author: { id: adminId, email: 'admin@example.com' },
    });
    expect(enquiriesService.createNote).toHaveBeenCalledWith(
      'b6219718-74b8-41f0-a22d-14d842a144f5',
      'Please call the customer',
      expect.objectContaining({ id: adminId }),
    );
  });

  it('rejects unauthenticated note creation and listing', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/enquiries/b6219718-74b8-41f0-a22d-14d842a144f5/notes')
      .send({ content: 'Private note' })
      .expect(401);
    await request(app.getHttpServer())
      .get('/api/v1/enquiries/b6219718-74b8-41f0-a22d-14d842a144f5/notes')
      .expect(401);

    expect(enquiriesService.createNote).not.toHaveBeenCalled();
    expect(enquiriesService.listNotes).not.toHaveBeenCalled();
  });

  it('rejects invalid note UUIDs and unexpected note body properties', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/enquiries/not-a-uuid/notes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ content: 'Private note' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/v1/enquiries/b6219718-74b8-41f0-a22d-14d842a144f5/notes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        content: 'Private note',
        adminUserId: 'f6219718-74b8-41f0-a22d-14d842a144f5',
      })
      .expect(400);

    expect(enquiriesService.createNote).not.toHaveBeenCalled();
  });

  it('returns 404 for notes on an unknown enquiry', async () => {
    enquiriesService.createNote.mockResolvedValueOnce(null);
    enquiriesService.listNotes.mockResolvedValueOnce(null);

    await request(app.getHttpServer())
      .post('/api/v1/enquiries/b6219718-74b8-41f0-a22d-14d842a144f5/notes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ content: 'Private note' })
      .expect(404);
    await request(app.getHttpServer())
      .get('/api/v1/enquiries/b6219718-74b8-41f0-a22d-14d842a144f5/notes')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });

  it('lists notes with pagination for an authenticated admin', async () => {
    enquiriesService.listNotes.mockResolvedValueOnce({
      data: [
        {
          id: 'd6219718-74b8-41f0-a22d-14d842a144f5',
          enquiryId: 'b6219718-74b8-41f0-a22d-14d842a144f5',
          content: 'Private note',
          createdAt: '2026-10-25T00:00:00.000Z',
          author: { id: adminId, email: 'admin@example.com' },
        },
      ],
      pagination: { page: 2, limit: 5, total: 6, totalPages: 2 },
    });

    const response = await request(app.getHttpServer())
      .get('/api/v1/enquiries/b6219718-74b8-41f0-a22d-14d842a144f5/notes')
      .query({ page: '2', limit: '5' })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.data[0]).toMatchObject({
      content: 'Private note',
      author: { id: adminId, email: 'admin@example.com' },
    });
    expect(response.body.data[0].author).not.toHaveProperty('passwordHash');
    expect(enquiriesService.listNotes).toHaveBeenCalledWith(
      'b6219718-74b8-41f0-a22d-14d842a144f5',
      expect.objectContaining({ page: 2, limit: 5 }),
    );
  });

  it('updates enquiry status for an authenticated admin', async () => {
    const response = await request(app.getHttpServer())
      .patch('/api/v1/enquiries/b6219718-74b8-41f0-a22d-14d842a144f5/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'REVIEWING' })
      .expect(200);

    expect(response.body).toMatchObject({ status: 'REVIEWING' });

    expect(enquiriesService.updateStatus).toHaveBeenCalledWith(
      'b6219718-74b8-41f0-a22d-14d842a144f5',
      'REVIEWING',
      adminId,
    );
  });

  it('rejects invalid status and invalid UUID for status updates', async () => {
    await request(app.getHttpServer())
      .patch('/api/v1/enquiries/b6219718-74b8-41f0-a22d-14d842a144f5/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'INVALID' })
      .expect(400);
    await request(app.getHttpServer())
      .patch('/api/v1/enquiries/not-a-uuid/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'REVIEWING' })
      .expect(400);

    expect(enquiriesService.updateStatus).not.toHaveBeenCalled();
  });

  it('returns 404 for a valid UUID with no enquiry during status update', async () => {
    enquiriesService.updateStatus.mockResolvedValueOnce(null);

    await request(app.getHttpServer())
      .patch('/api/v1/enquiries/b6219718-74b8-41f0-a22d-14d842a144f5/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'REVIEWING' })
      .expect(404);
  });

  it('rejects unauthenticated status and activity history requests', async () => {
    await request(app.getHttpServer())
      .patch('/api/v1/enquiries/b6219718-74b8-41f0-a22d-14d842a144f5/status')
      .send({ status: 'REVIEWING' })
      .expect(401);
    await request(app.getHttpServer())
      .get('/api/v1/enquiries/b6219718-74b8-41f0-a22d-14d842a144f5/activity')
      .expect(401);

    expect(enquiriesService.updateStatus).not.toHaveBeenCalled();
    expect(enquiriesService.getActivityHistory).not.toHaveBeenCalled();
  });

  it('returns paginated activity history for an authenticated admin', async () => {
    enquiriesService.getActivityHistory.mockResolvedValueOnce({
      data: [],
      pagination: { page: 2, limit: 5, total: 0, totalPages: 0 },
    });

    await request(app.getHttpServer())
      .get('/api/v1/enquiries/b6219718-74b8-41f0-a22d-14d842a144f5/activity')
      .query({ page: '2', limit: '5' })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect({
        data: [],
        pagination: { page: 2, limit: 5, total: 0, totalPages: 0 },
      });

    expect(enquiriesService.getActivityHistory).toHaveBeenCalledWith(
      'b6219718-74b8-41f0-a22d-14d842a144f5',
      expect.objectContaining({ page: 2, limit: 5 }),
    );
  });

  it('returns 404 for activity history on a nonexistent enquiry', async () => {
    enquiriesService.getActivityHistory.mockResolvedValueOnce(null);

    await request(app.getHttpServer())
      .get('/api/v1/enquiries/b6219718-74b8-41f0-a22d-14d842a144f5/activity')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });

  it('rejects missing and invalid JWTs for enquiry detail retrieval', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/enquiries/b6219718-74b8-41f0-a22d-14d842a144f5')
      .expect(401);
    await request(app.getHttpServer())
      .get('/api/v1/enquiries/b6219718-74b8-41f0-a22d-14d842a144f5')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    expect(enquiriesService.getById).not.toHaveBeenCalled();
  });

  it('returns medical enquiry detail for an authenticated admin', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/enquiries/b6219718-74b8-41f0-a22d-14d842a144f5')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toMatchObject({
      type: 'MEDICAL',
      medicalDetails: { treatmentSpecialty: 'Cardiology' },
    });

    expect(enquiriesService.getById).toHaveBeenCalledWith(
      'b6219718-74b8-41f0-a22d-14d842a144f5',
    );
  });

  it('returns tourism enquiry detail for an authenticated admin', async () => {
    enquiriesService.getById.mockResolvedValueOnce({
      id: 'b6219718-74b8-41f0-a22d-14d842a144f5',
      enquiryNumber: 'ENQ-TOURISM',
      type: 'TOURISM',
      status: 'NEW',
      customerName: 'Tourism Customer',
      email: null,
      phone: '+44 20 1234 5678',
      country: 'United Kingdom',
      preferredLanguage: 'ENGLISH',
      message: null,
      createdAt: '2026-10-25T00:00:00.000Z',
      updatedAt: '2026-10-25T00:00:00.000Z',
      tourismDetails: {
        preferredDestination: 'Kerala',
        numberOfTravelers: 2,
      },
    });

    const response = await request(app.getHttpServer())
      .get('/api/v1/enquiries/b6219718-74b8-41f0-a22d-14d842a144f5')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toMatchObject({
      type: 'TOURISM',
      tourismDetails: { preferredDestination: 'Kerala' },
    });
  });

  it('returns 400 for an invalid enquiry UUID', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/enquiries/not-a-uuid')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(400);

    expect(enquiriesService.getById).not.toHaveBeenCalled();
  });

  it('returns 404 when a valid UUID does not identify an enquiry', async () => {
    enquiriesService.getById.mockResolvedValueOnce(null);

    await request(app.getHttpServer())
      .get('/api/v1/enquiries/b6219718-74b8-41f0-a22d-14d842a144f5')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });

  it('requires a valid JWT for listing while keeping submissions public', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/enquiries')
      .expect(401);
    await request(app.getHttpServer())
      .get('/api/v1/enquiries')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
    expect(enquiriesService.list).not.toHaveBeenCalled();

    await request(app.getHttpServer())
      .post('/api/v1/enquiries/medical')
      .send({
        customerName: 'Medical Customer',
        phone: '+1 555 0100',
        country: 'United States',
        treatmentSpecialty: 'Cardiology',
      })
      .expect(201);
    await request(app.getHttpServer())
      .post('/api/v1/enquiries/tourism')
      .send({
        customerName: 'Tourism Customer',
        phone: '+44 20 1234 5678',
        country: 'United Kingdom',
      })
      .expect(201);
  });

  it('allows the owner through auth/me and rejects invalid or missing tokens', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toEqual({
      id: adminId,
      email: 'admin@example.com',
      isActive: true,
      role: AdminRole.OWNER,
    });

    await request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  it('denies every protected dashboard endpoint to an authenticated non-owner', async () => {
    adminUsers.findOneBy.mockResolvedValue({
      id: adminId,
      email: 'admin@example.com',
      isActive: true,
      role: AdminRole.ADMIN,
    });

    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(403);
    await request(app.getHttpServer())
      .get('/api/v1/enquiries')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(403);
    await request(app.getHttpServer())
      .get(`/api/v1/enquiries/${adminId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(403);
    await request(app.getHttpServer())
      .patch(`/api/v1/enquiries/${adminId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'REVIEWING' })
      .expect(403);
    await request(app.getHttpServer())
      .get(`/api/v1/enquiries/${adminId}/activity`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(403);
    await request(app.getHttpServer())
      .post(`/api/v1/enquiries/${adminId}/notes`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ content: 'Internal note' })
      .expect(403);
    await request(app.getHttpServer())
      .get(`/api/v1/enquiries/${adminId}/notes`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(403);

    expect(enquiriesService.list).not.toHaveBeenCalled();
    expect(enquiriesService.getById).not.toHaveBeenCalled();
    expect(enquiriesService.updateStatus).not.toHaveBeenCalled();
    expect(enquiriesService.getActivityHistory).not.toHaveBeenCalled();
    expect(enquiriesService.createNote).not.toHaveBeenCalled();
    expect(enquiriesService.listNotes).not.toHaveBeenCalled();
  });

  it('rejects client-supplied roles instead of accepting privilege elevation', async () => {
    await request(app.getHttpServer())
      .patch(`/api/v1/enquiries/${adminId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'REVIEWING', role: 'OWNER' })
      .expect(400);
    await request(app.getHttpServer())
      .post(`/api/v1/enquiries/${adminId}/notes`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ content: 'Internal note', role: 'OWNER' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'owner@example.com',
        password: 'valid-password',
        role: 'OWNER',
      })
      .expect(400);

    expect(enquiriesService.updateStatus).not.toHaveBeenCalled();
    expect(enquiriesService.createNote).not.toHaveBeenCalled();
  });

  it('lists with default pagination for an authenticated admin', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/enquiries')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect({
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });

    expect(enquiriesService.list).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 10, sortOrder: 'DESC' }),
    );
    expect(adminUsers.findOneBy).toHaveBeenCalledWith({ id: adminId });
  });

  it('passes validated pagination, filters, search, and sorting to the service', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/enquiries')
      .query({
        page: '2',
        limit: '25',
        type: 'MEDICAL',
        status: 'NEW',
        search: '  patient  ',
        sortBy: 'customerName',
        sortOrder: 'ASC',
      })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(enquiriesService.list).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        limit: 25,
        type: 'MEDICAL',
        status: 'NEW',
        search: 'patient',
        sortBy: 'customerName',
        sortOrder: 'ASC',
      }),
    );
  });

  it.each([
    ['page=0', { page: '0' }],
    ['non-integer limit', { limit: '1.5' }],
    ['limit over maximum', { limit: '101' }],
    ['invalid type', { type: 'OTHER' }],
    ['invalid status', { status: 'UNKNOWN' }],
    ['unsupported sort field', { sortBy: 'email;DROP TABLE enquiries' }],
    ['oversized search', { search: 'x'.repeat(151) }],
  ])('rejects invalid listing query: %s', async (_label, query) => {
    await request(app.getHttpServer())
      .get('/api/v1/enquiries')
      .query(query)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(400);

    expect(enquiriesService.list).not.toHaveBeenCalled();
  });

  it('accepts public medical submissions without a bearer token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/enquiries/medical')
      .send({
        customerName: 'Medical Customer',
        phone: '+1 555 0100',
        country: 'United States',
        treatmentSpecialty: 'Cardiology',
      })
      .expect(201)
      .expect((response) => {
        expect(response.body).toEqual({
          message: 'Enquiry submitted successfully',
          enquiryNumber: 'ENQ-0123456789ABCDEF0123456789',
        });
        expect(response.body).not.toHaveProperty('notes');
      });

    expect(enquiriesService.createMedical).toHaveBeenCalledOnce();
    expect(enquiriesService.createMedical).toHaveBeenCalledWith(
      expect.objectContaining({
        customerName: 'Medical Customer',
        preferredLanguage: 'ENGLISH',
      }),
    );
  });

  it('accepts public tourism submissions without a bearer token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/enquiries/tourism')
      .send({
        customerName: 'Tourism Customer',
        phone: '+44 20 1234 5678',
        country: 'United Kingdom',
      })
      .expect(201);

    expect(enquiriesService.createTourism).toHaveBeenCalledOnce();
    expect(enquiriesService.createTourism).toHaveBeenCalledWith(
      expect.objectContaining({
        customerName: 'Tourism Customer',
        preferredDestination: 'Kerala',
        accommodationRequired: false,
      }),
    );
  });

  it('rejects missing required fields', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/enquiries/medical')
      .send({ customerName: 'Incomplete' })
      .expect(400);

    expect(enquiriesService.createMedical).not.toHaveBeenCalled();
  });

  it('rejects malformed optional email addresses', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/enquiries/medical')
      .send({
        customerName: 'Medical Customer',
        phone: '+1 555 0100',
        country: 'United States',
        treatmentSpecialty: 'Cardiology',
        email: 'not-an-email',
      })
      .expect(400);

    expect(enquiriesService.createMedical).not.toHaveBeenCalled();
  });

  it('rejects unexpected administrative fields', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/enquiries/tourism')
      .send({
        customerName: 'Tourism Customer',
        phone: '+44 20 1234 5678',
        country: 'United Kingdom',
        status: 'COMPLETED',
        id: 'client-controlled-id',
      })
      .expect(400);

    expect(enquiriesService.createTourism).not.toHaveBeenCalled();
  });

  it('accepts a valid tourism date range', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/enquiries/tourism')
      .send({
        customerName: 'Tourism Customer',
        phone: '+44 20 1234 5678',
        country: 'United Kingdom',
        travelStartDate: '2026-11-10',
        travelEndDate: '2026-11-20',
      })
      .expect(201);

    expect(enquiriesService.createTourism).toHaveBeenCalledOnce();
  });

  it('accepts equal tourism start and end dates', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/enquiries/tourism')
      .send({
        customerName: 'Tourism Customer',
        phone: '+44 20 1234 5678',
        country: 'United Kingdom',
        travelStartDate: '2026-11-10',
        travelEndDate: '2026-11-10',
      })
      .expect(201);

    expect(enquiriesService.createTourism).toHaveBeenCalledOnce();
  });

  it('rejects a tourism end date before its start date', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/enquiries/tourism')
      .send({
        customerName: 'Tourism Customer',
        phone: '+44 20 1234 5678',
        country: 'United Kingdom',
        travelStartDate: '2026-11-20',
        travelEndDate: '2026-11-10',
      })
      .expect(400);

    expect(enquiriesService.createTourism).not.toHaveBeenCalled();
  });

  it('allows omitted tourism dates', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/enquiries/tourism')
      .send({
        customerName: 'Tourism Customer',
        phone: '+44 20 1234 5678',
        country: 'United Kingdom',
      })
      .expect(201);

    expect(enquiriesService.createTourism).toHaveBeenCalledOnce();
  });

  it('normalizes empty and whitespace-only optional medical text to absent values', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/enquiries/medical')
      .send({
        customerName: 'Medical Customer',
        phone: '+1 555 0100',
        country: 'United States',
        treatmentSpecialty: 'Cardiology',
        email: '',
        message: '   ',
        preferredHospital: '',
        additionalRequirements: ' \t ',
      })
      .expect(201);

    expect(enquiriesService.createMedical).toHaveBeenCalledWith(
      expect.objectContaining({
        email: undefined,
        message: undefined,
        preferredHospital: undefined,
        additionalRequirements: undefined,
      }),
    );
  });

  it('normalizes empty and whitespace-only optional tourism text to absent values', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/enquiries/tourism')
      .send({
        customerName: 'Tourism Customer',
        phone: '+44 20 1234 5678',
        country: 'United Kingdom',
        email: '  ',
        message: '',
        preferredDestination: ' \t ',
        travelInterests: ' ',
        additionalRequirements: '',
      })
      .expect(201);

    expect(enquiriesService.createTourism).toHaveBeenCalledWith(
      expect.objectContaining({
        email: undefined,
        message: undefined,
        preferredDestination: undefined,
        travelInterests: undefined,
        additionalRequirements: undefined,
      }),
    );
  });

  afterAll(async () => {
    await app.close();
  });
});

import {
  Brackets,
  DataSource,
  EntityManager,
  getMetadataArgsStorage,
} from 'typeorm';
import { ActivityLog } from '../database/entities/activity-log.entity.js';
import { EnquiryNote } from '../database/entities/enquiry-note.entity.js';
import {
  Enquiry,
  EnquiryStatus,
  EnquiryType,
  PreferredLanguage,
} from '../database/entities/enquiry.entity.js';
import { MedicalEnquiryDetails } from '../database/entities/medical-enquiry-details.entity.js';
import { TourismEnquiryDetails } from '../database/entities/tourism-enquiry-details.entity.js';
import { CreateMedicalEnquiryDto } from './dto/create-medical-enquiry.dto.js';
import { CreateTourismEnquiryDto } from './dto/create-tourism-enquiry.dto.js';
import { ActivityHistoryQueryDto } from './dto/activity-history-query.dto.js';
import { ListEnquiryNotesQueryDto } from './dto/list-enquiry-notes-query.dto.js';
import {
  ListEnquiriesQueryDto,
  SortOrder,
} from './dto/list-enquiries-query.dto.js';
import { EnquiriesService } from './enquiries.service.js';

describe('EnquiriesService', () => {
  let service: EnquiriesService;
  let dataSource: {
    transaction: ReturnType<typeof vi.fn>;
    getRepository: ReturnType<typeof vi.fn>;
  };
  let enquiryRepository: {
    findOneBy: ReturnType<typeof vi.fn>;
    existsBy: ReturnType<typeof vi.fn>;
    createQueryBuilder: ReturnType<typeof vi.fn>;
  };
  let medicalDetailsRepository: { findOneBy: ReturnType<typeof vi.fn> };
  let tourismDetailsRepository: { findOneBy: ReturnType<typeof vi.fn> };
  let activityLogRepository: { findAndCount: ReturnType<typeof vi.fn> };
  let enquiryNoteRepository: { findAndCount: ReturnType<typeof vi.fn> };
  let stagedRecords: object[];
  let queryBuilder: Record<string, ReturnType<typeof vi.fn>>;
  let manager: {
    findOneBy: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };
  let committedRecords: object[];

  beforeEach(() => {
    committedRecords = [];
    stagedRecords = [];
    queryBuilder = {
      select: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      addOrderBy: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      take: vi.fn().mockReturnThis(),
      getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
    };
    enquiryRepository = {
      findOneBy: vi.fn(),
      existsBy: vi.fn().mockResolvedValue(true),
      createQueryBuilder: vi.fn(() => queryBuilder),
    };
    medicalDetailsRepository = { findOneBy: vi.fn() };
    tourismDetailsRepository = { findOneBy: vi.fn() };
    activityLogRepository = {
      findAndCount: vi.fn().mockResolvedValue([[], 0]),
    };
    enquiryNoteRepository = {
      findAndCount: vi.fn().mockResolvedValue([[], 0]),
    };
    manager = {
      findOneBy: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(
        (EntityClass: new () => object, values: object) =>
          Object.assign(new EntityClass(), values),
      ),
      save: vi.fn(async (entityOrRecord: object, maybeRecord?: object) => {
        const record = maybeRecord ?? entityOrRecord;
        if (record instanceof Enquiry) {
          record.id = 'b6219718-74b8-41f0-a22d-14d842a144f5';
        }
        if (record instanceof EnquiryNote) {
          record.id = 'd6219718-74b8-41f0-a22d-14d842a144f5';
          record.createdAt = new Date('2026-10-25T00:00:00.000Z');
        }
        stagedRecords.push(record);
        return record;
      }),
    };
    dataSource = {
      getRepository: vi.fn((entity: typeof Enquiry) => {
        if (entity === Enquiry) {
          return enquiryRepository;
        }
        if (entity === MedicalEnquiryDetails) {
          return medicalDetailsRepository;
        }
        if (entity === TourismEnquiryDetails) {
          return tourismDetailsRepository;
        }
        if (entity === EnquiryNote) {
          return enquiryNoteRepository;
        }
        return activityLogRepository;
      }),
      transaction: vi.fn(async (callback) => {
        try {
          const result = await callback(manager as unknown as EntityManager);
          committedRecords = [...stagedRecords];
          return result;
        } catch (error) {
          stagedRecords.length = 0;
          throw error;
        }
      }),
    };
    service = new EnquiriesService(dataSource as unknown as DataSource);
  });

  it('creates a note and activity log using the authenticated admin', async () => {
    manager.findOneBy.mockResolvedValue({
      id: 'b6219718-74b8-41f0-a22d-14d842a144f5',
    });
    const author = {
      id: 'c6219718-74b8-41f0-a22d-14d842a144f5',
      email: 'admin@example.com',
      isActive: true,
      role: 'ADMIN',
    };

    const result = await service.createNote(
      'b6219718-74b8-41f0-a22d-14d842a144f5',
      'Please call the customer',
      author,
    );

    expect(dataSource.transaction).toHaveBeenCalledOnce();
    expect(manager.findOneBy).toHaveBeenCalledWith(Enquiry, {
      id: 'b6219718-74b8-41f0-a22d-14d842a144f5',
    });
    expect(manager.create).toHaveBeenCalledWith(
      EnquiryNote,
      expect.objectContaining({
        enquiryId: 'b6219718-74b8-41f0-a22d-14d842a144f5',
        adminUserId: author.id,
        content: 'Please call the customer',
      }),
    );
    expect(manager.create).toHaveBeenCalledWith(
      ActivityLog,
      expect.objectContaining({
        enquiryId: 'b6219718-74b8-41f0-a22d-14d842a144f5',
        adminUserId: author.id,
        action: 'NOTE_ADDED',
        description: 'Internal enquiry note added',
        metadata: { noteId: 'd6219718-74b8-41f0-a22d-14d842a144f5' },
      }),
    );
    expect(result).toEqual({
      id: 'd6219718-74b8-41f0-a22d-14d842a144f5',
      enquiryId: 'b6219718-74b8-41f0-a22d-14d842a144f5',
      content: 'Please call the customer',
      createdAt: new Date('2026-10-25T00:00:00.000Z'),
      author: { id: author.id, email: author.email },
    });
    expect(result).not.toHaveProperty('adminUser.passwordHash');
  });

  it('returns null without creating a note when the enquiry does not exist', async () => {
    manager.findOneBy.mockResolvedValue(null);

    await expect(
      service.createNote(
        'b6219718-74b8-41f0-a22d-14d842a144f5',
        'Private note',
        {
          id: 'c6219718-74b8-41f0-a22d-14d842a144f5',
          email: 'admin@example.com',
          isActive: true,
          role: 'ADMIN',
        },
      ),
    ).resolves.toBeNull();

    expect(manager.save).not.toHaveBeenCalled();
  });

  it('rolls back note creation when activity logging fails', async () => {
    manager.findOneBy.mockResolvedValue({
      id: 'b6219718-74b8-41f0-a22d-14d842a144f5',
    });
    manager.save
      .mockImplementationOnce(async (_entity: object, record: object) => {
        stagedRecords.push(record);
        return record;
      })
      .mockRejectedValueOnce(new Error('activity log insert failed'));

    await expect(
      service.createNote(
        'b6219718-74b8-41f0-a22d-14d842a144f5',
        'Private note',
        {
          id: 'c6219718-74b8-41f0-a22d-14d842a144f5',
          email: 'admin@example.com',
          isActive: true,
          role: 'ADMIN',
        },
      ),
    ).rejects.toThrow('activity log insert failed');

    expect(dataSource.transaction).toHaveBeenCalledOnce();
    expect(committedRecords).toEqual([]);
    expect(stagedRecords).toEqual([]);
  });

  it('lists only the enquiry notes newest first with safe author data', async () => {
    enquiryNoteRepository.findAndCount.mockResolvedValue([
      [
        Object.assign(new EnquiryNote(), {
          id: 'd6219718-74b8-41f0-a22d-14d842a144f5',
          enquiryId: 'b6219718-74b8-41f0-a22d-14d842a144f5',
          adminUserId: 'c6219718-74b8-41f0-a22d-14d842a144f5',
          content: 'Newest private note',
          createdAt: new Date('2026-10-25T00:00:00.000Z'),
          adminUser: {
            id: 'c6219718-74b8-41f0-a22d-14d842a144f5',
            email: 'admin@example.com',
            passwordHash: 'must not be returned',
          },
        }),
        Object.assign(new EnquiryNote(), {
          id: 'e6219718-74b8-41f0-a22d-14d842a144f5',
          enquiryId: 'b6219718-74b8-41f0-a22d-14d842a144f5',
          adminUserId: 'f6219718-74b8-41f0-a22d-14d842a144f5',
          content: 'Older private note',
          createdAt: new Date('2026-10-24T00:00:00.000Z'),
          adminUser: {
            id: 'f6219718-74b8-41f0-a22d-14d842a144f5',
            email: 'other@example.com',
            passwordHash: 'must not be returned',
          },
        }),
      ],
      2,
    ]);

    const result = await service.listNotes(
      'b6219718-74b8-41f0-a22d-14d842a144f5',
      Object.assign(new ListEnquiryNotesQueryDto(), { page: 1, limit: 10 }),
    );

    expect(enquiryNoteRepository.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { enquiryId: 'b6219718-74b8-41f0-a22d-14d842a144f5' },
        order: { createdAt: 'DESC', id: 'DESC' },
        skip: 0,
        take: 10,
      }),
    );
    expect(result?.data.map((note) => note.content)).toEqual([
      'Newest private note',
      'Older private note',
    ]);
    expect(result?.data[0].author).toEqual({
      id: 'c6219718-74b8-41f0-a22d-14d842a144f5',
      email: 'admin@example.com',
    });
    expect(result?.data[0].author).not.toHaveProperty('passwordHash');
  });

  it('does not list notes for a nonexistent enquiry', async () => {
    enquiryRepository.existsBy.mockResolvedValue(false);

    await expect(
      service.listNotes(
        'b6219718-74b8-41f0-a22d-14d842a144f5',
        new ListEnquiryNotesQueryDto(),
      ),
    ).resolves.toBeNull();

    expect(enquiryNoteRepository.findAndCount).not.toHaveBeenCalled();
  });

  it('updates status and records the authenticated admin and status transition', async () => {
    const enquiry = Object.assign(new Enquiry(), {
      id: 'b6219718-74b8-41f0-a22d-14d842a144f5',
      status: EnquiryStatus.NEW,
      updatedAt: new Date('2026-10-24T00:00:00.000Z'),
    });
    manager.findOne.mockResolvedValue(enquiry);

    const result = await service.updateStatus(
      enquiry.id,
      EnquiryStatus.REVIEWING,
      'c6219718-74b8-41f0-a22d-14d842a144f5',
    );

    expect(dataSource.transaction).toHaveBeenCalledOnce();
    expect(manager.findOne).toHaveBeenCalledWith(
      Enquiry,
      expect.objectContaining({
        where: { id: enquiry.id },
        lock: { mode: 'pessimistic_write' },
      }),
    );
    expect(manager.save).toHaveBeenNthCalledWith(1, Enquiry, enquiry);
    expect(manager.create).toHaveBeenCalledWith(
      ActivityLog,
      expect.objectContaining({
        enquiryId: enquiry.id,
        adminUserId: 'c6219718-74b8-41f0-a22d-14d842a144f5',
        action: 'STATUS_CHANGED',
        description: 'Enquiry status changed from NEW to REVIEWING',
        metadata: {
          previousStatus: EnquiryStatus.NEW,
          newStatus: EnquiryStatus.REVIEWING,
        },
      }),
    );
    expect(manager.save).toHaveBeenNthCalledWith(
      2,
      ActivityLog,
      expect.any(ActivityLog),
    );
    expect(enquiry.updatedAt.getTime()).toBeGreaterThan(
      new Date('2026-10-24T00:00:00.000Z').getTime(),
    );
    expect(result).toMatchObject({
      id: enquiry.id,
      status: EnquiryStatus.REVIEWING,
    });
  });

  it('does not save or log when the requested status is unchanged', async () => {
    const enquiry = Object.assign(new Enquiry(), {
      id: 'b6219718-74b8-41f0-a22d-14d842a144f5',
      status: EnquiryStatus.NEW,
      updatedAt: new Date('2026-10-24T00:00:00.000Z'),
    });
    manager.findOne.mockResolvedValue(enquiry);

    const result = await service.updateStatus(
      enquiry.id,
      EnquiryStatus.NEW,
      'c6219718-74b8-41f0-a22d-14d842a144f5',
    );

    expect(manager.save).not.toHaveBeenCalled();
    expect(manager.create).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      message: 'Enquiry status unchanged',
      status: EnquiryStatus.NEW,
    });
  });

  it('returns null for a status update on a nonexistent enquiry', async () => {
    manager.findOne.mockResolvedValue(null);

    await expect(
      service.updateStatus(
        'b6219718-74b8-41f0-a22d-14d842a144f5',
        EnquiryStatus.NEW,
        'c6219718-74b8-41f0-a22d-14d842a144f5',
      ),
    ).resolves.toBeNull();

    expect(manager.save).not.toHaveBeenCalled();
    expect(manager.create).not.toHaveBeenCalled();
  });

  it('rolls back a status change when activity-log persistence fails', async () => {
    const enquiry = Object.assign(new Enquiry(), {
      id: 'b6219718-74b8-41f0-a22d-14d842a144f5',
      status: EnquiryStatus.NEW,
      updatedAt: new Date('2026-10-24T00:00:00.000Z'),
    });
    manager.findOne.mockResolvedValue(enquiry);
    manager.save
      .mockImplementationOnce(async (_entity: object, record: object) => {
        stagedRecords.push(record);
        return record;
      })
      .mockRejectedValueOnce(new Error('activity log insert failed'));

    await expect(
      service.updateStatus(
        enquiry.id,
        EnquiryStatus.REVIEWING,
        'c6219718-74b8-41f0-a22d-14d842a144f5',
      ),
    ).rejects.toThrow('activity log insert failed');

    expect(dataSource.transaction).toHaveBeenCalledOnce();
    expect(committedRecords).toEqual([]);
    expect(stagedRecords).toEqual([]);
  });

  it('returns activity history newest first with safe admin data and pagination', async () => {
    activityLogRepository.findAndCount.mockResolvedValue([
      [
        Object.assign(new ActivityLog(), {
          id: 'f6219718-74b8-41f0-a22d-14d842a144f5',
          enquiryId: 'b6219718-74b8-41f0-a22d-14d842a144f5',
          adminUserId: 'c6219718-74b8-41f0-a22d-14d842a144f5',
          action: 'STATUS_CHANGED',
          description: 'Enquiry status changed from NEW to REVIEWING',
          metadata: {
            previousStatus: EnquiryStatus.NEW,
            newStatus: EnquiryStatus.REVIEWING,
          },
          createdAt: new Date('2026-10-25T00:00:00.000Z'),
          adminUser: {
            id: 'c6219718-74b8-41f0-a22d-14d842a144f5',
            email: 'admin@example.com',
            passwordHash: 'must not be returned',
          },
        }),
        Object.assign(new ActivityLog(), {
          id: 'e6219718-74b8-41f0-a22d-14d842a144f5',
          enquiryId: 'b6219718-74b8-41f0-a22d-14d842a144f5',
          adminUserId: null,
          action: 'CREATED',
          description: 'Enquiry submitted',
          metadata: null,
          createdAt: new Date('2026-10-24T00:00:00.000Z'),
          adminUser: null,
        }),
      ],
      2,
    ]);

    const result = await service.getActivityHistory(
      'b6219718-74b8-41f0-a22d-14d842a144f5',
      Object.assign(new ActivityHistoryQueryDto(), { page: 1, limit: 10 }),
    );

    expect(dataSource.getRepository).toHaveBeenCalledWith(Enquiry);
    expect(activityLogRepository.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { enquiryId: 'b6219718-74b8-41f0-a22d-14d842a144f5' },
        order: { createdAt: 'DESC', id: 'DESC' },
        skip: 0,
        take: 10,
      }),
    );
    expect(result?.data[0].createdAt).toEqual(
      new Date('2026-10-25T00:00:00.000Z'),
    );
    expect(result?.data[0].adminUser).toEqual({
      id: 'c6219718-74b8-41f0-a22d-14d842a144f5',
      email: 'admin@example.com',
    });
    expect(result?.data[0].adminUser).not.toHaveProperty('passwordHash');
    expect(result?.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
    });
  });

  it('returns null without querying activity when the enquiry is missing', async () => {
    enquiryRepository.existsBy.mockResolvedValue(false);

    await expect(
      service.getActivityHistory(
        'b6219718-74b8-41f0-a22d-14d842a144f5',
        new ActivityHistoryQueryDto(),
      ),
    ).resolves.toBeNull();

    expect(activityLogRepository.findAndCount).not.toHaveBeenCalled();
  });

  it('returns an enquiry with only its medical details', async () => {
    const enquiry = Object.assign(new Enquiry(), {
      id: 'b6219718-74b8-41f0-a22d-14d842a144f5',
      enquiryNumber: 'ENQ-MEDICAL',
      type: EnquiryType.MEDICAL,
      status: EnquiryStatus.NEW,
      customerName: 'Medical Customer',
      email: null,
      phone: '+1 555 0100',
      country: 'United States',
      preferredLanguage: PreferredLanguage.ENGLISH,
      message: null,
      createdAt: new Date('2026-10-25T00:00:00.000Z'),
      updatedAt: new Date('2026-10-25T00:00:00.000Z'),
    });
    enquiryRepository.findOneBy.mockResolvedValue(enquiry);
    medicalDetailsRepository.findOneBy.mockResolvedValue(
      Object.assign(new MedicalEnquiryDetails(), {
        id: '5a9e1e84-3f89-4dab-9a85-82b8e00c9e62',
        enquiry,
        treatmentSpecialty: 'Cardiology',
        preferredHospital: null,
        preferredAppointmentDate: null,
        travelCompanions: 1,
        additionalRequirements: null,
        createdAt: new Date('2026-10-25T00:00:00.000Z'),
        updatedAt: new Date('2026-10-25T00:00:00.000Z'),
      }),
    );

    const result = await service.getById(enquiry.id);

    expect(enquiryRepository.findOneBy).toHaveBeenCalledWith({ id: enquiry.id });
    expect(medicalDetailsRepository.findOneBy).toHaveBeenCalledWith({
      enquiry: { id: enquiry.id },
    });
    expect(tourismDetailsRepository.findOneBy).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      id: enquiry.id,
      enquiryNumber: 'ENQ-MEDICAL',
      medicalDetails: {
        treatmentSpecialty: 'Cardiology',
        travelCompanions: 1,
      },
    });
    expect(result).not.toHaveProperty('tourismDetails');
    expect(result).not.toHaveProperty('medicalDetails.enquiry');
  });

  it('returns an enquiry with only its tourism details', async () => {
    const enquiry = Object.assign(new Enquiry(), {
      id: 'b6219718-74b8-41f0-a22d-14d842a144f5',
      enquiryNumber: 'ENQ-TOURISM',
      type: EnquiryType.TOURISM,
      status: EnquiryStatus.NEW,
      customerName: 'Tourism Customer',
      email: 'customer@example.com',
      phone: '+44 20 1234 5678',
      country: 'United Kingdom',
      preferredLanguage: PreferredLanguage.ENGLISH,
      message: null,
      createdAt: new Date('2026-10-25T00:00:00.000Z'),
      updatedAt: new Date('2026-10-25T00:00:00.000Z'),
    });
    enquiryRepository.findOneBy.mockResolvedValue(enquiry);
    tourismDetailsRepository.findOneBy.mockResolvedValue(
      Object.assign(new TourismEnquiryDetails(), {
        id: '5a9e1e84-3f89-4dab-9a85-82b8e00c9e62',
        enquiry,
        preferredDestination: 'Kerala',
        travelStartDate: '2026-11-01',
        travelEndDate: '2026-11-10',
        numberOfTravelers: 2,
        travelInterests: 'Nature',
        accommodationRequired: true,
        additionalRequirements: null,
        createdAt: new Date('2026-10-25T00:00:00.000Z'),
        updatedAt: new Date('2026-10-25T00:00:00.000Z'),
      }),
    );

    const result = await service.getById(enquiry.id);

    expect(tourismDetailsRepository.findOneBy).toHaveBeenCalledWith({
      enquiry: { id: enquiry.id },
    });
    expect(medicalDetailsRepository.findOneBy).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      id: enquiry.id,
      enquiryNumber: 'ENQ-TOURISM',
      tourismDetails: {
        preferredDestination: 'Kerala',
        numberOfTravelers: 2,
      },
    });
    expect(result).not.toHaveProperty('medicalDetails');
    expect(result).not.toHaveProperty('tourismDetails.enquiry');
  });

  it('returns null without querying details when the enquiry does not exist', async () => {
    enquiryRepository.findOneBy.mockResolvedValue(null);

    await expect(
      service.getById('b6219718-74b8-41f0-a22d-14d842a144f5'),
    ).resolves.toBeNull();

    expect(medicalDetailsRepository.findOneBy).not.toHaveBeenCalled();
    expect(tourismDetailsRepository.findOneBy).not.toHaveBeenCalled();
  });

  it('lists with default pagination and returns a safe empty result', async () => {
    const result = await service.list(new ListEnquiriesQueryDto());

    expect(queryBuilder.skip).toHaveBeenCalledWith(0);
    expect(queryBuilder.take).toHaveBeenCalledWith(10);
    expect(queryBuilder.orderBy).toHaveBeenCalledWith(
      'enquiry.createdAt',
      SortOrder.DESC,
    );
    expect(queryBuilder.addOrderBy).toHaveBeenCalledWith('enquiry.id', 'ASC');
    expect(result).toEqual({
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });
  });

  it('uses the requested page, filters, search, and allowlisted sort field', async () => {
    const dto = Object.assign(new ListEnquiriesQueryDto(), {
      page: 3,
      limit: 25,
      type: EnquiryType.MEDICAL,
      status: EnquiryStatus.NEW,
      search: '50%_off!',
      sortBy: 'customerName' as const,
      sortOrder: SortOrder.ASC,
    });

    await service.list(dto);

    expect(queryBuilder.skip).toHaveBeenCalledWith(50);
    expect(queryBuilder.take).toHaveBeenCalledWith(25);
    expect(queryBuilder.orderBy).toHaveBeenCalledWith(
      'enquiry.customerName',
      SortOrder.ASC,
    );

    const whereCalls = queryBuilder.andWhere.mock.calls;
    expect(whereCalls).toContainEqual([
      'enquiry.type = :type',
      { type: EnquiryType.MEDICAL },
    ]);
    expect(whereCalls).toContainEqual([
      'enquiry.status = :status',
      { status: EnquiryStatus.NEW },
    ]);

    const groupedSearch = whereCalls.find(
      ([condition]) => condition instanceof Brackets,
    )?.[0] as Brackets | undefined;
    expect(groupedSearch).toBeInstanceOf(Brackets);
    const searchConditions: unknown[][] = [];
    const whereBuilder = {
      where: (...args: unknown[]) => {
        searchConditions.push(args);
        return whereBuilder;
      },
      orWhere: (...args: unknown[]) => {
        searchConditions.push(args);
        return whereBuilder;
      },
    };
    groupedSearch?.whereFactory({
      ...whereBuilder,
    } as never);
    expect(searchConditions).toEqual([
      ["enquiry.enquiryNumber ILIKE :search ESCAPE '!'", { search: '%50!%!_off!!%' }],
      ["enquiry.customerName ILIKE :search ESCAPE '!'", { search: '%50!%!_off!!%' }],
      ["enquiry.email ILIKE :search ESCAPE '!'", { search: '%50!%!_off!!%' }],
      ["enquiry.phone ILIKE :search ESCAPE '!'", { search: '%50!%!_off!!%' }],
    ]);
  });

  it('projects only public enquiry fields and computes pagination totals', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([
      [
        Object.assign(new Enquiry(), {
          id: 'b6219718-74b8-41f0-a22d-14d842a144f5',
          enquiryNumber: 'ENQ-0123456789ABCDEF0123456789',
          type: EnquiryType.TOURISM,
          status: EnquiryStatus.NEW,
          customerName: 'Tourism Customer',
          email: 'customer@example.com',
          phone: '+44 20 1234 5678',
          country: 'United Kingdom',
          preferredLanguage: PreferredLanguage.ENGLISH,
          message: null,
          createdAt: new Date('2026-10-25T00:00:00.000Z'),
          updatedAt: new Date('2026-10-25T00:00:00.000Z'),
          adminUser: { passwordHash: 'must not be returned' },
        }),
      ],
      21,
    ]);

    const result = await service.list(
      Object.assign(new ListEnquiriesQueryDto(), { page: 2, limit: 10 }),
    );

    expect(result.pagination).toEqual({
      page: 2,
      limit: 10,
      total: 21,
      totalPages: 3,
    });
    expect(Object.keys(result.data[0])).toEqual([
      'id',
      'enquiryNumber',
      'type',
      'status',
      'customerName',
      'email',
      'phone',
      'country',
      'preferredLanguage',
      'message',
      'createdAt',
      'updatedAt',
    ]);
  });

  it.each([
    [MedicalEnquiryDetails, 'medical_enquiry_details'],
    [TourismEnquiryDetails, 'tourism_enquiry_details'],
  ])(
    'maps %s.enquiry_id only through the enquiry relation',
    (detailsEntity) => {
      const metadata = getMetadataArgsStorage();
      const joinColumn = metadata.joinColumns.find(
        (entry) =>
          entry.target === detailsEntity && entry.propertyName === 'enquiry',
      );

      expect(joinColumn).toMatchObject({
        name: 'enquiry_id',
        referencedColumnName: 'id',
      });
      expect(
        metadata.columns.some(
          (entry) =>
            entry.target === detailsEntity && entry.propertyName === 'enquiryId',
        ),
      ).toBe(false);
    },
  );

  it('creates a medical enquiry and linked details in one transaction', async () => {
    const result = await service.createMedical({
      customerName: 'Medical Customer',
      phone: '+1 555 0100',
      country: 'United States',
      preferredLanguage: PreferredLanguage.ENGLISH,
      treatmentSpecialty: 'Cardiology',
    } as CreateMedicalEnquiryDto);

    const [enquiry, details] = committedRecords as [
      Enquiry,
      MedicalEnquiryDetails,
    ];
    expect(dataSource.transaction).toHaveBeenCalledOnce();
    expect(enquiry).toMatchObject({
      type: EnquiryType.MEDICAL,
      status: EnquiryStatus.NEW,
      customerName: 'Medical Customer',
      email: null,
      phone: '+1 555 0100',
      country: 'United States',
      message: null,
    });
    expect(enquiry.enquiryNumber).toMatch(/^ENQ-[A-F0-9]{26}$/);
    expect(details).toMatchObject({
      enquiry,
      treatmentSpecialty: 'Cardiology',
      preferredHospital: null,
      preferredAppointmentDate: null,
      travelCompanions: null,
      additionalRequirements: null,
    });
    expect(details.enquiry.id).toBe(enquiry.id);
    expect(manager.save).toHaveBeenNthCalledWith(2, details);
    expect(result).toMatchObject({
      message: 'Enquiry submitted successfully',
      enquiryNumber: enquiry.enquiryNumber,
    });
    expect(result).not.toHaveProperty('id');
  });

  it('creates a tourism enquiry and linked details in one transaction', async () => {
    const result = await service.createTourism({
      customerName: 'Tourism Customer',
      phone: '+44 20 1234 5678',
      country: 'United Kingdom',
      preferredLanguage: PreferredLanguage.ARABIC,
      preferredDestination: 'Kerala',
      accommodationRequired: true,
      numberOfTravelers: 2,
    } as CreateTourismEnquiryDto);

    const [enquiry, details] = committedRecords as [
      Enquiry,
      TourismEnquiryDetails,
    ];
    expect(dataSource.transaction).toHaveBeenCalledOnce();
    expect(enquiry).toMatchObject({
      type: EnquiryType.TOURISM,
      status: EnquiryStatus.NEW,
      customerName: 'Tourism Customer',
      preferredLanguage: PreferredLanguage.ARABIC,
    });
    expect(enquiry.enquiryNumber).toMatch(/^ENQ-[A-F0-9]{26}$/);
    expect(details).toMatchObject({
      enquiry,
      preferredDestination: 'Kerala',
      accommodationRequired: true,
      numberOfTravelers: 2,
      travelStartDate: null,
      travelEndDate: null,
    });
    expect(details.enquiry.id).toBe(enquiry.id);
    expect(manager.save).toHaveBeenNthCalledWith(2, details);
    expect(result.enquiryNumber).toBe(enquiry.enquiryNumber);
  });

  it('does not commit the main record if saving details fails', async () => {
    manager.save
      .mockImplementationOnce(async (record: object) => {
        stagedRecords.push(record);
        return record;
      })
      .mockRejectedValueOnce(new Error('database unavailable'));

    await expect(
      service.createMedical({
        customerName: 'Medical Customer',
        phone: '+1 555 0100',
        country: 'United States',
        preferredLanguage: PreferredLanguage.ENGLISH,
        treatmentSpecialty: 'Cardiology',
      } as CreateMedicalEnquiryDto),
    ).rejects.toThrow('database unavailable');

    expect(dataSource.transaction).toHaveBeenCalledOnce();
    expect(manager.save).toHaveBeenCalledTimes(2);
    expect(stagedRecords).toEqual([]);
    expect(committedRecords).toEqual([]);
  });

  it('rolls back a tourism enquiry when saving its linked details fails', async () => {
    manager.save
      .mockImplementationOnce(async (record: object) => {
        stagedRecords.push(record);
        return record;
      })
      .mockRejectedValueOnce(new Error('database unavailable'));

    await expect(
      service.createTourism({
        customerName: 'Tourism Customer',
        phone: '+44 20 1234 5678',
        country: 'United Kingdom',
        preferredLanguage: PreferredLanguage.ENGLISH,
        preferredDestination: 'Kerala',
        accommodationRequired: false,
      } as CreateTourismEnquiryDto),
    ).rejects.toThrow('database unavailable');

    expect(dataSource.transaction).toHaveBeenCalledOnce();
    expect(manager.save).toHaveBeenCalledTimes(2);
    expect(stagedRecords).toEqual([]);
    expect(committedRecords).toEqual([]);
  });
});

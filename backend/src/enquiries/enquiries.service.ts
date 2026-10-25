import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { Brackets, DataSource } from 'typeorm';
import { ActivityLog } from '../database/entities/activity-log.entity.js';
import { EnquiryNote } from '../database/entities/enquiry-note.entity.js';
import { Enquiry, EnquiryStatus, EnquiryType } from '../database/entities/enquiry.entity.js';
import { MedicalEnquiryDetails } from '../database/entities/medical-enquiry-details.entity.js';
import { TourismEnquiryDetails } from '../database/entities/tourism-enquiry-details.entity.js';
import type { SafeAdminProfile } from '../auth/types.js';
import { CreateMedicalEnquiryDto } from './dto/create-medical-enquiry.dto.js';
import { CreateTourismEnquiryDto } from './dto/create-tourism-enquiry.dto.js';
import { ActivityHistoryQueryDto } from './dto/activity-history-query.dto.js';
import { ListEnquiryNotesQueryDto } from './dto/list-enquiry-notes-query.dto.js';
import {
  ListEnquiriesQueryDto,
  SortOrder,
} from './dto/list-enquiries-query.dto.js';
import type { EnquirySortField } from './dto/list-enquiries-query.dto.js';

@Injectable()
export class EnquiriesService {
  constructor(private readonly dataSource: DataSource) {}

  async createNote(
    enquiryId: string,
    content: string,
    author: SafeAdminProfile,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const enquiry = await manager.findOneBy(Enquiry, { id: enquiryId });

      if (!enquiry) {
        return null;
      }

      const note = manager.create(EnquiryNote, {
        enquiryId: enquiry.id,
        adminUserId: author.id,
        content,
      });
      const savedNote = await manager.save(EnquiryNote, note);

      const activity = manager.create(ActivityLog, {
        enquiryId: enquiry.id,
        adminUserId: author.id,
        action: 'NOTE_ADDED',
        description: 'Internal enquiry note added',
        metadata: { noteId: savedNote.id },
      });
      await manager.save(ActivityLog, activity);

      return {
        id: savedNote.id,
        enquiryId: savedNote.enquiryId,
        content: savedNote.content,
        createdAt: savedNote.createdAt,
        author: {
          id: author.id,
          email: author.email,
        },
      };
    });
  }

  async listNotes(enquiryId: string, query: ListEnquiryNotesQueryDto) {
    const enquiryExists = await this.dataSource
      .getRepository(Enquiry)
      .existsBy({ id: enquiryId });

    if (!enquiryExists) {
      return null;
    }

    const [notes, total] = await this.dataSource
      .getRepository(EnquiryNote)
      .findAndCount({
        where: { enquiryId },
        relations: { adminUser: true },
        select: {
          id: true,
          enquiryId: true,
          adminUserId: true,
          content: true,
          createdAt: true,
          adminUser: {
            id: true,
            email: true,
          },
        },
        order: { createdAt: 'DESC', id: 'DESC' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      });

    return {
      data: notes.map((note) => ({
        id: note.id,
        enquiryId: note.enquiryId,
        content: note.content,
        createdAt: note.createdAt,
        author: {
          id: note.adminUser.id,
          email: note.adminUser.email,
        },
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async updateStatus(id: string, status: EnquiryStatus, adminUserId: string) {
    return this.dataSource.transaction(async (manager) => {
      const enquiry = await manager.findOne(Enquiry, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!enquiry) {
        return null;
      }

      if (enquiry.status === status) {
        return {
          message: 'Enquiry status unchanged',
          id: enquiry.id,
          status: enquiry.status,
          updatedAt: enquiry.updatedAt,
        };
      }

      const previousStatus = enquiry.status;
      enquiry.status = status;
      enquiry.updatedAt = new Date();
      await manager.save(Enquiry, enquiry);

      const activity = manager.create(ActivityLog, {
        enquiryId: enquiry.id,
        adminUserId,
        action: 'STATUS_CHANGED',
        description: `Enquiry status changed from ${previousStatus} to ${status}`,
        metadata: { previousStatus, newStatus: status },
      });
      await manager.save(ActivityLog, activity);

      return {
        message: 'Enquiry status updated successfully',
        id: enquiry.id,
        status: enquiry.status,
        updatedAt: enquiry.updatedAt,
      };
    });
  }

  async getActivityHistory(id: string, query: ActivityHistoryQueryDto) {
    const enquiryExists = await this.dataSource
      .getRepository(Enquiry)
      .existsBy({ id });

    if (!enquiryExists) {
      return null;
    }

    const [activities, total] = await this.dataSource
      .getRepository(ActivityLog)
      .findAndCount({
        where: { enquiryId: id },
        relations: { adminUser: true },
        select: {
          id: true,
          enquiryId: true,
          adminUserId: true,
          action: true,
          description: true,
          metadata: true,
          createdAt: true,
          adminUser: {
            id: true,
            email: true,
          },
        },
        order: { createdAt: 'DESC', id: 'DESC' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      });

    return {
      data: activities.map((activity) => ({
        id: activity.id,
        enquiryId: activity.enquiryId,
        adminUserId: activity.adminUserId,
        action: activity.action,
        description: activity.description,
        metadata: activity.metadata,
        createdAt: activity.createdAt,
        adminUser: activity.adminUser
          ? {
              id: activity.adminUser.id,
              email: activity.adminUser.email,
            }
          : null,
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async getById(id: string) {
    const enquiry = await this.dataSource
      .getRepository(Enquiry)
      .findOneBy({ id });

    if (!enquiry) {
      return null;
    }

    const commonFields = {
      id: enquiry.id,
      enquiryNumber: enquiry.enquiryNumber,
      type: enquiry.type,
      status: enquiry.status,
      customerName: enquiry.customerName,
      email: enquiry.email,
      phone: enquiry.phone,
      country: enquiry.country,
      preferredLanguage: enquiry.preferredLanguage,
      message: enquiry.message,
      createdAt: enquiry.createdAt,
      updatedAt: enquiry.updatedAt,
    };

    if (enquiry.type === EnquiryType.MEDICAL) {
      const details = await this.dataSource
        .getRepository(MedicalEnquiryDetails)
        .findOneBy({ enquiry: { id: enquiry.id } });

      return {
        ...commonFields,
        medicalDetails: details
          ? {
              id: details.id,
              treatmentSpecialty: details.treatmentSpecialty,
              preferredHospital: details.preferredHospital,
              preferredAppointmentDate: details.preferredAppointmentDate,
              travelCompanions: details.travelCompanions,
              additionalRequirements: details.additionalRequirements,
              createdAt: details.createdAt,
              updatedAt: details.updatedAt,
            }
          : null,
      };
    }

    const details = await this.dataSource
      .getRepository(TourismEnquiryDetails)
      .findOneBy({ enquiry: { id: enquiry.id } });

    return {
      ...commonFields,
      tourismDetails: details
        ? {
            id: details.id,
            preferredDestination: details.preferredDestination,
            travelStartDate: details.travelStartDate,
            travelEndDate: details.travelEndDate,
            numberOfTravelers: details.numberOfTravelers,
            travelInterests: details.travelInterests,
            accommodationRequired: details.accommodationRequired,
            additionalRequirements: details.additionalRequirements,
            createdAt: details.createdAt,
            updatedAt: details.updatedAt,
          }
        : null,
    };
  }

  async list(query: ListEnquiriesQueryDto) {
    const { page, limit, type, status, search, sortOrder } = query;
    const sortBy: EnquirySortField = query.sortBy ?? 'createdAt';
    const sortColumns: Record<EnquirySortField, string> = {
      createdAt: 'enquiry.createdAt',
      customerName: 'enquiry.customerName',
      enquiryNumber: 'enquiry.enquiryNumber',
    };
    const queryBuilder = this.dataSource
      .getRepository(Enquiry)
      .createQueryBuilder('enquiry')
      .select([
        'enquiry.id',
        'enquiry.enquiryNumber',
        'enquiry.type',
        'enquiry.status',
        'enquiry.customerName',
        'enquiry.email',
        'enquiry.phone',
        'enquiry.country',
        'enquiry.preferredLanguage',
        'enquiry.message',
        'enquiry.createdAt',
        'enquiry.updatedAt',
      ]);

    if (type) {
      queryBuilder.andWhere('enquiry.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('enquiry.status = :status', { status });
    }

    if (search) {
      const escapedSearch = search.replace(/[!%_]/g, '!$&');
      const searchPattern = `%${escapedSearch}%`;
      queryBuilder.andWhere(
        new Brackets((searchQuery) => {
          searchQuery
            .where("enquiry.enquiryNumber ILIKE :search ESCAPE '!'", {
              search: searchPattern,
            })
            .orWhere("enquiry.customerName ILIKE :search ESCAPE '!'", {
              search: searchPattern,
            })
            .orWhere("enquiry.email ILIKE :search ESCAPE '!'", {
              search: searchPattern,
            })
            .orWhere("enquiry.phone ILIKE :search ESCAPE '!'", {
              search: searchPattern,
            });
        }),
      );
    }

    queryBuilder
      .orderBy(sortColumns[sortBy], sortOrder ?? SortOrder.DESC)
      .addOrderBy('enquiry.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [enquiries, total] = await queryBuilder.getManyAndCount();

    return {
      data: enquiries.map((enquiry) => ({
        id: enquiry.id,
        enquiryNumber: enquiry.enquiryNumber,
        type: enquiry.type,
        status: enquiry.status,
        customerName: enquiry.customerName,
        email: enquiry.email,
        phone: enquiry.phone,
        country: enquiry.country,
        preferredLanguage: enquiry.preferredLanguage,
        message: enquiry.message,
        createdAt: enquiry.createdAt,
        updatedAt: enquiry.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createMedical(dto: CreateMedicalEnquiryDto) {
    const enquiryNumber = this.createEnquiryNumber();

    await this.dataSource.transaction(async (manager) => {
      const enquiry = manager.create(Enquiry, {
        enquiryNumber,
        type: EnquiryType.MEDICAL,
        status: EnquiryStatus.NEW,
        customerName: dto.customerName,
        email: dto.email ?? null,
        phone: dto.phone,
        country: dto.country,
        preferredLanguage: dto.preferredLanguage,
        message: dto.message ?? null,
      });
      await manager.save(enquiry);

      const details = manager.create(MedicalEnquiryDetails, {
        enquiry,
        treatmentSpecialty: dto.treatmentSpecialty,
        preferredHospital: dto.preferredHospital ?? null,
        preferredAppointmentDate: dto.preferredAppointmentDate ?? null,
        travelCompanions: dto.travelCompanions ?? null,
        additionalRequirements: dto.additionalRequirements ?? null,
      });
      await manager.save(details);
    });

    return {
      message: 'Enquiry submitted successfully',
      enquiryNumber,
    };
  }

  async createTourism(dto: CreateTourismEnquiryDto) {
    const enquiryNumber = this.createEnquiryNumber();

    await this.dataSource.transaction(async (manager) => {
      const enquiry = manager.create(Enquiry, {
        enquiryNumber,
        type: EnquiryType.TOURISM,
        status: EnquiryStatus.NEW,
        customerName: dto.customerName,
        email: dto.email ?? null,
        phone: dto.phone,
        country: dto.country,
        preferredLanguage: dto.preferredLanguage,
        message: dto.message ?? null,
      });
      await manager.save(enquiry);

      const details = manager.create(TourismEnquiryDetails, {
        enquiry,
        preferredDestination: dto.preferredDestination ?? 'Kerala',
        travelStartDate: dto.travelStartDate ?? null,
        travelEndDate: dto.travelEndDate ?? null,
        numberOfTravelers: dto.numberOfTravelers ?? null,
        travelInterests: dto.travelInterests ?? null,
        accommodationRequired: dto.accommodationRequired,
        additionalRequirements: dto.additionalRequirements ?? null,
      });
      await manager.save(details);
    });

    return {
      message: 'Enquiry submitted successfully',
      enquiryNumber,
    };
  }

  private createEnquiryNumber(): string {
    return `ENQ-${randomBytes(13).toString('hex').toUpperCase()}`;
  }
}

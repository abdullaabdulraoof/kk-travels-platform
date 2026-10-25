import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Patch,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { OwnerGuard } from '../auth/owner.guard.js';
import type { SafeAdminProfile } from '../auth/types.js';
import { ActivityHistoryQueryDto } from './dto/activity-history-query.dto.js';
import { CreateEnquiryNoteDto } from './dto/create-enquiry-note.dto.js';
import { CreateMedicalEnquiryDto } from './dto/create-medical-enquiry.dto.js';
import { ListEnquiryNotesQueryDto } from './dto/list-enquiry-notes-query.dto.js';
import { CreateTourismEnquiryDto } from './dto/create-tourism-enquiry.dto.js';
import { ListEnquiriesQueryDto } from './dto/list-enquiries-query.dto.js';
import { UpdateEnquiryStatusDto } from './dto/update-enquiry-status.dto.js';
import { EnquiriesService } from './enquiries.service.js';

@Controller('enquiries')
export class EnquiriesController {
  constructor(private readonly enquiriesService: EnquiriesService) {}

  @UseGuards(JwtAuthGuard, OwnerGuard)
  @Get()
  list(@Query() query: ListEnquiriesQueryDto) {
    return this.enquiriesService.list(query);
  }

  @UseGuards(JwtAuthGuard, OwnerGuard)
  @Get(':id')
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    const enquiry = await this.enquiriesService.getById(id);

    if (!enquiry) {
      throw new NotFoundException('Enquiry not found');
    }

    return enquiry;
  }

  @UseGuards(JwtAuthGuard, OwnerGuard)
  @Patch(':id/status')
  async updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateEnquiryStatusDto,
    @Req() request: { user: SafeAdminProfile },
  ) {
    const result = await this.enquiriesService.updateStatus(
      id,
      dto.status,
      request.user.id,
    );

    if (!result) {
      throw new NotFoundException('Enquiry not found');
    }

    return result;
  }

  @UseGuards(JwtAuthGuard, OwnerGuard)
  @Get(':id/activity')
  async getActivityHistory(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() query: ActivityHistoryQueryDto,
  ) {
    const result = await this.enquiriesService.getActivityHistory(id, query);

    if (!result) {
      throw new NotFoundException('Enquiry not found');
    }

    return result;
  }

  @UseGuards(JwtAuthGuard, OwnerGuard)
  @Post(':id/notes')
  async createNote(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateEnquiryNoteDto,
    @Req() request: { user: SafeAdminProfile },
  ) {
    const note = await this.enquiriesService.createNote(
      id,
      dto.content,
      request.user,
    );

    if (!note) {
      throw new NotFoundException('Enquiry not found');
    }

    return note;
  }

  @UseGuards(JwtAuthGuard, OwnerGuard)
  @Get(':id/notes')
  async listNotes(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() query: ListEnquiryNotesQueryDto,
  ) {
    const result = await this.enquiriesService.listNotes(id, query);

    if (!result) {
      throw new NotFoundException('Enquiry not found');
    }

    return result;
  }

  @Post('medical')
  createMedical(@Body() dto: CreateMedicalEnquiryDto) {
    return this.enquiriesService.createMedical(dto);
  }

  @Post('tourism')
  createTourism(@Body() dto: CreateTourismEnquiryDto) {
    return this.enquiriesService.createTourism(dto);
  }
}

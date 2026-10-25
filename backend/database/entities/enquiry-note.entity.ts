import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

import { Enquiry } from './enquiry.entity.js';
import { AdminUser } from './admin-user.entity.js';

@Entity('enquiry_notes')
@Index('idx_enquiry_notes_enquiry_created', ['enquiryId', 'createdAt'])
export class EnquiryNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'enquiry_id',
    type: 'uuid',
  })
  enquiryId: string;

  @ManyToOne(() => Enquiry, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'enquiry_id',
  })
  enquiry: Enquiry;

  @Column({
    name: 'admin_user_id',
    type: 'uuid',
  })
  adminUserId: string;

  @ManyToOne(() => AdminUser, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'admin_user_id',
  })
  adminUser: AdminUser;

  @Column({
    type: 'text',
  })
  content: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;
}
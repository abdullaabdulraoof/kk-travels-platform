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

@Entity('activity_logs')
@Index('idx_activity_logs_enquiry_created', ['enquiryId', 'createdAt'])
export class ActivityLog {
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
    nullable: true,
  })
  adminUserId: string | null;

  @ManyToOne(() => AdminUser, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'admin_user_id',
  })
  adminUser: AdminUser | null;

  @Column({
    type: 'varchar',
    length: 100,
  })
  action: string;

  @Column({
    name: 'description',
    type: 'text',
  })
  description: string;

  @Column({
    name: 'metadata',
    type: 'jsonb',
    nullable: true,
  })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;
}
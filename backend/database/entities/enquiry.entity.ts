import {
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    UpdateDateColumn, 
    Index
} from "typeorm";

export enum EnquiryType {
  MEDICAL = 'MEDICAL',
  TOURISM = 'TOURISM',
}

export enum EnquiryStatus {
  NEW = 'NEW',
  REVIEWING = 'REVIEWING',
  CONTACTED = 'CONTACTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PreferredLanguage {
  ENGLISH = 'ENGLISH',
  ARABIC = 'ARABIC',
}

@Entity('enquiries')
@Index('idx_enquiries_type_status', ['type', 'status'])
@Index('idx_enquiries_created_at', ['createdAt'])
export class Enquiry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({
    name: 'enquiry_number',
    type: 'varchar',
    length: 30,
  })
  enquiryNumber: string;

  @Column({
    type: 'enum',
    enum: EnquiryType,
    enumName: 'enquiry_type_enum',
  })
  type: EnquiryType;

  @Column({
    type: 'enum',
    enum: EnquiryStatus,
    enumName: 'enquiry_status_enum',
    default: EnquiryStatus.NEW,
  })
  status: EnquiryStatus;

  @Column({
    name: 'customer_name',
    type: 'varchar',
    length: 150,
  })
  customerName: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  email: string | null;

  @Column({
    type: 'varchar',
    length: 30,
  })
  phone: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  country: string;

  @Column({
    name: 'preferred_language',
    type: 'enum',
    enum: PreferredLanguage,
    enumName: 'preferred_language_enum',
    default: PreferredLanguage.ENGLISH,
  })
  preferredLanguage: PreferredLanguage;

  @Column({
    type: 'text',
    nullable: true,
  })
  message: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt: Date;
}
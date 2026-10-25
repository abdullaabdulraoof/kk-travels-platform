import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Enquiry } from './enquiry.entity.js';

@Entity('medical_enquiry_details')
export class MedicalEnquiryDetails {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Enquiry, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'enquiry_id',
    referencedColumnName: 'id',
  })
  enquiry: Enquiry;

  @Column({
    name: 'enquiry_id',
    type: 'uuid',
    unique: true,
  })
  enquiryId: string;

  @Column({
    name: 'treatment_specialty',
    type: 'varchar',
    length: 150,
  })
  treatmentSpecialty: string;

  @Column({
    name: 'preferred_hospital',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  preferredHospital: string | null;

  @Column({
    name: 'preferred_appointment_date',
    type: 'date',
    nullable: true,
  })
  preferredAppointmentDate: string | null;

  @Column({
    name: 'travel_companions',
    type: 'smallint',
    nullable: true,
  })
  travelCompanions: number | null;

  @Column({
    name: 'additional_requirements',
    type: 'text',
    nullable: true,
  })
  additionalRequirements: string | null;

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
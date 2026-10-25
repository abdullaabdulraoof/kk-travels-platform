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

@Entity('tourism_enquiry_details')
export class TourismEnquiryDetails {
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
    name: 'preferred_destination',
    type: 'varchar',
    length: 200,
    default: 'Kerala', 
  })
  preferredDestination: string;

  @Column({
    name: 'travel_start_date',
    type: 'date',
    nullable: true,
  })
  travelStartDate: string | null;

  @Column({
    name: 'travel_end_date',
    type: 'date',
    nullable: true,
  })
  travelEndDate: string | null;

  @Column({
    name: 'number_of_travelers',
    type: 'smallint',
    nullable: true,
  })
  numberOfTravelers: number | null;

  @Column({
    name: 'travel_interests',
    type: 'text',
    nullable: true,
  })
  travelInterests: string | null;

  @Column({
    name: 'accommodation_required',
    type: 'boolean',
    default: false,
  })
  accommodationRequired: boolean;

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
import {
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    UpdateDateColumn, 
    Index
} from "typeorm";

export enum AdminRole {
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
}

@Entity('admin_users')
export class AdminUser {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 255 })
    email: string;

    @Column({ name:'password_hash', type: 'varchar', length: 255 })
    passwordHash: string;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'varchar', length: 20, default: AdminRole.ADMIN })
    role: AdminRole;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
    updatedAt: Date;

}

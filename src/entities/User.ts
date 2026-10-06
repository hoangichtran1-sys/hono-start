import uniqueSlug from "unique-slug";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    BeforeInsert,
    BeforeUpdate,
    AfterLoad,
} from "typeorm";
import { env } from "@/configs/env";
import type { RefreshToken } from "./RefreshToken";

@Entity({ name: "users" })
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "varchar", length: 255, unique: true })
    email!: string;

    @Column({ type: "text", unique: true })
    slug!: string;

    @Column({ type: "timestamptz", nullable: true })
    emailVerifiedAt!: Date | null;

    @Column({ type: "text", nullable: true })
    avatarUrl!: string | null;

    @Column({ type: "text" })
    password!: string;

    @OneToMany("RefreshToken", (refreshToken: RefreshToken) => refreshToken.user)
    refreshTokens!: RefreshToken[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    isAdmin!: boolean;

    @AfterLoad()
    checkAdmin() {
        this.isAdmin = this.email === env.EMAIL_ADMIN;
    }

    @BeforeInsert()
    @BeforeUpdate()
    generateSlug() {
        this.slug = `${this.name}-${uniqueSlug()}`;
    }

    @BeforeInsert()
    @BeforeUpdate()
    formatEmail() {
        this.email = this.email.trim().toLowerCase();
    }
}

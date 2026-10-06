import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import type { User } from "./User";

@Entity({ name: "refresh_tokens" })
@Index(["revoked", "expiresAt"])
export class RefreshToken {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "uuid" })
    @Index()
    userId!: string;

    @Column({ type: "text", unique: true })
    token!: string;

    @Column({ type: "boolean", default: false })
    revoked!: Boolean;

    @Column({ type: "timestamptz" })
    expiresAt!: Date;

    @Column({ type: "uuid", nullable: true, name: "replacedBy" })
    @Index()
    replacedBy!: string | null;

    @ManyToOne("User", (user: User) => user.refreshTokens, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user!: User;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

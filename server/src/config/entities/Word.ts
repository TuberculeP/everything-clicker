import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity()
export class Word {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 67 })
  word: string;

  // Duplicate detection key from wordKey(), never sent to the front
  @Index({ unique: true })
  @Column({ type: "varchar", length: 255, select: false })
  key: string;

  @Index()
  @Column({ type: "integer", default: 0 })
  count: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

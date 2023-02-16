import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  from_id!: number;

  @Column()
  to_id!: number;

  @Column()
  message!: string;
}

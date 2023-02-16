import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  owner_id!: number;

  @Column({ unique: true })
  name!: string;

  @ManyToMany((type) => User, (user) => user.groups)
  @JoinTable()
  users!: User[];
}

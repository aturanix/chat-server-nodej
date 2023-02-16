import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Group } from "./Group";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column()
  hash!: string;

  @ManyToMany((type) => Group, (group) => group.users)
  groups!: Group[];
}

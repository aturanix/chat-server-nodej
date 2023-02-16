import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class GroupMessage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  from_user_id!: number;

  @Column()
  to_group_id!: number;

  @Column()
  message!: string;
}

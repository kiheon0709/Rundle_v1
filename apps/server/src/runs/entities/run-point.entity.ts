import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Run } from './run.entity';

@Entity('run_points')
@Unique(['runId', 'seq'])
@Index(['runId', 'seq'])
export class RunPoint {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ name: 'run_id', type: 'uuid' })
  @Index()
  runId: string;

  @ManyToOne(() => Run, (run) => run.points, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'run_id' })
  run: Run;

  @Column({ type: 'int' })
  seq: number;

  @Column({ name: 'recorded_at', type: 'timestamptz' })
  recordedAt: Date;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  loc: string;

  @Column({ name: 'elevation_m', type: 'real', nullable: true })
  elevationM: number | null;

  @Column({ name: 'speed_mps', type: 'real', nullable: true })
  speedMps: number | null;

  @Column({ name: 'bearing_deg', type: 'real', nullable: true })
  bearingDeg: number | null;

  @Column({ name: 'accuracy_m', type: 'real', nullable: true })
  accuracyM: number | null;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;
}

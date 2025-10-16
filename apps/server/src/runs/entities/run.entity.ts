import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { RunPoint } from './run-point.entity';

export enum RunMode {
  COURSE = 'course',
  FREE = 'free',
}

export enum RunStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('runs')
@Index(['userId', 'status', 'startedAt'])
export class Run {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'course_id', type: 'uuid', nullable: true })
  courseId: string | null;

  @Column({
    type: 'enum',
    enum: RunMode,
    default: RunMode.FREE,
  })
  mode: RunMode;

  @Column({
    type: 'enum',
    enum: RunStatus,
    default: RunStatus.IN_PROGRESS,
  })
  status: RunStatus;

  @CreateDateColumn({ name: 'started_at' })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'duration_s', type: 'int', nullable: true })
  durationS: number | null;

  @Column({ name: 'distance_m', type: 'int', nullable: true })
  distanceM: number | null;

  @Column({ name: 'avg_pace_s_per_km', type: 'int', nullable: true })
  avgPaceSPerKm: number | null;

  @Column({ name: 'elevation_gain_m', type: 'real', nullable: true })
  elevationGainM: number | null;

  @Column({ name: 'off_route_alerts', type: 'int', default: 0 })
  offRouteAlerts: number;

  @Column({ name: 'is_personal_record', type: 'boolean', default: false })
  isPersonalRecord: boolean;

  @Column({
    name: 'poly_simplified',
    type: 'geometry',
    spatialFeatureType: 'LineString',
    srid: 4326,
    nullable: true,
  })
  polySimplified: string | null;

  @Column({ name: 'geojson_summary', type: 'jsonb', nullable: true })
  geojsonSummary: any | null;

  @Column({ name: 'converted_course_id', type: 'uuid', nullable: true })
  convertedCourseId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => RunPoint, (point) => point.run)
  points: RunPoint[];
}

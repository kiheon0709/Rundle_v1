import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Run, RunMode, RunStatus } from '../entities/run.entity';
import { RunPoint } from '../entities/run-point.entity';
import { CreateRunDto } from '../dtos/create-run.dto';
import { UploadPointsDto } from '../dtos/upload-points.dto';

@Injectable()
export class RunsService {
  private readonly logger = new Logger(RunsService.name);

  constructor(
    @InjectRepository(Run)
    private runsRepository: Repository<Run>,
    @InjectRepository(RunPoint)
    private runPointsRepository: Repository<RunPoint>,
  ) {}

  /**
   * 런 시작
   */
  async createRun(userId: string, createRunDto: CreateRunDto): Promise<Run> {
    const { mode, courseId } = createRunDto;

    // 코스 모드에서는 courseId 필수
    if (mode === RunMode.COURSE && !courseId) {
      throw new BadRequestException('Course mode requires courseId');
    }

    const run = this.runsRepository.create({
      userId,
      mode,
      courseId: mode === RunMode.COURSE ? courseId : null,
      status: RunStatus.IN_PROGRESS,
    });

    return await this.runsRepository.save(run);
  }

  /**
   * GPS 포인트 배치 업로드
   */
  async uploadPoints(
    runId: string,
    userId: string,
    uploadPointsDto: UploadPointsDto,
  ): Promise<{ saved: number; skipped: number }> {
    const run = await this.findRunByIdAndUser(runId, userId);

    if (run.status !== RunStatus.IN_PROGRESS) {
      throw new BadRequestException('Can only upload points to in-progress runs');
    }

    let saved = 0;
    let skipped = 0;

    // 포인트를 순차적으로 저장, 중복(runId, seq) 발생 시 스킵
    for (const pointDto of uploadPointsDto.points) {
      try {
        // TypeORM의 geometry 타입을 위해 raw SQL 사용
        await this.runPointsRepository.query(
          `
          INSERT INTO run_points (run_id, seq, recorded_at, loc, elevation_m, speed_mps, bearing_deg, accuracy_m)
          VALUES ($1, $2, $3, ST_SetSRID(ST_GeomFromText($4), 4326), $5, $6, $7, $8)
          ON CONFLICT (run_id, seq) DO NOTHING
          `,
          [
            runId,
            pointDto.seq,
            new Date(pointDto.recordedAt),
            `POINT(${pointDto.lng} ${pointDto.lat})`,
            pointDto.elevationM ?? null,
            pointDto.speedMps ?? null,
            pointDto.bearingDeg ?? null,
            pointDto.accuracyM ?? null,
          ],
        );
        saved++;
      } catch (error) {
        // UNIQUE 제약 조건 위반은 ON CONFLICT로 처리되므로 다른 에러만 throw
        if (error.code !== '23505') {
          throw error;
        }
        skipped++;
      }
    }

    this.logger.log(`Uploaded points for run ${runId}: saved=${saved}, skipped=${skipped}`);

    return { saved, skipped };
  }

  /**
   * 런 완료
   */
  async completeRun(runId: string, userId: string): Promise<Run> {
    const run = await this.findRunByIdAndUser(runId, userId);

    if (run.status !== RunStatus.IN_PROGRESS) {
      throw new BadRequestException('Run is not in progress');
    }

    // 완료 시간 및 duration 계산
    const completedAt = new Date();
    const durationS = Math.floor(
      (completedAt.getTime() - run.startedAt.getTime()) / 1000,
    );

    // poly_simplified 생성 (PostGIS ST_Simplify 사용)
    await this.runsRepository
      .createQueryBuilder()
      .update(Run)
      .set({
        status: RunStatus.COMPLETED,
        completedAt,
        durationS,
        polySimplified: () => `
          ST_Simplify(
            ST_MakeLine(ARRAY(
              SELECT loc FROM run_points
              WHERE run_id = '${runId}'
              ORDER BY seq
            )),
            0.0001
          )
        `,
      })
      .where('id = :runId', { runId })
      .execute();

    // 거리 계산 (ST_Length)
    const result = await this.runsRepository
      .createQueryBuilder('run')
      .select(
        'ST_Length(ST_Transform(run.poly_simplified, 3857))::integer',
        'distance',
      )
      .where('run.id = :runId', { runId })
      .getRawOne();

    const distanceM = result?.distance || 0;
    const avgPaceSPerKm = distanceM > 0 ? Math.floor((durationS / distanceM) * 1000) : null;

    // 거리 및 페이스 업데이트
    await this.runsRepository.update(runId, {
      distanceM,
      avgPaceSPerKm,
    });

    return await this.findRunById(runId);
  }

  /**
   * 런 취소
   */
  async cancelRun(runId: string, userId: string): Promise<Run> {
    const run = await this.findRunByIdAndUser(runId, userId);

    if (run.status !== RunStatus.IN_PROGRESS) {
      throw new BadRequestException('Run is not in progress');
    }

    run.status = RunStatus.CANCELLED;
    return await this.runsRepository.save(run);
  }

  /**
   * 런 상세 조회
   */
  async findRunById(runId: string): Promise<Run> {
    const run = await this.runsRepository.findOne({
      where: { id: runId },
    });

    if (!run) {
      throw new NotFoundException('Run not found');
    }

    return run;
  }

  /**
   * 사용자의 런 조회
   */
  async findRunsByUser(userId: string): Promise<Run[]> {
    return await this.runsRepository.find({
      where: { userId },
      order: { startedAt: 'DESC' },
    });
  }

  /**
   * 런 조회 (소유자 확인)
   */
  private async findRunByIdAndUser(runId: string, userId: string): Promise<Run> {
    const run = await this.runsRepository.findOne({
      where: { id: runId, userId },
    });

    if (!run) {
      throw new NotFoundException('Run not found');
    }

    return run;
  }
}

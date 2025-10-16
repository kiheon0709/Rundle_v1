import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RunsService } from '../services/runs.service';
import { CreateRunDto } from '../dtos/create-run.dto';
import { UploadPointsDto } from '../dtos/upload-points.dto';

@Controller('runs')
@UseGuards(JwtAuthGuard)
export class RunsController {
  constructor(private readonly runsService: RunsService) {}

  /**
   * POST /runs - 런 시작
   */
  @Post()
  async createRun(@Req() req: any, @Body() createRunDto: CreateRunDto) {
    const userId = req.user.userId;
    return await this.runsService.createRun(userId, createRunDto);
  }

  /**
   * POST /runs/:id/points - GPS 포인트 배치 업로드
   */
  @Post(':id/points')
  async uploadPoints(
    @Req() req: any,
    @Param('id') runId: string,
    @Body() uploadPointsDto: UploadPointsDto,
  ) {
    const userId = req.user.userId;
    return await this.runsService.uploadPoints(runId, userId, uploadPointsDto);
  }

  /**
   * PATCH /runs/:id/complete - 런 완료
   */
  @Patch(':id/complete')
  async completeRun(@Req() req: any, @Param('id') runId: string) {
    const userId = req.user.userId;
    return await this.runsService.completeRun(runId, userId);
  }

  /**
   * PATCH /runs/:id/cancel - 런 취소
   */
  @Patch(':id/cancel')
  async cancelRun(@Req() req: any, @Param('id') runId: string) {
    const userId = req.user.userId;
    return await this.runsService.cancelRun(runId, userId);
  }

  /**
   * GET /runs/:id - 런 상세 조회
   */
  @Get(':id')
  async getRunById(@Param('id') runId: string) {
    return await this.runsService.findRunById(runId);
  }

  /**
   * GET /runs/me - 내 런 기록 목록
   */
  @Get('me/list')
  async getMyRuns(@Req() req: any) {
    const userId = req.user.userId;
    return await this.runsService.findRunsByUser(userId);
  }
}

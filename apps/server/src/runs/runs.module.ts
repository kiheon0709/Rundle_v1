import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Run } from './entities/run.entity';
import { RunPoint } from './entities/run-point.entity';
import { RunsService } from './services/runs.service';
import { RunsController } from './controllers/runs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Run, RunPoint])],
  controllers: [RunsController],
  providers: [RunsService],
  exports: [RunsService],
})
export class RunsModule {}

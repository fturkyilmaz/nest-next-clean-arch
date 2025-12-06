import { Module } from '@nestjs/common';
import { DietPlanController } from './dietplan.controller';
import { DietPlanService } from './dietplan.service';

@Module({
  controllers: [DietPlanController],
  providers: [DietPlanService],
})
export class DietPlanModule {}

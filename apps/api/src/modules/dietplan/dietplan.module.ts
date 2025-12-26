import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RepositoryModule } from '@infrastructure/repositories/RepositoryModule';
import { DietPlanController } from './dietplan.controller';
import {
  CreateDietPlanCommandHandler,
  ActivateDietPlanCommandHandler,
  GetDietPlansByClientQueryHandler,
  GetAllDietPlansHandler,
} from '@application/use-cases/diet-plan';

const CommandHandlers = [CreateDietPlanCommandHandler, ActivateDietPlanCommandHandler];
const QueryHandlers = [GetDietPlansByClientQueryHandler, GetAllDietPlansHandler];

@Module({
  imports: [CqrsModule, RepositoryModule],
  controllers: [DietPlanController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class DietPlanModule { }

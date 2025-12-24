#!/bin/bash

# Base paths (adjust if your monorepo differs)
API_BASE="apps/api/src"
MODULES_BASE="$API_BASE/modules"
APP_BASE="packages/application/src"
DOMAIN_BASE="packages/domain/src"
INFRA_BASE="packages/infrastructure/src"

modules=(appointment food meal metric audit event report)

# Helper: PascalCase first letter for class names
pascal() { echo "$1" | awk '{print toupper(substr($0,1,1)) substr($0,2)}'; }

# Create directories
for module in "${modules[@]}"; do
  PASCAL=$(pascal "$module")
  echo "Scaffolding $PASCAL..."

  # Module folders
  mkdir -p "$MODULES_BASE/$module/dto"
  mkdir -p "$APP_BASE/use-cases/$module"
  mkdir -p "$DOMAIN_BASE/repositories"
  mkdir -p "$INFRA_BASE/repositories"

  # ---------- DOMAIN REPOSITORY INTERFACE ----------
  cat > "$DOMAIN_BASE/repositories/${PASCAL}Repository.ts" <<EOL
export interface ${PASCAL}Repository {
  create(data: any): Promise<any>;
  findAll(): Promise<any[]>;
  findById(id: string): Promise<any | null>;
}
EOL

  # ---------- INFRA REPOSITORY (PRISMA) ----------
  PRISMA_TABLE="$module"
  # Map table names when they differ from module name
  case "$module" in
    appointment) PRISMA_TABLE="appointment" ;;
    food) PRISMA_TABLE="foodItem" ;;             # food_items
    meal) PRISMA_TABLE="meal" ;;
    metric) PRISMA_TABLE="clientMetric" ;;       # client_metrics
    audit) PRISMA_TABLE="auditLog" ;;            # audit_logs
    event) PRISMA_TABLE="eventStore" ;;          # event_store
    report) PRISMA_TABLE="" ;;                   # reports are aggregated, no table
  esac

  cat > "$INFRA_BASE/repositories/Prisma${PASCAL}Repository.ts" <<EOL
import { ${PASCAL}Repository } from '@domain/repositories/${PASCAL}Repository';
import { prisma } from 'prisma/lib/prisma';

export class Prisma${PASCAL}Repository implements ${PASCAL}Repository {
  async create(data: any): Promise<any> {
    ${PRISMA_TABLE:+return prisma.$PRISMA_TABLE.create({ data });}
    ${PRISMA_TABLE:+"/* If this is an aggregate/report, replace with aggregation write or noop */"}
    ${PRISMA_TABLE:+"/* For report: throw new Error('Report write not supported'); */"}
    ${PRISMA_TABLE:?"return {}; // TODO: implement"}
  }

  async findAll(): Promise<any[]> {
    ${PRISMA_TABLE:+return prisma.$PRISMA_TABLE.findMany();}
    ${PRISMA_TABLE:?"return []; // TODO: implement"}
  }

  async findById(id: string): Promise<any | null> {
    ${PRISMA_TABLE:+return prisma.$PRISMA_TABLE.findUnique({ where: { id } });}
    ${PRISMA_TABLE:?"return null; // TODO: implement"}
  }
}
EOL

  # ---------- APPLICATION USE CASES ----------
  # CreateCommand/UseCase
  cat > "$APP_BASE/use-cases/$module/Create${PASCAL}UseCase.ts" <<EOL
import { ICommand, ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { ${PASCAL}Repository } from '@domain/repositories/${PASCAL}Repository';

export class Create${PASCAL}Command implements ICommand {
  constructor(public readonly data: any) {}
}

@CommandHandler(Create${PASCAL}Command)
export class Create${PASCAL}UseCase implements ICommandHandler<Create${PASCAL}Command> {
  constructor(private readonly repo: ${PASCAL}Repository) {}

  async execute(command: Create${PASCAL}Command) {
    return this.repo.create(command.data);
  }
}
EOL

  # GetAllQuery/UseCase
  cat > "$APP_BASE/use-cases/$module/GetAll${PASCAL}UseCase.ts" <<EOL
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ${PASCAL}Repository } from '@domain/repositories/${PASCAL}Repository';

export class GetAll${PASCAL}Query implements IQuery {}

@QueryHandler(GetAll${PASCAL}Query)
export class GetAll${PASCAL}UseCase implements IQueryHandler<GetAll${PASCAL}Query> {
  constructor(private readonly repo: ${PASCAL}Repository) {}

  async execute(): Promise<any[]> {
    return this.repo.findAll();
  }
}
EOL

  # GetByIdQuery/UseCase
  cat > "$APP_BASE/use-cases/$module/Get${PASCAL}ByIdUseCase.ts" <<EOL
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ${PASCAL}Repository } from '@domain/repositories/${PASCAL}Repository';

export class Get${PASCAL}ByIdQuery implements IQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(Get${PASCAL}ByIdQuery)
export class Get${PASCAL}ByIdUseCase implements IQueryHandler<Get${PASCAL}ByIdQuery> {
  constructor(private readonly repo: ${PASCAL}Repository) {}

  async execute(query: Get${PASCAL}ByIdQuery): Promise<any | null> {
    return this.repo.findById(query.id);
  }
}
EOL

  # ---------- MODULE CONTROLLER ----------
  # Base route pluralization
  ROUTE="${module}s"
  [ "$module" = "audit" ] && ROUTE="audits"
  [ "$module" = "metric" ] && ROUTE="metrics"

  cat > "$MODULES_BASE/$module/${module}.controller.ts" <<EOL
import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Create${PASCAL}Command } from '@application/use-cases/$module/Create${PASCAL}UseCase';
import { GetAll${PASCAL}Query } from '@application/use-cases/$module/GetAll${PASCAL}UseCase';
import { Get${PASCAL}ByIdQuery } from '@application/use-cases/$module/Get${PASCAL}ByIdUseCase';

@ApiTags('${PASCAL}')
@Controller('${ROUTE}')
export class ${PASCAL}Controller {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: 'Get all ${module}s' })
  @ApiResponse({ status: 200, description: 'List returned' })
  async findAll() {
    return this.queryBus.execute(new GetAll${PASCAL}Query());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ${module} by id' })
  @ApiResponse({ status: 200, description: 'Item returned' })
  async findOne(@Param('id') id: string) {
    return this.queryBus.execute(new Get${PASCAL}ByIdQuery(id));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create ${module}' })
  @ApiResponse({ status: 201, description: 'Created successfully' })
  async create(@Body() dto: any) {
    return this.commandBus.execute(new Create${PASCAL}Command(dto));
  }
}
EOL

  # ---------- MODULE SERVICE (Mediator for repo if needed) ----------
  cat > "$MODULES_BASE/$module/${module}.service.ts" <<EOL
import { Injectable } from '@nestjs/common';

@Injectable()
export class ${PASCAL}Service {}
EOL

  # ---------- MODULE WIRING ----------
  cat > "$MODULES_BASE/$module/${module}.module.ts" <<EOL
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ${PASCAL}Controller } from './${module}.controller';
import { ${PASCAL}Service } from './${module}.service';
import { Create${PASCAL}UseCase } from '@application/use-cases/${module}/Create${PASCAL}UseCase';
import { GetAll${PASCAL}UseCase } from '@application/use-cases/${module}/GetAll${PASCAL}UseCase';
import { Get${PASCAL}ByIdUseCase } from '@application/use-cases/${module}/Get${PASCAL}ByIdUseCase';
import { Prisma${PASCAL}Repository } from '@infrastructure/repositories/Prisma${PASCAL}Repository';

const commandHandlers = [Create${PASCAL}UseCase];
const queryHandlers = [GetAll${PASCAL}UseCase, Get${PASCAL}ByIdUseCase];

@Module({
  imports: [CqrsModule],
  controllers: [${PASCAL}Controller],
  providers: [
    ${PASCAL}Service,
    ...commandHandlers,
    ...queryHandlers,
    { provide: '${PASCAL}Repository', useClass: Prisma${PASCAL}Repository },
  ],
  exports: ['${PASCAL}Repository', ...commandHandlers, ...queryHandlers],
})
export class ${PASCAL}Module {}
EOL

  # ---------- DTO placeholder ----------
  echo "// DTOs for $module module" > "$MODULES_BASE/$module/dto/index.ts"

  echo "✅ $PASCAL scaffolding complete."
done

echo "🎯 All modules scaffolded. Don't forget to import each *Module into AppModule."

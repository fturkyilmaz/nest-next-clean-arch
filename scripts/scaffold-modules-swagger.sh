#!/bin/bash

BASE_PATH="apps/api/src/modules"

modules=(
  appointment
  food
  meal
  metric
  audit
  event
  report
)

for module in "${modules[@]}"; do
  MODULE_PATH="$BASE_PATH/$module"
  mkdir -p "$MODULE_PATH/dto"

  # Controller
  cat > "$MODULE_PATH/${module}.controller.ts" <<EOL
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ${module^}Service } from './${module}.service';

@ApiTags('${module^}')
@Controller('${module}s')
export class ${module^}Controller {
  constructor(private readonly service: ${module^}Service) {}

  @Get()
  @ApiOperation({ summary: 'Get all ${module}s' })
  @ApiResponse({ status: 200, description: 'List of ${module}s returned' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ${module} by id' })
  @ApiResponse({ status: 200, description: '${module^} detail returned' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new ${module}' })
  @ApiResponse({ status: 201, description: '${module^} created successfully' })
  create(@Body() dto: any) {
    return this.service.create(dto);
  }
}
EOL

  # Service
  cat > "$MODULE_PATH/${module}.service.ts" <<EOL
import { Injectable } from '@nestjs/common';

@Injectable()
export class ${module^}Service {
  findAll() {
    return [{ id: 1, name: '${module} sample' }];
  }

  findOne(id: string) {
    return { id, name: '${module} detail' };
  }

  create(dto: any) {
    return { id: Date.now(), ...dto };
  }
}
EOL

  # Module
  cat > "$MODULE_PATH/${module}.module.ts" <<EOL
import { Module } from '@nestjs/common';
import { ${module^}Controller } from './${module}.controller';
import { ${module^}Service } from './${module}.service';

@Module({
  controllers: [${module^}Controller],
  providers: [${module^}Service],
  exports: [${module^}Service],
})
export class ${module^}Module {}
EOL

  # DTO index
  echo "// DTOs for $module module" > "$MODULE_PATH/dto/index.ts"

  echo "✅ Scaffolded $module module with Swagger decorators at $MODULE_PATH"
done

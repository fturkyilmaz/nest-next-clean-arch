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

  echo "📦 Creating module: $module"

  mkdir -p "$MODULE_PATH/dto"

  touch "$MODULE_PATH/${module}.controller.ts"
  touch "$MODULE_PATH/${module}.service.ts"
  touch "$MODULE_PATH/${module}.module.ts"
  touch "$MODULE_PATH/dto/index.ts"

  echo "✅ $module module created at $MODULE_PATH"
done

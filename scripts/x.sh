#!/bin/bash

DOMAIN_REPO_PATH="packages/domain/src/interfaces/repositories"
modules=(appointment food meal metric audit event report)

pascal() { echo "$1" | awk '{print toupper(substr($0,1,1)) substr($0,2)}'; }

mkdir -p "$DOMAIN_REPO_PATH"

for module in "${modules[@]}"; do
  PASCAL=$(pascal "$module")
  FILE="$DOMAIN_REPO_PATH/I${PASCAL}Repository.ts"

  cat > "$FILE" <<EOL
export interface I${PASCAL}Repository {
  create(data: any): Promise<any>;
  findAll(): Promise<any[]>;
  findById(id: string): Promise<any | null>;
}
EOL

  echo "✅ Created $FILE"
done

echo "🎯 All missing repository interfaces scaffolded under $DOMAIN_REPO_PATH"

/**
 * Prisma Query Extensions for Soft Delete
 *
 * Extends Prisma with soft delete capabilities, hiding deleted records
 * by default while allowing explicit access when needed.
 */

export function createSoftDeleteExtension() {
  return {
    name: 'softDelete',
    query: {
      async $allOperations({ operation, model, args, query }: any) {
        // Skip audit logs and other special models
        const modelsToExclude = ['AuditLog', 'Session', 'RefreshToken'];
        if (modelsToExclude.includes(model)) {
          return query(args);
        }

        // For read operations, exclude soft-deleted records by default
        if (['findUnique', 'findFirst', 'findMany'].includes(operation)) {
          // Check if query is explicitly requesting deleted records (via paranoid: false)
          const paranoid = args.paranoid !== false;

          if (paranoid) {
            // Add deletedAt filter if not already present
            if (!args.where) args.where = {};

            if (!args.where.deletedAt) {
              args.where.deletedAt = null;
            }
          }
        }

        // For aggregate operations
        if (operation === 'aggregate') {
          if (!args.where) args.where = {};
          if (!args.where.deletedAt) {
            args.where.deletedAt = null;
          }
        }

        // For count operations
        if (operation === 'count') {
          if (!args.where) args.where = {};
          if (!args.where.deletedAt) {
            args.where.deletedAt = null;
          }
        }

        return query(args);
      },
    },
  };
}

/**
 * Helper type for models with soft delete
 */
export interface SoftDeleteModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  deletedReason?: string;
  deletedTags?: string[];
}

/**
 * Prisma scope helper for soft delete queries
 */
export class SoftDeleteScope {
  /**
   * Include deleted records in query
   */
  static includeDeleted() {
    return { paranoid: false };
  }

  /**
   * Only return deleted records
   */
  static onlyDeleted() {
    return { where: { deletedAt: { not: null } } };
  }

  /**
   * Exclude deleted records (default behavior)
   */
  static excludeDeleted() {
    return { where: { deletedAt: null } };
  }

  /**
   * Get deletion info if deleted
   */
  static getDeletionInfo(record: any) {
    if (record.deletedAt) {
      return {
        deletedAt: record.deletedAt,
        deletedReason: record.deletedReason,
        deletedTags: record.deletedTags,
      };
    }
    return null;
  }
}

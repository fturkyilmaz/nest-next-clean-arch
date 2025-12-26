import { HttpException, HttpStatus } from "@nestjs/common";

export class DomainException extends HttpException {
  constructor(message: string, status: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(message, status);
  }
}

export class EntityNotFoundException extends HttpException {
  constructor(entityName: string, id: string) {
    super(`${entityName} with id ${id} not found`, HttpStatus.NOT_FOUND);
  }
}

export class EntityAlreadyExistsException extends HttpException {
  constructor(entityName: string, field: string, value: string) {
    super(
      `${entityName} with ${field} '${value}' already exists`,
      HttpStatus.CONFLICT
    );
  }
}

export class UnauthorizedAccessException extends HttpException {
  constructor(message: string = "Unauthorized access") {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class ValidationException extends HttpException {
  constructor(errors: any) {
    super(
      {
        message: "Validation failed",
        errors,
      },
      HttpStatus.UNPROCESSABLE_ENTITY
    );
  }
}

export class BusinessRuleViolationException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

/** * Kaynak erişim hataları (ör. rate limit, quota) */ 
export class ResourceLimitExceededException extends HttpException {
  constructor(resource: string, limit: number) {
    super(
      `${resource} limit of ${limit} exceeded`,
      HttpStatus.TOO_MANY_REQUESTS
    );
  }
}
/** * Veri bütünlüğü hataları (ör. foreign key violation) */ 
export class DataIntegrityException extends HttpException {
  constructor(message: string = "Data integrity violation") {
    super(message, HttpStatus.CONFLICT);
  }
}
/** * Servis bağımlılığı hataları (ör. üçüncü parti API down) */ 
export class ExternalServiceUnavailableException extends HttpException {
  constructor(serviceName: string) {
    super(
      `${serviceName} is currently unavailable`,
      HttpStatus.SERVICE_UNAVAILABLE
    );
  }
}
/** * İşlem desteklenmiyor (ör. immutable entity üzerinde update) */ 
export class OperationNotAllowedException extends HttpException {
  constructor(message: string = "Operation not allowed") {
    super(message, HttpStatus.METHOD_NOT_ALLOWED);
  }
}
/** * Beklenmeyen sistem hataları (fallback) */ 
export class UnexpectedSystemException extends HttpException {
  constructor(message: string = "Unexpected system error") {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

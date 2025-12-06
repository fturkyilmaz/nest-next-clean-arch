import { HttpException, HttpStatus } from '@nestjs/common';

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
  constructor(message: string = 'Unauthorized access') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class ValidationException extends HttpException {
  constructor(errors: any) {
    super(
      {
        message: 'Validation failed',
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

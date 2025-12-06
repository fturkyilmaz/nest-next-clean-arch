import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as xss from 'xss';

/**
 * Middleware to sanitize user input and prevent XSS attacks
 */
@Injectable()
export class InputSanitizationMiddleware implements NestMiddleware {
  private readonly xssFilter: any;

  constructor() {
    this.xssFilter = new xss.FilterXSS({
      whiteList: {}, // No HTML tags allowed
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style'],
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Sanitize request body
    if (req.body) {
      req.body = this.sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query) {
      req.query = this.sanitizeObject(req.query);
    }

    // Sanitize URL parameters
    if (req.params) {
      req.params = this.sanitizeObject(req.params);
    }

    next();
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    if (obj !== null && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = this.sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }

    return obj;
  }

  private sanitizeString(str: string): string {
    // Remove XSS attempts
    let sanitized = this.xssFilter.process(str);

    // Remove SQL injection attempts
    sanitized = sanitized.replace(/('|(--)|;|\/\*|\*\/|xp_|sp_)/gi, '');

    // Trim whitespace
    sanitized = sanitized.trim();

    return sanitized;
  }
}

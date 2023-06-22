import { LoggerService as BaseLoggerService } from '@nestjs/common';

export interface LoggerInterface extends BaseLoggerService {
  meta(object: Record<string, any>): LoggerInterface;
}

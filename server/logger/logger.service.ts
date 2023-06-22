import { Injectable, LogLevel, Scope } from "@nestjs/common";
import { LoggerInterface } from "./types/logger.interface";
import * as w from "winston";
import { UseConfig } from "../config/decorators/config.decorator";

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements LoggerInterface {
  readonly winston: w.Logger;
  readonly loggerWithAfterHook: LoggerInterface = new Proxy(this, {
    get(target: this, p: string | symbol, receiver: any): any {
      const fn: Function = target[p]
      return function() {
        fn.call(target, ...arguments)
        target.winston.defaultMeta = { service: LoggerService.name }
      }
    }
  })

  constructor(@UseConfig('log.level') logLevel?: string) {
    this.winston = w.createLogger({
      level: logLevel ?? 'info',
      format: w.format.combine(w.format.splat(), w.format.json()),
      defaultMeta: { service: LoggerService.name },
      transports: [
        new w.transports.Console({})
      ]
    });
  }

  debug(message: string, ...optionalParams: any[]): any {
    this.winston.debug(message, ...optionalParams);
  }

  error(message: string, ...optionalParams: any[]): any {
    this.winston.error(message, ...optionalParams);
  }

  log(message: string, ...optionalParams: any[]): any {
    if (optionalParams.length && !message.includes('%s')) {
      this.meta({ optionalParams }).log(message)
    } else {
      this.winston.info(message, ...optionalParams);
    }
  }

  setLogLevels(levels: LogLevel[]): any {
    this.winston.warn("not yet implemented: LoggerService.setLogLevels");
  }

  verbose(message: string, ...optionalParams: any[]): any {
    this.winston.verbose(message, ...optionalParams);
  }

  warn(message: string, ...optionalParams: any[]): any {
    this.winston.warn(message, ...optionalParams);
  }

  meta(object: Record<string, any>): LoggerInterface {
    this.winston.defaultMeta = {
      service: LoggerService.name,
      ...object
    };
    return this.loggerWithAfterHook;
  }

}

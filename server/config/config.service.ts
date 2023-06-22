import { Injectable } from "@nestjs/common";

// noinspection TypeScriptUnresolvedReference
@Injectable()
export class ConfigService {
  appEnv?: string;

  get(key: string): any {
    return (process.env[`${this.appEnv}.${key}`] || process.env[key]);
  }

  getString(key: string, ifEmpty?: string): string | undefined {
    return `${this.get(key)}` || ifEmpty;
  }

  getNumber(key: string, ifEmpty?: number): number | undefined {
    return Number(this.get(key)) || ifEmpty;
  }

  getBoolean(key: string): boolean {
    return !!this.get(key);
  }
}

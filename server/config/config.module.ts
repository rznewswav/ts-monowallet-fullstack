import { DynamicModule, Module } from "@nestjs/common";
import { providers } from "./config.provider";
import { ConfigService } from "./config.service";
import { config } from "dotenv";

// noinspection TypeScriptUnresolvedReference
@Module({})
export class ConfigModule {
  static forRoot(envPath?: string): DynamicModule {
    return {
      module: ConfigModule,
      global: true,
      providers: [
        {
          provide: ConfigService,
          useFactory() {
            config(envPath ? {
              path: envPath
            } : void 0);

            const configService = new ConfigService();
            configService.appEnv = process.env["app.env"]
            return configService
          }
        },
        ...providers.map(e => ({
          provide: e.injectName,
          useFactory(configService: ConfigService) {
            let out: any;
            switch (e.fn) {
              case String:
                out = configService.getString(e.name, e.defValue);
                break;
              case Number:
                out = configService.getNumber(e.name, e.defValue);
                break;
              case Boolean:
                out = configService.getBoolean(e.name);
                break;
              default:
                out = configService.get(e.name);
                break;
            }
            return out;
          },
          inject: [ConfigService]
        }))
      ],
      exports: [
        ...providers.map(e => e.injectName),
        ConfigService
      ]
    };
  }
}

import { Module } from "@nestjs/common";
import { LoggerModule } from "./logger/logger.module";
import { ConfigModule } from "./config/config.module";

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot("server.properties")
  ]
})
export class AppModule {
}

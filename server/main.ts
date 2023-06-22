import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { LoggerService } from "./logger/logger.service";
import { ConfigService } from "./config/config.service";
import { HyperExpressAdapter } from "./platform/hyper-express-platform";


async function start() {
  const app = await NestFactory.create(AppModule, new HyperExpressAdapter, { bodyParser: false, rawBody: true });
  const logger = await app.resolve(LoggerService);
  app.useLogger(logger);

  const configService = app.get(ConfigService);
  const port = configService.getNumber("app.port") ?? 3000;

  await app.listen(port);
  logger.log("app is listening on port: %s", port);
  logger.debug("app env: %s", configService.get('app.env'))
}

start().then(() => {
  console.info("init completed");
}).catch(error => {
  console.error("process existed with error: " + error?.message);
  console.trace(error);
});

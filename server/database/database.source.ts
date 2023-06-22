import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { ConfigService } from "../config/config.service";

config({
  path: 'server.properties'
});

const configService = new ConfigService();
configService.appEnv = process.env["app.env"]

export const defaultDataSource = new DataSource({
  type: 'postgres',
  url: configService.get('database.url'),
  entities: [
    // add entities here
  ],
  migrations: [
    // add migration files here
  ],
});

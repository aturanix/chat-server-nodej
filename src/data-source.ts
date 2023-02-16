import { DataSource, DataSourceOptions } from "typeorm";

export async function initializeDataSource(options: DataSourceOptions) {
  AppDataSource = new DataSource(options);

  await AppDataSource.initialize();
}

export let AppDataSource: DataSource;

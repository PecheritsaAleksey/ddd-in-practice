import { DataSource, DataSourceOptions } from 'typeorm';
import { postgresOptions } from './postgres.config';

export default new DataSource(postgresOptions as DataSourceOptions);

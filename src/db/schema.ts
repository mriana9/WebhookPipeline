import { pgTable, timestamp, uuid, text, jsonb, integer } from 'drizzle-orm/pg-core';

export const pipelines = pgTable('pipelines', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  name: text('name').notNull(),
  sourceKey: uuid('source_key').notNull().defaultRandom(),
  //(TRANSFORM, FILTER, ENRICH)
  actionType: text('action_type').notNull(),
  destinationUrl: text('destination_url').notNull(),
  actionConfig: jsonb('action_config'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  pipeline_id: uuid('pipeline_id')
    .notNull()
    .references(() => pipelines.id, { onDelete: 'cascade' }), //ondeleie pipline delete all his jobs
  payload: jsonb('payload'),
  //pending, processing, completed, failed
  status: text('status').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const delivery_attempts = pgTable('delivery_attempts', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  job_id: uuid('job_id')
    .notNull()
    .references(() => jobs.id, { onDelete: 'cascade' }),
  response_status: integer('response_status'), // 200 -> Success || 500 Faild
  error_log: text('error_log'),
  attempt_number: integer('attempt_number'),
});

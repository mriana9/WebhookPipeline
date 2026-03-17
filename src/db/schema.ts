import { pgTable, timestamp, uuid, text, jsonb } from 'drizzle-orm/pg-core';

export const pipelines = pgTable('pipelines', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  name: text('name').notNull().unique(),
  sourceKey: uuid('source_key').defaultRandom().notNull().unique(),
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

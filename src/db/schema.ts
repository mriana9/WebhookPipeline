import { pgTable, timestamp, uuid, text, jsonb } from "drizzle-orm/pg-core";

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
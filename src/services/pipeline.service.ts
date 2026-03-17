import { db } from 'src/db';
import { pipelines } from 'src/db/schema';

interface Pipeline {
  name: string;
  actionType: string;
  destinationUrl: string;
  actionConfig?: any;
}
//Insert Piplines
export async function createPipeline(pipeline: Pipeline) {
  const [result] = await db
    .insert(pipelines)
    .values({
      name: pipeline.name,
      actionType: pipeline.actionType,
      destinationUrl: pipeline.destinationUrl,
      actionConfig: pipeline.actionConfig,
    })
    .returning();

  return result;
}

//Read Piplines
export async function getAllPiplines() {
  const result = await db.select().from(pipelines);
  return result;
}

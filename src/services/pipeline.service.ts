import { eq } from 'drizzle-orm';
import { db } from '../db';
import { delivery_attempts, jobs, pipelines } from '../db/schema';
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

//Delete Pipline
export async function deletePipeline(id: string) {
  await db.delete(pipelines).where(eq(pipelines.id, id));
}

// Job to Wwbhook
export async function jobtoWebhook(sourceKey: string, payload: any) {
  const [pipeline] = await db.select().from(pipelines).where(eq(pipelines.sourceKey, sourceKey));
  if (!pipeline) return null;

  // create new job, status pending
  const [newJob] = await db
    .insert(jobs)
    .values({
      pipeline_id: pipeline.id,
      payload: payload,
      status: 'pending',
    })
    .returning();

  return newJob;
}

// Get all Attempts for a SPECIFIC job to see its history
export async function getAttemptsByJobId(jobId: string) {
  const result = await db
    .select()
    .from(delivery_attempts)
    .where(eq(delivery_attempts.job_id, jobId)); // Filter by job id
  return result;
}

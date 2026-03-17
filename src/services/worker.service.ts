import { db } from '../db/index.js';
import { delivery_attempts, jobs, pipelines } from '../db/schema.js';
import { and, eq, lt } from 'drizzle-orm';
import axios from 'axios';

export async function processJobs() {
  const [result] = await db
    .select({ job: jobs, pipeline: pipelines })
    .from(jobs)
    .innerJoin(pipelines, eq(jobs.pipeline_id, pipelines.id))
    .where(and(eq(jobs.status, 'pending'), lt(jobs.retryCount, 3)))
    .limit(1);

  if (!result) return;
  const { job, pipeline } = result;

  // Solve the 'unknown' error by casting the payload
  const currentPayload = job.payload as any;
  let finalPayload = currentPayload;

  try {
    // 2. Update status to 'processing'
    await db.update(jobs).set({ status: 'processing' }).where(eq(jobs.id, job.id));

    // Logic to handle Real Zarkasha Actions
    switch (pipeline.actionType) {
      case 'ZARKASHA_ESTIMATOR':
        const { type, size } = currentPayload;
        let estimatedPrice = 0;

        // simple pricing logic
        if (type === 'Manual') estimatedPrice = 50;
        else if (type === 'Machine') estimatedPrice = 30;

        finalPayload = {
          message: `✨ Zarkasha New Lead ✨`,
          customer: currentPayload.name,
          suggested_price: `${estimatedPrice} LIS`, //
          details: `Type: ${type}, Size: ${size}`,
        };
        break;

      case 'URGENT_CHECKER':
        const notes = (currentPayload.notes || '').toLowerCase();
        const isUrgent =
          notes.includes('urgent') || notes.includes('birthday') || notes.includes('graduction');

        finalPayload = {
          alert: isUrgent ? 'URGENT ORDER' : 'Standard Order',
          content: currentPayload,
          mariana_action: isUrgent ? 'Contact Customer ASAP!' : 'Add to queue',
        };
        break;

      case 'SYNC_TO_SHEET':
        // a2: Prepare data for Google Sheets via Webhook.site or Zapier
        finalPayload = {
          date: new Date().toLocaleDateString(),
          customer_name: currentPayload.name,
          phone: currentPayload.phone,
          order_summary: `${currentPayload.type} - ${currentPayload.notes}`,
        };
        break;
    }

    // 3. Send the final (possibly modified) payload
    console.log(`Sending data to: ${pipeline.destinationUrl}`);
    await axios.post(pipeline.destinationUrl!, finalPayload);

    // 4. Success update
    await db.update(jobs).set({ status: 'completed' }).where(eq(jobs.id, job.id));
    console.log(`Job ${job.id} is done!`);
  } catch (error: any) {
    // 5. Failure and Retry Logic
    const nextRetryCount = job.retryCount + 1;
    const finalStatus = nextRetryCount >= 3 ? 'failed' : 'pending';

    await db
      .update(jobs)
      .set({ status: finalStatus, retryCount: nextRetryCount })
      .where(eq(jobs.id, job.id));

    // 6. Log attempt details
    await db.insert(delivery_attempts).values({
      job_id: job.id,
      response_status: error.response?.status || 500,
      error_log: error.message,
      attempt_number: nextRetryCount,
    });
  }
}

'use strict';

import express from 'express';
import {
  createPipeline,
  deletePipeline,
  getAllPiplines,
  getAttemptsByJobId,
  jobtoWebhook,
} from './services/pipeline.service.js';
import { processJobs } from './services/worker.service.js';

const app = express();
app.use(express.json());

//Endpoint.1 [Add Pipline]
app.post('/pipelines', async (req, res) => {
  try {
    const result = await createPipeline(req.body);
    res.status(201).json(result); // Result to frontend
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Endpoint.2 [Read Pipline]
app.get('/pipelines', async (req, res) => {
  try {
    const allPipelines = await getAllPiplines();
    res.status(200).json(allPipelines);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pipelines' });
  }
});

//Endpoint.3 [Add Webhook]
app.post('/receive/:sourceKey', async (req, res) => {
  try {
    const { sourceKey } = req.params;
    const payload = req.body;

    const job = await jobtoWebhook(sourceKey, payload);

    if (!job) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }

    // Accepted
    res.status(202).json({
      message: 'Webhook received and queued',
      jobId: job.id,
      status: job.status,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Endpoint.4 [Read Delivery Attempts for a Job]
app.get('/jobs/:jobId/attempts', async (req, res) => {
  try {
    const { jobId } = req.params;
    const history = await getAttemptsByJobId(jobId);
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch delivery attempts' });
  }
});

// Endpoint: Delete a specific pipeline
app.delete('/pipelines/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the pipeline from DB
    await deletePipeline(id);

    res.status(200).json({ message: 'Pipeline deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete pipeline' });
  }
});

setInterval(() => {
  processJobs();
}, 10000); // Work after 10s

//Run Server on port 3000 -> npm run dev
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

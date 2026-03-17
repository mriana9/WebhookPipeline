'use strict';

import { db } from './db/index.js';
import express from 'express';
import { pipelines } from './db/schema.js';

const app = express();
app.use(express.json());

interface Pipeline {
  name: string;
  actionType: string;
  destinationUrl: string;
  actionConfig?: any;
}

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

//Endpoint [Add Pipline]
app.post('/pipelines', async (req, res) => {
  try {
    const result = await createPipeline(req.body);
    res.status(201).json(result); // Result to frontend
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Run Server on port 3000 -> npm run dev
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

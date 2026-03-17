'use strict';

import express from 'express';
import { createPipeline, getAllPiplines } from './services/pipeline.service.js';

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

//Run Server on port 3000 -> npm run dev
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

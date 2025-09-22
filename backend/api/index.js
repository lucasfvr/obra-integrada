import { vercel } from '@vercel/node';
import apiRouter from '../src/routes/api-router.js';

export default vercel(apiRouter);
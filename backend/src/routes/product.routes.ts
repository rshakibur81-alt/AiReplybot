import { Router } from 'express';
import prisma from '../config/database';

const router = Router();

// Get products
router.get('/', async (_req, res) => {
  const products = await prisma.product.findMany();

  res.json({
    success: true,
    data: products,
  });
});

// Create product
router.post('/', async (req, res) => {
  const product = await prisma.product.create({
    data: req.body,
  });

  res.json({
    success: true,
    data: product,
  });
});

export default router;

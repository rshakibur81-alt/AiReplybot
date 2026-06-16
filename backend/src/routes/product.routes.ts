import { Router } from 'express';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get Products
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        userId: req.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to load products',
    });
  }
});

// Create Product
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const product = await prisma.product.create({
      data: {
        userId: req.userId!,
        name: req.body.name,
        price: Number(req.body.price),
        description: req.body.description,
        imageUrl: req.body.imageUrl || '',
        sizes: req.body.sizes || '',
        stockStatus: req.body.stockStatus || 'in_stock',
      },
    });

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
    });
  }
});

// Delete Product
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    await prisma.product.delete({
      where: {
        id: req.params.id,
      },
    });

    res.json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
    });
  }
});

export default router;

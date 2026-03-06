const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/product.controller');

// ——— Product CRUD ———
router.get('/', ctrl.getAll);
router.get('/variants-list', ctrl.getVariantList);
router.get('/by-slug/:slug', ctrl.getBySlug);
router.get('/:id', ctrl.getById);
router.post('/', authenticate, requireAdmin, ctrl.create);
router.put('/:id', authenticate, requireAdmin, ctrl.update);
router.delete('/:id', authenticate, requireAdmin, ctrl.remove);

// ——— Variants ———
router.post('/:id/variants', authenticate, requireAdmin, ctrl.addVariant);
router.put('/:id/variants/:variantId', authenticate, requireAdmin, ctrl.updateVariant);
router.delete('/:id/variants/:variantId', authenticate, requireAdmin, ctrl.deleteVariant);

// ——— Images ———
router.post('/:id/images', authenticate, requireAdmin, ctrl.addImage);
router.put('/:id/images/:imageId', authenticate, requireAdmin, ctrl.updateImage);
router.delete('/:id/images/:imageId', authenticate, requireAdmin, ctrl.deleteImage);

module.exports = router;

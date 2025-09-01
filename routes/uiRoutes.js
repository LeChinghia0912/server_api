const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middlewares/auth');
const categoriesService = require('../services/categoriesService');
const productsService = require('../services/productsService');
const sizesService = require('../services/sizesService');
const colorsService = require('../services/colorsService');

router.get('/', (req, res) => {
  res.render('home', { title: 'Home', mainFluid: true });
});

router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Login' });
});

router.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Register' });
});

router.get('/categories', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const categories = await categoriesService.listCategories();
    res.render('categories/index', { title: 'Categories', categories, mainFluid: true });
  } catch (err) {
    next(err);
  }
});

router.get('/products', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const [products, categories, sizes, colors] = await Promise.all([
      productsService.listProducts(),
      categoriesService.listCategories(),
      sizesService.listSizes(),
      colorsService.listColors(),
    ]);
    res.render('products/index', { title: 'Products', products, categories, sizes, colors, mainFluid: true });
  } catch (err) {
    next(err);
  }
});

router.get('/sizes', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const sizes = await sizesService.listSizes();
    res.render('sizes/index', { title: 'Sizes', sizes, mainFluid: true });
  } catch (err) {
    next(err);
  }
});

router.get('/colors', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const colors = await colorsService.listColors();
    res.render('colors/index', { title: 'Colors', colors, mainFluid: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;



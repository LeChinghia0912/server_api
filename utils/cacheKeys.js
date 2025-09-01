const CacheKeys = {
  categories: {
    all: 'categories:all',
    byId: (id) => `categories:${id}`,
  },
  products: {
    all: 'products:all',
    byId: (id) => `products:${id}`,
  },
  sizes: {
    all: 'sizes:all',
  },
  colors: {
    all: 'colors:all',
  },
};

module.exports = CacheKeys;



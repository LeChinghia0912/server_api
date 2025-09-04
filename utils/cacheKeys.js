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
  orders: {
    adminAll: 'orders:admin:all',
    adminById: (id) => `orders:admin:${id}`,
    userAll: (userId) => `orders:user:${userId}:all`,
    userById: (userId, id) => `orders:user:${userId}:${id}`,
  },
};

module.exports = CacheKeys;



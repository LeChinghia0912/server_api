function safeJsonParse(maybeJson, defaultValue = undefined) {
  if (maybeJson === null || maybeJson === undefined) return defaultValue;
  if (typeof maybeJson !== 'string') return maybeJson;
  try {
    return JSON.parse(maybeJson);
  } catch (_) {
    return defaultValue;
  }
}

function normalizeVariantsInput(variants) {
  return (variants || []).map(function(v) {
    return {
      size_id: Number(v.size_id),
      color_id: Number(v.color_id),
      stock: Number(v.stock || 0),
      price: Number(v.price || 0),
    };
  }).filter(function(v){
    return v.size_id && v.color_id && v.stock >= 0 && v.price >= 0;
  });
}

module.exports = {
  safeJsonParse,
  normalizeVariantsInput,
};



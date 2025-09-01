function toInt(value, defaultValue = NaN) {
  const n = Number(value);
  return Number.isInteger(n) ? n : defaultValue;
}

function assertValidId(idLike, fieldName = "id") {
  const id = toInt(idLike);
  if (!Number.isInteger(id)) {
    const AppError = require("./AppError");
    throw new AppError(`Invalid ${fieldName}`, 400);
  }
  return id;
}

function isNonEmptyString(val) {
  return typeof val === "string" && val.trim().length > 0;
}

module.exports = {
  toInt,
  assertValidId,
  isNonEmptyString,
};



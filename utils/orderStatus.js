const ORDER_STATUSES = Object.freeze(['pending', 'paid', 'shipped', 'completed', 'cancelled']);

function normalizeStatus(status) {
  return String(status || '').trim().toLowerCase();
}

function isValidStatus(status) {
  return ORDER_STATUSES.includes(normalizeStatus(status));
}

function adminAllowedNext(currentStatus) {
  const curr = normalizeStatus(currentStatus);
  // Admin flow:
  // pending -> shipped | cancelled
  // paid -> shipped (for prepaid orders)
  // shipped/completed/cancelled -> no transitions via admin
  switch (curr) {
    case 'pending': return ['shipped', 'cancelled'];
    case 'paid': return ['shipped'];
    default: return [];
  }
}

function canUserConfirmCompleted(currentStatus) {
  return normalizeStatus(currentStatus) === 'shipped';
}

module.exports = {
  ORDER_STATUSES,
  normalizeStatus,
  isValidStatus,
  adminAllowedNext,
  canUserConfirmCompleted,
};



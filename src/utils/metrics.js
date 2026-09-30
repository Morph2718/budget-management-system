const metrics = {
  totalRequests: 0,
  totalErrors: 0,
  totalResponseTime: 0,
};

function recordRequest(responseTimeMs, statusCode) {
  metrics.totalRequests += 1;
  metrics.totalResponseTime += responseTimeMs;
  if (statusCode >= 500) {
    metrics.totalErrors += 1;
  }
}

function getMetrics() {
  const avgResponseTime =
    metrics.totalRequests > 0
      ? metrics.totalResponseTime / metrics.totalRequests
      : 0;

  return {
    totalRequests: metrics.totalRequests,
    totalErrors: metrics.totalErrors,
    errorRate:
      metrics.totalRequests > 0
        ? `${((metrics.totalErrors / metrics.totalRequests) * 100).toFixed(2)}%`
        : '0%',
    avgResponseTimeMs: Math.round(avgResponseTime),
  };
}

module.exports = { recordRequest, getMetrics };
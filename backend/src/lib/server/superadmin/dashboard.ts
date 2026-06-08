import { readDb } from '@/lib/server/superadmin/store';

export function getDashboardSnapshot() {
  const db = readDb();
  const activeUsers = db.users.filter((u) => u.status === 'active').length;
  const activeSubscriptions = db.subscriptions.filter((s) => s.status === 'active').length;
  const mrr = db.subscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + (s.plan === 'enterprise' ? 99 : s.plan === 'pro' ? 29 : 0), 0);

  const stripeErrors = db.logs.filter(
    (l) => l.source === 'stripe-webhook' && l.level === 'error'
  ).length;
  const aiErrors = db.aiLogs.filter((l) => l.status === 'error').length;

  return {
    activeUsers,
    activeSubscriptions,
    mrr,
    latestPayments: db.payments.slice(0, 5),
    ai: {
      status: aiErrors > 0 ? 'degraded' : 'healthy',
      avgLatencyMs:
        db.aiLogs.length > 0
          ? Math.round(db.aiLogs.reduce((sum, l) => sum + l.latencyMs, 0) / db.aiLogs.length)
          : 0,
      errors: aiErrors,
    },
    infrastructure: {
      serverStatus: 'healthy',
      containersStatus: 'healthy',
      criticalErrors: db.logs.filter((l) => l.level === 'error').length,
      stripeErrors,
    },
    updatedAt: new Date().toISOString(),
  };
}

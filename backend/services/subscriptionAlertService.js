export const getSubscriptionAlerts = (subscriptions, daysAhead = 3) => {
  const alerts = [];
  const now = new Date();

  subscriptions.forEach((s) => {
    const next = new Date(s.nextBillingDate);
    const diffDays = Math.round((next - now) / (1000 * 60 * 60 * 24));

    // upcoming within N days
    if (diffDays >= 0 && diffDays <= daysAhead) {
      alerts.push({
        type: "upcoming",
        name: s.name,
        amount: s.amount,
        date: next,
        daysLeft: diffDays,
        severity: diffDays <= 1 ? "high" : "medium",
      });
    }

    // overdue
    if (diffDays < 0 && diffDays >= -3) {
      alerts.push({
        type: "overdue",
        name: s.name,
        amount: s.amount,
        date: next,
        daysLate: Math.abs(diffDays),
        severity: "high",
      });
    }
  });

  return alerts.sort((a, b) => a.daysLeft - b.daysLeft);
};

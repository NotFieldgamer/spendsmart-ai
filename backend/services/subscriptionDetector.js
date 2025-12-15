const SUBS_KEYWORDS = [
  "netflix",
  "spotify",
  "amazon prime",
  "prime video",
  "youtube premium",
  "apple music",
  "google one",
  "hotstar",
  "disney",
];

export function detectSubscriptionFromExpense(expense) {
  const text = `${expense.description || ""}`.toLowerCase();

  const matched = SUBS_KEYWORDS.find((k) => text.includes(k));
  if (!matched) return null;

  return {
    name: matched
      .split(" ")
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" "),
    amount: expense.amount,
    renewalDate: new Date(
      new Date(expense.date).setMonth(new Date(expense.date).getMonth() + 1)
    ),
    confidence: 0.85,
    source: "auto",
    rawMatches: text,
  };
}

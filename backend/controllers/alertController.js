import Alert from "../models/Alert.js";

export const getAlerts = async (req, res) => {
  const alerts = await Alert.find({ userId: req.user.id })
    .sort({ createdAt: -1 });

  res.json(alerts);
};

export const createTestAlert = async (req, res) => {
  try {
    const alert = await Alert.create({
      userId: req.user.id,
      type: "system",              // ✅ VALID ENUM
      title: "✅ Alerts working",
      message: "This is a test alert",
      severity: "info",
    });

    res.json(alert);
  } catch (err) {
    console.error("Alert create failed:", err);
    res.status(500).json({ error: err.message });
  }
};


export const markAlertRead = async (req, res) => {
  const alert = await Alert.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { read: true },
    { new: true }
  );

  res.json(alert);
};

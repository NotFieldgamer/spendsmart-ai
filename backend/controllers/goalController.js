import Goal from "../models/Goal.js";

export const createGoal = async (req, res) => {
  const { name, targetAmount, currentAmount, deadline } = req.body;
  if (!name || targetAmount == null)
    return res.status(400).json({ message: "Name & target required" });

  const goal = await Goal.create({
    userId: req.user.id,
    name,
    targetAmount,
    currentAmount: currentAmount || 0,
    deadline
  });

  res.status(201).json(goal);
};

export const getGoals = async (req, res) => {
  const goals = await Goal.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(goals);
};

export const updateGoal = async (req, res) => {
  const { name, targetAmount, currentAmount, deadline } = req.body;
  const goal = await Goal.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { name, targetAmount, currentAmount, deadline },
    { new: true }
  );
  if (!goal) return res.status(404).json({ message: "Not found" });
  res.json(goal);
};

export const deleteGoal = async (req, res) => {
  const deleted = await Goal.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id
  });
  if (!deleted) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted" });
};

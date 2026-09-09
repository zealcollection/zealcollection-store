const mongoose = require("mongoose");

const analyticsStateSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "default" },
    resetAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AnalyticsState", analyticsStateSchema);

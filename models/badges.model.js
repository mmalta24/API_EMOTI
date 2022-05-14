module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      badgeName: {
        type: String,
        required: [true, "Please provide badgeName!"],
        unique: true,
      },
      badgeIMG: { type: String, required: [true, "Please provide badgeIMG!"] },
      pointsNeeded: {
        type: Number,
        required: [true, "Please provide pointsNeeded!"],
      },
      badgeEmotion: {
        type: String,
        required: [true, "Please provide badgeEmotion!"],
      },
    },
    { timestamps: false, versionKey: false }
  );
  const Badge = mongoose.model("badges", schema);
  return Badge;
};

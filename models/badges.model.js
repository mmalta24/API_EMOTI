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
        min: [0, "pointsNeeded should be a positive number!"],
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

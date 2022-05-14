module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      name: {
        type: String,
        required: [true, "Please provide a name!"],
        unique: true,
      },
    },
    { timestamps: false, versionKey: false }
  );
  const Emotion = mongoose.model("emotions", schema);
  return Emotion;
};

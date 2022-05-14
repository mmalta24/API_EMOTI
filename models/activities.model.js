module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      title: {
        type: String,
        required: [true, "Please provide a title!"],
        unique: true,
      },
      level: {
        type: String,
        required: [true, "Please provide level!"],
        enum: {
          values: ["Fácil", "Médio", "Difícil"],
          message: "{VALUE} is not a valid type! Try Fácil, Médio or Difícil.",
        },
      },
      questions: { type: Array, required: [true, "Please provide questions!"] },
      caseIMG: { type: String, required: [true, "Please provide caseIMG!"] },
      description: {
        type: String,
        required: [true, "Please provide description!"],
      },
      category: { type: String, required: [true, "Please provide category!"] },
      author: { type: String, required: [true, "Please provide author!"] },
    },
    { timestamps: false, versionKey: false }
  );
  const Activity = mongoose.model("activities", schema);
  return Activity;
};

module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      name: { type: String, required: [true, "Please provide a name!"] },
      teacher: { type: String, required: [true, "Please provide a teacher!"] },
      requests: { type: Array },
      students: { type: Array },
    },
    { timestamps: false, versionKey: false }
  );
  const Class = mongoose.model("classes", schema);
  return Class;
};

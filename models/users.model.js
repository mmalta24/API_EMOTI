module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      username: {
        type: String,
        required: [true, "Please provide a username!"],
        unique: true,
        validate: {
          validator: function (v) {
            return /^[a-zA-Z\_]+$/.test(v); // valid only a-z, A-Z and _ characters
          },
          message: (props) => `${props.value} is not a valid username!`,
        },
      },
      password: {
        type: String,
        required: [true, "Please provide a password!"],
        default: "Esmad_2122",
      },
      email: {
        type: String,
        required: [true, "Please provide a email!"],
        unique: true,
        validate: {
          validator: function (v) {
            return /^[\a-zA-Z\_\.]+@([\a-z]+\.)+[\a-z]{2,4}$/.test(v);
            // a-z, A-Z, _ or . characters @ a-z characters . a-z characters (2-4)
          },
          message: (props) => `${props.value} is not a valid email!`,
        },
      },
      typeUser: {
        type: String,
        required: [true, "Please provide a typeUser!"],
        enum: {
          values: ["Administrador", "Professor", "Criança", "Tutor"],
          message:
            "{VALUE} is not a valid type! Try Administrador, Professor, Criança or Tutor.",
        },
      },
      name: { type: String, required: [true, "Please provide a name!"] },
      imgProfile: { type: String },
      blocked: { type: Boolean, default: false },
      badgesId: { type: Array },
      questionsDone: { type: Array },
      points: { type: Number },
      tutor: { type: String },
      children: { type: Array },
      history: { type: Array },
      activitiesPersonalized: { type: Array },
      activitiesSuggested: { type: Array },
    },
    { timestamps: false, versionKey: false }
  );
  const User = mongoose.model("users", schema);
  return User;
};

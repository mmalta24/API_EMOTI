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
          message: (props) => `${props.value} is not a username!`,
        },
      },
      password: {
        type: String,
        required: [true, , "Please provide a password!"],
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
        },
      },
      typeUser: {
        type: String,
        required: [true, "Please provide a typeUser!"],
        enum: {
          values: ["Admin", "Professor", "Criança", "Tutor"],
          message: "{VALUE} is not supported",
        },
      },
      name: { type: String, required: [true, "Please provide a name!"] },
      imgProfile: { type: String, required: true, default: "" },
      blocked: { type: Boolean },
      children: { type: Array },
    },
    { timestamps: false }
  );
  const User = mongoose.model("users", schema);
  return User;
};

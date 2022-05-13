module.exports = (mongoose) => {
    const schema = mongoose.Schema(
        {
            name: { type: String, required: [true, 'Why no emotion?']},
        },
        { timestamps: false }
    );
    const Emotion = mongoose.model("emotions", schema);
    return Emotion;
};
module.exports = (mongoose) => {
    const schema = mongoose.Schema(
        {
            name: { type: String, required: [true, 'Why no name?']},
            teacher: {type:String, required: [true,'Why no teacher?']},
            requests: {type:Array, require: [true,'Why no requests?']},
            students: {type:Array, require: [true,'Why no students?']}

        },
        { timestamps: false,versionKey: false}
    );
    const Class = mongoose.model("classes", schema);
    return Class;
};
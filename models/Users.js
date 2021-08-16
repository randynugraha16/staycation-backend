const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const usersSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
  },
});

usersSchema.pre("save", async function (next)  {
  
  if (!this.isModified('password')) {
    next();
   }
  
   const salt = await bcrypt.genSalt(10);
   this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model("Users", usersSchema);

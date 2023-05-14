import * as mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  refreshToken: String,
});

userSchema.pre("save", function (next) {
  const user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();

  // generate a salt
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);

      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

export const User = mongoose.model("User", userSchema);

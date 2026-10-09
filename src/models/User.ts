import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import type { UserDoc } from "../types/index.js";

const userSchema = new Schema<UserDoc>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: {
        values: ["student", "admin", "instructor"],
        message: "{VALUE} is not a valid role",
      },
      default: "student",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  }
);

// Hash password with bcrypt before saving if modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error as Error);
  }
});

export const User = model<UserDoc>("User", userSchema);

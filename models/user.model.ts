require ('dotenv').config();
import mongoose, { Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Email Validation
const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// User Interface
export interface IUser extends Document {
    isModified: any;
    _id: string;
    name: string;
    email: string;
    password: string;
    avatar: {
        public_id: string;
        url: string;
    }
    role: string;
    isVerified: boolean;
    movies: Array<{ movieId: string }>;
    comparePassword: (password: string) => Promise<boolean>;
    SignAccessToken: () => string;
    SignRefreshToken: () => string;
};

// User Schema
const userSchema: Schema<IUser> = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter Your Name"],
        maxLength: [30, "Name cannot exceed 30 characters"],
        minLength: [4, "Name should have more than 4 characters"]
    },
    email: {
        type: String,
        required: [true, "Please Enter Your Email"],
        unique: true,
        validate: {
            validator: (value: string) => {
                return emailRegexPattern.test(value);
            },
            message: "Please enter a valid email"
        }
    },
    password: {
        type: String,
        required: [true, "Please Enter Your Password"],
        minLength: [8, "Password should be greater than 8 characters"],
        select: false
    },
    avatar: {
        public_id: String,
        url: String,
    },
    role: {
        type: String,
        default: 'user',
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    movies: [
        {
            movieId: {
                type: String
            }
        }
    ]
}, { timestamps: true });

// Hashing password before saving
userSchema.pre<IUser>("save", async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Sign Access Token 
userSchema.methods.SignAccessToken = function () {
    return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || '');
};

// Sign Refresh Token
userSchema.methods.SignRefreshToken = function () {
    return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || '');
};

// Compare Password
userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Exporting User Model
const userModel: Model<IUser> = mongoose.model("User", userSchema);

export default userModel;
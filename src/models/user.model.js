import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";




/**
 * @description User schema
 */
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    userName: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    refreshToken: {
        type: String
    },
    role: {
        type: String,
        default: "user",
    },
    isActive: {
        type: Boolean,
        default: true,
    }

}, {
    timestamps: true
});





/**
 * @description Hashes the password before saving the user model
 */
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
}
);





/**
 * 
 * @param password 
 * @description Compares the password with the hashed password
 */

// To check the password encoded and decoded
userSchema.methods.isPasswordCorrect = async function (password) {
    console.log(password + "   :" + this.password)
    if (!password || !this.password) {
        throw new Error('Data and hash arguments required');
    }
    return await bcrypt.compare(password, this.password);
}






/**
 * 
 * @returns {Promise<string>}
 * @throws {Error}
 * @description Generates an access token for the user
 */
userSchema.methods.generateAccessToken = async function () {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const expiry = process.env.ACCESS_TOKEN_EXPIRY;

    if (!secret || !expiry) {
        throw new Error('Access token secret or expiry is not defined');
    }

    try {
        const token = jwt.sign(
            {
                _id: this._id,
                email: this.email,
            },
            secret,
            {
                expiresIn: expiry,
            }
        );
        return token;
    } catch (error) {
        throw new Error('Error generating access token: ' + error.message);
    }
};





/**
 * 
 * @returns {Promise<string>}
 * @throws {Error}
 * @description Generates a refresh token for the user
 */
userSchema.methods.generateRefreshToken = async function () {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const expiry = process.env.REFRESH_TOKEN_EXPIRY;

    if (!secret || !expiry) {
        throw new Error('Refresh token secret or expiry is not defined');
    }

    try {
        const token = jwt.sign(
            {
                _id: this._id,
            },
            secret,
            {
                expiresIn: expiry,
            }
        );
        return token;
    } catch (error) {
        throw new Error('Error generating refresh token: ' + error.message);
    }
};





const User = mongoose.model("User", userSchema);
export default User;


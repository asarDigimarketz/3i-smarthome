import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDb from "../../../utils/config/connectDB.js";
import User from "../../../utils/model/nextauth/user.model";
import { sendEmail } from "../../../utils/sendEmail";
import { verificationEmailTemplate } from "../../../utils/verificationEmailTemplate";
import General from "../../../utils/model/general/general";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Connect to database first
    await connectDb();

    // Then query General data
    const generalData = await General.findOne();

    // Only allow registration for the hotel's authorized email
    if (!generalData || email !== generalData.emailId) {
      return NextResponse.json(
        {
          error:
            "You are not authorized to register. Please contact the system administrator.",
        },
        { status: 403 }
      );
    }

    const UserModel = User;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
    }

    // Create new user with hotel admin role for authorized email
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      isAdmin: email === generalData.emailId, // Only true for authorized email
      role: "hotel admin", // Set specific role for hotel admin
    });

    // Generate verification token and send email
    const verificationToken = newUser.getVerificationToken();
    await newUser.save();

    const verificationLink = `${process.env.NEXTAUTH_URL}/verify-email?verifyToken=${verificationToken}&id=${newUser?._id}`;
    const message = verificationEmailTemplate(verificationLink);

    await sendEmail(newUser?.email, "Email Verification", message);

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace available"
    );
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        error: "An unexpected error occurred during registration",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

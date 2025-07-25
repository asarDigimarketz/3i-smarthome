import { NextResponse } from "next/server";
import General from "../../../utils/model/general/general";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { success: false, message: "Email is required" },
      { status: 400 }
    );
  }

  try {
    const generalData = await General.findOne();

    if (generalData?.emailId !== email) {
      return NextResponse.json(
        { success: false, message: "Hotel not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      hotelId: generalData._id.toString(),
      hotelName: generalData.companyName,
    });
  } catch (error) {
    console.error("Error fetching hotel data:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

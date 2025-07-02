export async function getGeneralDetails() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/settings/general`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY as string,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch general details");
    }

    const data = await response.json();
    return data.generalData;
  } catch (error) {
    console.error("Error fetching general details:", error);
    return null;
  }
}

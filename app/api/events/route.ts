import { NextResponse } from "next/server";

export async function GET() {
  const response = await fetch("https://d4armory.io/api/events/recent");
  try {
    const data = (await response.json()) as {
      boss: {
        name: string;
        timestamp: number;
        territory: string;
        zone: string;
      };
      helltide: {
        timestamp: number;
        zone: string;
        refresh: number;
      };
      legion: {
        timestamp: number;
        territory: string;
        zone: string;
      };
    };
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Could not get recent events" },
      {
        status: 500,
      }
    );
  }
}

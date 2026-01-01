import { NextResponse } from "next/server";
import { z } from "zod";
import { AUTH_ERRORS } from "@/lib/constants";
import { getCurrentUser } from "@/lib/server-auth";

const chatRequestSchema = z.object({
  text: z.string().min(1, "Message cannot be empty"),
});

const ENGINE_URL = process.env.ENGINE_URL;
const ENGINE_API_KEY = process.env.ENGINE_API_KEY;

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: AUTH_ERRORS.UNAUTHORIZED },
        { status: 401 }
      );
    }

    if (!ENGINE_URL) {
      return NextResponse.json(
        { error: AUTH_ERRORS.MISSING_ENGINE_URL },
        { status: 500 }
      );
    }

    const body = await req.json();
    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: AUTH_ERRORS.INVALID_INPUT },
        { status: 400 }
      );
    }

    const engineResponse = await fetch(`${ENGINE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(ENGINE_API_KEY
          ? { Authorization: `Bearer ${ENGINE_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        message: parsed.data.text,
        sessionId: `u-${user.id}`,
      }),
    });

    if (!engineResponse.ok) {
      const errorText = await engineResponse.text();
      return NextResponse.json(
        { error: errorText || "Engine request failed" },
        { status: engineResponse.status }
      );
    }

    const data = await engineResponse.json();
    return NextResponse.json(data, { status: engineResponse.status });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

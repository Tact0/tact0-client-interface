import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/server-auth";
import { AUTH_ERRORS } from "@/lib/constants";

const chatRequestSchema = z.object({
  text: z.string().min(1, "Message cannot be empty"),
});

const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL;
const ENGINE_API_KEY = process.env.NEXT_PUBLIC_ENGINE_API_KEY;

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: AUTH_ERRORS.UNAUTHORIZED }, { status: 401 });
    }

    if (!ENGINE_URL) {
      return NextResponse.json({ error: AUTH_ERRORS.MISSING_ENGINE_URL }, { status: 500 });
    }

    const body = await req.json();
    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: AUTH_ERRORS.INVALID_INPUT }, { status: 400 });
    }

    const engineResponse = await fetch(`${ENGINE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(ENGINE_API_KEY ? { "x-api-key": ENGINE_API_KEY } : {}),
      },
      body: JSON.stringify({
        text: parsed.data.text,
        sessionId: `u-${user.id}`,
        userId: user.id,
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
    return NextResponse.json(data);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

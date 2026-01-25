import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/server-auth";
import { AUTH_ERRORS, USER_ROLES } from "@/lib/constants";

const debugChatRequestSchema = z.object({
  text: z.string().min(1, "Message cannot be empty"),
  sessionId: z.string().optional(),
});

// Use the same ENGINE_URL or a separate DEBUG_UI_URL if configured
const DEBUG_UI_URL = process.env.NEXT_PUBLIC_DEBUG_UI_URL || process.env.NEXT_PUBLIC_ENGINE_URL;
const ENGINE_API_KEY = process.env.NEXT_PUBLIC_ENGINE_API_KEY;

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: AUTH_ERRORS.UNAUTHORIZED }, { status: 401 });
    }

    // Only allow ADMIN users to access debug endpoint
    if (user.role !== USER_ROLES.ADMIN) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    if (!DEBUG_UI_URL) {
      return NextResponse.json({ error: AUTH_ERRORS.MISSING_ENGINE_URL }, { status: 500 });
    }

    const body = await req.json();
    const parsed = debugChatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: AUTH_ERRORS.INVALID_INPUT }, { status: 400 });
    }

    // Proxy to the engine's debug UI server /chat endpoint
    const debugResponse = await fetch(`${DEBUG_UI_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(ENGINE_API_KEY ? { "x-api-key": ENGINE_API_KEY } : {}),
      },
      body: JSON.stringify({
        text: parsed.data.text,
        sessionId: parsed.data.sessionId ?? `u-${user.id}`,
        userId: user.id,
      }),
    });

    if (!debugResponse.ok) {
      const errorText = await debugResponse.text();
      return NextResponse.json(
        { error: errorText || "Debug engine request failed" },
        { status: debugResponse.status }
      );
    }

    const data = await debugResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Debug chat API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

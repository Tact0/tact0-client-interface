import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/server-auth";
import { AUTH_ERRORS, USER_ROLES } from "@/lib/constants";

const debugChatRequestSchema = z.object({
  text: z.string().min(1, "Message cannot be empty"),
  sessionId: z.string().optional(),
});

// Use ENGINE_URL (server-side env var, not NEXT_PUBLIC_)
// In production, the engine's main API server exposes /chat endpoint for debug
const ENGINE_URL = process.env.ENGINE_URL;
const ENGINE_API_KEY = process.env.ENGINE_API_KEY;

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

    if (!ENGINE_URL) {
      return NextResponse.json({ error: AUTH_ERRORS.MISSING_ENGINE_URL }, { status: 500 });
    }

    const body = await req.json();
    const parsed = debugChatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: AUTH_ERRORS.INVALID_INPUT }, { status: 400 });
    }

    // Proxy to the engine's /chat endpoint (debug endpoint, not /api/chat)
    // The engine's main API server exposes /chat for debug mode
    const debugResponse = await fetch(`${ENGINE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(ENGINE_API_KEY ? { Authorization: `Bearer ${ENGINE_API_KEY}` } : {}),
      },
      body: JSON.stringify({
        text: parsed.data.text,
        sessionId: parsed.data.sessionId ?? `u-${user.id}`,
        userId: user.id,
      }),
    });

    if (!debugResponse.ok) {
      const errorText = await debugResponse.text();
      console.error("Engine debug response error:", {
        status: debugResponse.status,
        statusText: debugResponse.statusText,
        errorText,
        url: `${ENGINE_URL}/chat`,
      });
      return NextResponse.json(
        { error: errorText || "Debug engine request failed" },
        { status: debugResponse.status }
      );
    }

    const data = await debugResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Debug chat API error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

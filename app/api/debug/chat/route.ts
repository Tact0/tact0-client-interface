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

    // Proxy to the engine's /api/chat endpoint (same as regular chat)
    // The engine returns debug data when requested
    const debugEndpoint = `${ENGINE_URL}/api/chat`;
    const debugResponse = await fetch(debugEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(ENGINE_API_KEY ? { Authorization: `Bearer ${ENGINE_API_KEY}` } : {}),
      },
      body: JSON.stringify({
        message: parsed.data.text,
        sessionId: parsed.data.sessionId ?? `u-${user.id}`,
        debug: true, // Request debug information
      }),
    });

    if (!debugResponse.ok) {
      const errorText = await debugResponse.text();
      console.error("Engine debug response error:", {
        status: debugResponse.status,
        statusText: debugResponse.statusText,
        errorText,
        url: debugEndpoint,
        engineUrl: ENGINE_URL,
        hasApiKey: !!ENGINE_API_KEY,
      });
      
      // Return more detailed error for debugging
      let errorMessage = errorText || "Debug engine request failed";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorText;
      } catch {
        // Not JSON, use text as is
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: {
            status: debugResponse.status,
            statusText: debugResponse.statusText,
            engineUrl: ENGINE_URL,
          }
        },
        { status: debugResponse.status }
      );
    }

    const data = await debugResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : undefined;
    
    console.error("Debug chat API error:", {
      message: errorMessage,
      name: errorName,
      stack: error instanceof Error ? error.stack : undefined,
      engineUrl: ENGINE_URL,
    });
    
    // Check for common network/connection errors
    if (
      errorMessage.includes("fetch") || 
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("network") ||
      errorMessage.includes("timeout")
    ) {
      return NextResponse.json(
        { 
          error: "Debug engine request failed",
          details: {
            message: "Failed to connect to engine server",
            engineUrl: ENGINE_URL,
            error: errorMessage,
          }
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: {
          message: errorMessage,
          name: errorName,
        }
      },
      { status: 500 }
    );
  }
}

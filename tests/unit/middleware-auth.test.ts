import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "../../middleware";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { createSessionToken } from "@/lib/auth/sessionToken";

describe("middleware auth guard", () => {
  it("redirects unauthenticated dashboard access to login", async () => {
    const request = new NextRequest("http://localhost:3000/dashboard");
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/auth/login?redirect=%2Fdashboard");
  });

  it("allows dashboard access when auth cookie is present", async () => {
    const token = await createSessionToken(
      { id: "usr_test", name: "Test User", email: "test@example.com" },
      60
    );

    const request = new NextRequest("http://localhost:3000/dashboard", {
      headers: {
        cookie: `${AUTH_COOKIE_NAME}=${token}`,
      },
    });

    const response = await middleware(request);
    expect(response.status).toBe(200);
  });
});

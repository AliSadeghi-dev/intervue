import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getWorkspaceState } from "@/services/interview-workspace.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await getWorkspaceState(id, session.user.id);

  if ("error" in result && result.error === "not_found") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
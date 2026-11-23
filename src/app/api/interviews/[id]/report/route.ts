import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getInterviewReport } from "@/services/report.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await getInterviewReport(id, session.user.id);

  if (result.error === "not_found") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (result.error === "not_completed") {
    return NextResponse.json(
      { error: "Interview is not completed yet" },
      { status: 400 },
    );
  }

  if ("error" in result && result.error) {
    return NextResponse.json({ error: "Could not generate report" }, { status: 502 });
  }

  return NextResponse.json({
    report: result.report,
    generated: result.generated,
  });
}
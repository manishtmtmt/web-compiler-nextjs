import { NextResponse, NextRequest } from "next/server";

import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

// Create a new snippet for the authenticated user
export async function POST(req: NextRequest) {
  try {
    const auth = getAuth(req);
    const { userId } = auth;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const { title, html, css, js } = body;

    const snippet = await prisma.snippet.create({
      data: {
        title,
        html,
        css,
        js,
        user: {
          connect: {
            clerkId: userId,
          },
        },
      },
    });
    return NextResponse.json({
      message: "Snippet saved successfully",
      snippet,
    });
  } catch (error) {
    console.error("Error creating snippet:", error);
    return NextResponse.json(
      { error, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get all snippets for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const snippets = await prisma.snippet.findMany({
      where: {
        user: {
          clerkId: userId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(snippets);
  } catch (error) {
    console.error("Error fetching snippets:", error);
    return NextResponse.json(
      { error, message: "Internal server error" },
      { status: 500 }
    );
  }
}

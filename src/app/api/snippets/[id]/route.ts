import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// GET a specific snippet
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const snippet = await prisma.snippet.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            clerkId: true,
          },
        },
      },
    });

    if (!snippet) {
      return new NextResponse("Snippet not found", { status: 404 });
    }

    return NextResponse.json(snippet);
  } catch (error) {
    console.error("Error fetching snippet:", error);
    return NextResponse.json(
      { error, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// UPDATE a snippet
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { userId } = getAuth(req);

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, html, css, js } = body;

    const snippet = await prisma.snippet.update({
      where: {
        id,
        user: {
          clerkId: userId,
        },
      },
      data: {
        title,
        html,
        css,
        js,
      },
    });

    return NextResponse.json({
      message: "Snippet updated successfully",
      snippet,
    });
  } catch (error) {
    console.error("Error updating snippet:", error);
    return NextResponse.json(
      { error, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE a snippet
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { userId } = getAuth(req);

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.snippet.delete({
      where: {
        id,
        user: {
          clerkId: userId,
        },
      },
    });

    return NextResponse.json({
      message: "Snippet deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting snippet:", error);
    return NextResponse.json(
      { error, message: "Internal server error" },
      { status: 500 }
    );
  }
}

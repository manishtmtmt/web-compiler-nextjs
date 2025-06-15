import { verifyWebhook, WebhookEvent } from "@clerk/nextjs/webhooks";
import { NextRequest, NextResponse } from "next/server";

import { clerkClient } from "@clerk/nextjs/server";
import prisma from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  let evt: WebhookEvent;

  try {
    evt = await verifyWebhook(req);
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }

  // Do something with payload
  // For this guide, log payload to console
  const { id } = evt.data;
  const eventType = evt.type;
  console.log(`Received webhook with ID ${id} and event type of ${eventType}`);
  console.log("Webhook payload:", evt.data);

  if (evt.type === "user.created") {
    const { id, email_addresses, image_url, first_name, last_name, username } =
      evt.data;

    const newUser = await prisma.user.create({
      data: {
        clerkId: id,
        username: username,
        email: email_addresses[0]?.email_address,
        firstName: first_name,
        lastName: last_name,
        photo: image_url,
      },
    });

    if (newUser) {
      const client = await clerkClient();

      await client.users.updateUserMetadata(id, {
        publicMetadata: {
          userId: newUser.id,
        },
      });
    }

    return NextResponse.json({ message: "OK", user: newUser });
  }

  if (evt.type === "user.updated") {
    const { id, image_url, first_name, last_name, username } = evt.data;

    const updatedUser = await prisma.user.update({
      where: { clerkId: id },
      data: {
        username: username,
        firstName: first_name,
        lastName: last_name,
        photo: image_url,
      },
    });

    return NextResponse.json({ message: "OK", user: updatedUser });
  }

  if (evt.type === "user.deleted") {
    const { id } = evt.data;

    await prisma.user.delete({
      where: { clerkId: id },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  }

  return new Response("Webhook received", { status: 200 });
}

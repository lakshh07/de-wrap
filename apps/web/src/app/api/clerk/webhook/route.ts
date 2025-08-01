import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import db from "@/lib/prisma";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;

export async function GET() {
  return new NextResponse("Hello, world!", { status: 200 });
}

export async function POST(req: Request) {
  const payload = await req.text();
  const headerPayload = Object.fromEntries((await headers()).entries());

  const wh = new Webhook(webhookSecret);

  let evt: any;

  try {
    evt = wh.verify(payload, headerPayload);
  } catch (err) {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const eventType = evt.type;
  const data = evt.data;

  if (eventType === "user.created") {
    const email = data.email_addresses?.[0]?.email_address;

    if (!email) {
      return new NextResponse("Missing email", { status: 400 });
    }

    try {
      await db.user.create({
        data: {
          clerkId: data.id,
          email,
          firstName: data.first_name,
          lastName: data.last_name,
          username: data.username,
          imageUrl: data.image_url,
        },
      });
    } catch (err: any) {
      if (err.code === "P2002") {
        return new NextResponse("User already exists", { status: 400 });
      } else {
        return new NextResponse("DB error", { status: 500 });
      }
    }
  }

  return new NextResponse("Webhook received", { status: 200 });
}

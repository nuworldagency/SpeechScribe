import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { SubscriptionService } from "@/lib/subscription-service";

export async function GET(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const quota = await SubscriptionService.getQuota(userId);
    return NextResponse.json(quota);
  } catch (error: any) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { planId } = await request.json();
    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    const subscription = await SubscriptionService.createSubscription(userId, planId);
    return NextResponse.json(subscription);
  } catch (error: any) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { audioHours } = await request.json();
    if (typeof audioHours !== 'number' || audioHours <= 0) {
      return NextResponse.json(
        { error: "Invalid audio hours" },
        { status: 400 }
      );
    }

    await SubscriptionService.updateUsage(userId, audioHours);
    const updatedQuota = await SubscriptionService.getQuota(userId);
    return NextResponse.json(updatedQuota);
  } catch (error: any) {
    console.error("Error updating usage:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

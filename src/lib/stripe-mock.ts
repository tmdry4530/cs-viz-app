import { prisma } from "@/lib/db"

export interface CheckoutSession {
  url: string
  sessionId: string
}

export interface MockWebhookEvent {
  type: "checkout.session.completed" | "customer.subscription.deleted" | "invoice.payment_failed"
  data: {
    userId: string
    plan?: string
    subscriptionId?: string
  }
}

/**
 * Create a mock checkout session.
 * In production this would call Stripe's API.
 * Here we immediately activate the subscription.
 */
export async function createCheckoutSession(
  userId: string,
  plan: "pro"
): Promise<CheckoutSession> {
  const sessionId = `mock_cs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  // Mock: immediately create/update subscription
  await prisma.subscription.upsert({
    where: { userId },
    update: {
      plan,
      status: "active",
      stripeCustomerId: `mock_cus_${userId}`,
      stripeSubscriptionId: `mock_sub_${sessionId}`,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    create: {
      userId,
      plan,
      status: "active",
      stripeCustomerId: `mock_cus_${userId}`,
      stripeSubscriptionId: `mock_sub_${sessionId}`,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  return {
    url: `/pricing/success?session_id=${sessionId}`,
    sessionId,
  }
}

/**
 * Handle a mock webhook event.
 * In production this would verify Stripe signatures and process events.
 */
export async function handleWebhook(event: MockWebhookEvent): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      await prisma.subscription.upsert({
        where: { userId: event.data.userId },
        update: {
          plan: event.data.plan || "pro",
          status: "active",
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        create: {
          userId: event.data.userId,
          plan: event.data.plan || "pro",
          status: "active",
          stripeCustomerId: `mock_cus_${event.data.userId}`,
          stripeSubscriptionId: event.data.subscriptionId || `mock_sub_${Date.now()}`,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })
      break
    }

    case "customer.subscription.deleted": {
      await prisma.subscription.updateMany({
        where: { userId: event.data.userId },
        data: { status: "canceled", plan: "free" },
      })
      break
    }

    case "invoice.payment_failed": {
      await prisma.subscription.updateMany({
        where: { userId: event.data.userId },
        data: { status: "past_due" },
      })
      break
    }
  }
}

/**
 * Cancel a mock subscription.
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<{ success: boolean }> {
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  })

  if (!subscription) {
    return { success: false }
  }

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: "canceled", plan: "free" },
  })

  return { success: true }
}

/**
 * Get a mock customer portal URL.
 */
export function getCustomerPortalUrl(userId: string): string {
  return `/pricing?portal=true&user=${userId}`
}

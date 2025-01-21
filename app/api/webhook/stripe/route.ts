import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
// Removed incorrect import statement for Buffer

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-12-18.acacia",
});

const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET!;

export async function POST(req: Request) {
    const sig = (await headers()).get("stripe-signature");

    if (!sig) {
        return NextResponse.json(
            { error: "Missing Stripe signature header" },
            { status: 400 }
        );
    }

    let rawBody: Buffer;

    try {
        // Read raw body as a buffer (important for signature verification)
        rawBody = Buffer.from(await req.text(), "utf8");
    } catch (err: any) {
        console.error("Error reading raw body:", err.message);
        return NextResponse.json({ error: "Error reading raw body" }, { status: 500 });
    }

    let event: Stripe.Event;

    try {
        // Verify and construct the event
        event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } catch (err: any) {
        console.error(`⚠️ Webhook signature verification failed.`, err.message);
        return NextResponse.json(
            { error: "Webhook signature verification failed" },
            { status: 400 }
        );
    }

    // Handle the event types you are tracking
    try {
        switch (event.type) {
            case "payment_intent.succeeded":
                await onPaymentSucceeded(event.data.object as Stripe.PaymentIntent);
                break;

            case "payment_intent.payment_failed":
                await onPaymentFailed(event.data.object as Stripe.PaymentIntent);
                break;

            case "invoice.paid":
                await onInvoicePaid(event.data.object as Stripe.Invoice);
                break;

            case "invoice.payment_failed":
                await onInvoicePaymentFailed(event.data.object as Stripe.Invoice);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    } catch (err: any) {
        console.error("Error handling event:", err.message);
        return NextResponse.json({ error: "Error handling event" }, { status: 500 });
    }

    // Acknowledge receipt of the event
    return NextResponse.json({ received: true }, { status: 200 });
}

// Handlers for Stripe events
async function onPaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    console.log(`✅ Payment succeeded for PaymentIntent: ${paymentIntent.id}`);
    // TODO: Add your business logic (e.g., update database, send email)
}

async function onPaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    console.log(`❌ Payment failed for PaymentIntent: ${paymentIntent.id}`);
    // TODO: Notify user about payment failure
}

async function onInvoicePaid(invoice: Stripe.Invoice) {
    console.log(`✅ Invoice ${invoice.id} was paid`);
    // TODO: Grant access or record successful subscription payment
}

async function onInvoicePaymentFailed(invoice: Stripe.Invoice) {
    console.log(`❌ Invoice ${invoice.id} payment failed`);
    // TODO: Notify customer or retry payment
}
import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-12-18.acacia",
});

const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET!;

// Disable body parser for this route
export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(req: Request) {
    const sig = (await headers()).get("stripe-signature");

    if (!sig) {
        return NextResponse.json(
            { error: "Missing Stripe signature header" },
            { status: 400 }
        );
    }

    let rawBody: ArrayBuffer;
    let textBody: string;

    try {
        // Retrieve the raw body and decode it
        rawBody = await req.arrayBuffer();
        textBody = new TextDecoder().decode(rawBody);
    } catch (err: any) {
        console.error("Error reading raw body:", err.message);
        return NextResponse.json(
            { error: "Error reading raw body" },
            { status: 500 }
        );
    }

    let event: Stripe.Event;

    try {
        // Verify and construct the event
        event = stripe.webhooks.constructEvent(textBody, sig, endpointSecret);
    } catch (err: any) {
        console.error(`⚠️ Webhook signature verification failed.`, err.message);
        return NextResponse.json(
            { error: "Webhook signature verification failed" },
            { status: 400 }
        );
    }

    // Handle events
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

    return NextResponse.json({ received: true });
}

// Event handlers
async function onPaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    console.log(`✅ Payment succeeded for PaymentIntent: ${paymentIntent.id}`);
}

async function onPaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    console.log(`❌ Payment failed for PaymentIntent: ${paymentIntent.id}`);
}

async function onInvoicePaid(invoice: Stripe.Invoice) {
    console.log(`✅ Invoice ${invoice.id} was paid`);
}

async function onInvoicePaymentFailed(invoice: Stripe.Invoice) {
    console.log(`❌ Invoice ${invoice.id} payment failed`);
}
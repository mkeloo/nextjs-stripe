import Stripe from 'stripe';
import { NextResponse, NextRequest } from 'next/server';

const secretKey = process.env.STRIPE_SECRET_KEY!;
const stripe = new Stripe(secretKey, { apiVersion: '2024-12-18.acacia' })

export async function POST(req: NextRequest) {

    try {
        // log req.body entries
        const data = await req.json(); // Parse Json payload
        const { amount, currency } = data;

        // Append UUID to the payment intent data
        const paymentIntent = await stripe.paymentIntents.create({
            amount, // amount in cents (smallest currency unit)
            currency, // currency code e.g. usd
            automatic_payment_methods: {
                enabled: true,
            }
        });

        return NextResponse.json({ clientSecret: paymentIntent.client_secret }, { status: 200 });

    } catch (error: any) {
        console.error(error);
        return NextResponse.json(error.response.data, { status: error.response.status });
    }
}
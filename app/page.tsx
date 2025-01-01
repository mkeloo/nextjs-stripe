"use client";

import CheckoutPage from "@/components/CheckoutPage";
import convertToSubcurrency from "@/utils/convertToSubcurrency";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY === undefined) {
  throw new Error("Missing Stripe publishable key");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);


export default function Home() {
  const amount = 49.99;
  return (
    <main className="max-w-6xl mx-auto p-10 text-white text-center border m-10 rounded-md bg-gradient-to-tr from-blue-500 to-purple-500">
      <div className="mb-10">
        <h1 className="text-4xl font-extra bold mb-2">John</h1>
        <h2 className="text-2xl">
          has requested
          <span className="font-bold"> ${amount}</span>
        </h2>
      </div>

      <Elements stripe={stripePromise}>
        <CheckoutPage amount={amount} options={
          {
            mode: 'payment',
            amount: convertToSubcurrency(amount), // cents
            currency: 'usd',
          }
        } />
      </Elements>
    </main>
  );
}

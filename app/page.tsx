"use client";
import React, { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import CheckoutForm from '@/components/CheckoutForm'

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = loadStripe(publishableKey!);

export default function StripeExamplePage() {
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    // Fetch the client secret from your backend
    const fetchClientSecret = async () => {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: 1000, currency: 'usd' })
      });

      const data = await response.json();
      setClientSecret(data.clientSecret);
    }

    fetchClientSecret();
  }, []);

  if (!clientSecret) {
    return <div>Loading Payment Information...</div>;
  }

  return (
    <div className='w-full flex flex-col items-center justify-center'>
      <h1 className='text-3xl font-bold my-10'>Stripe Example Page</h1>

      <Elements stripe={stripePromise} options={{
        clientSecret,
        externalPaymentMethodTypes: ['external_paysafecard'],
      }}>
        <CheckoutForm />
      </Elements>
    </div>
  )
}


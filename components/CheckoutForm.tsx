'use client'
import { useState } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'



export default function CheckoutForm() {

    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: any) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/completion`,
            }
        });

        if (error.type === "card_error" || error.type === 'validation_error') {
            setMessage(error.message ?? '');
        } else {
            setMessage('An unknown error occurred');
        }

        setIsLoading(false);
    }

    return (
        <form id="payment-form" onSubmit={handleSubmit} className='w-full flex flex-col items-center justify-center gap-y-4 max-w-4xl mx-auto'>
            <h1 className='text-2xl font-bold text-indigo-700'>NextJS Stripe Payment Elements</h1>
            <div className='w-full'>
                <PaymentElement id="payment-element" />
            </div>
            <button disabled={isLoading || !stripe || !elements} id="submit">
                <span id="button-next">
                    {isLoading ? <div className='spinner' id='spinner' /> : 'Pay Now'}
                </span>
            </button>

            {message && <div id="payment-message" >{message}</div>}
        </form>
    )
}

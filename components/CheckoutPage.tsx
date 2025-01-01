"use client";
import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import convertToSubcurrency from '@/utils/convertToSubcurrency';

export default function CheckoutPage({ amount }: { amount: number }) {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState<string>();
    const [clientSecret, setClientSecret] = useState("");
    const [loading, setLoading] = useState(false);
    return (
        <div>CheckoutPage</div>
    )
}

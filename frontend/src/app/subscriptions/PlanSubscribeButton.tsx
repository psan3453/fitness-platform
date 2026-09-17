'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSubscriptionOrderAction, verifySubscriptionPaymentAction } from './actions';
import { RazorpayOptions, RazorpaySuccessResponse } from '@/types/razorpay';

interface PlanSubscribeButtonProps {
  planId: string;
  planName: string;
  userEmail?: string;
  disabled?: boolean;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PlanSubscribeButton({
  planId,
  planName,
  userEmail,
  disabled = false,
}: PlanSubscribeButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubscribe = async () => {
    if (loading || disabled) return;

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setStatusText('Preparing checkout...');

    try {
      // 1. Ensure Razorpay checkout script is loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded || typeof window === 'undefined' || !window.Razorpay) {
        setErrorMessage('Failed to load payment gateway. Please check your connection and try again.');
        setLoading(false);
        setStatusText(null);
        return;
      }

      // 2. Create order via Server Action
      const orderResult = await createSubscriptionOrderAction(planId);
      if (!orderResult.success || !orderResult.order) {
        setErrorMessage(orderResult.error || 'Failed to initialize subscription checkout.');
        setLoading(false);
        setStatusText(null);
        return;
      }

      const { order } = orderResult;
      setStatusText('Waiting for payment...');

      // 3. Configure Razorpay Standard Checkout
      const options: RazorpayOptions = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Fitness Platform',
        description: `${planName} Membership`,
        order_id: order.orderId,
        prefill: {
          email: userEmail || '',
        },
        theme: {
          color: '#2563eb', // Blue-600 to match platform branding
        },
        handler: async (response: RazorpaySuccessResponse) => {
          setStatusText('Verifying payment with server...');

          try {
            const verifyResult = await verifySubscriptionPaymentAction({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyResult.success) {
              setSuccessMessage('Payment verified! Your subscription is now active.');
              setStatusText(null);
              setLoading(false);
              router.refresh();
            } else {
              setErrorMessage(verifyResult.error || 'Payment verification failed. Please contact support.');
              setStatusText(null);
              setLoading(false);
            }
          } catch (verifyErr) {
            console.error('[PlanSubscribeButton] Verification error:', verifyErr);
            setErrorMessage('An error occurred while verifying your payment.');
            setStatusText(null);
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setStatusText(null);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      console.error('[PlanSubscribeButton] Checkout initiation error:', err);
      setErrorMessage('An unexpected error occurred while starting checkout.');
      setLoading(false);
      setStatusText(null);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <button
        type="button"
        onClick={handleSubscribe}
        disabled={disabled || loading}
        className={`w-full flex justify-center items-center py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors shadow-sm ${
          disabled
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200'
            : loading
            ? 'bg-blue-400 text-white cursor-wait'
            : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
        }`}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            {statusText || 'Processing...'}
          </span>
        ) : (
          'Subscribe Now'
        )}
      </button>

      {errorMessage && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2 text-center w-full">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mt-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-2 text-center w-full font-medium">
          {successMessage}
        </div>
      )}
    </div>
  );
}

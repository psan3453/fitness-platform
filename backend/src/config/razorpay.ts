import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

export function getRazorpayConfig(): { keyId: string; keySecret: string } {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    const error = new Error('Razorpay credentials missing. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.') as Error & { status: number };
    error.status = 500;
    throw error;
  }

  return { keyId, keySecret };
}

let razorpayClientInstance: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  if (!razorpayClientInstance) {
    const { keyId, keySecret } = getRazorpayConfig();
    razorpayClientInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpayClientInstance;
}

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'Twilio webhook endpoint active' });
  }
  
  if (req.method === 'POST') {
    // Return 200 to acknowledge receipt
    return res.status(200).json({ received: true });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

export const runtime = 'edge';

export async function GET() {
  return new Response(JSON.stringify({ status: 'Twilio webhook edge active' }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.formData();
    const from = body.get('From');
    const messageBody = body.get('Body');
    
    console.log('Edge webhook received:', { from, body: messageBody });
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Edge webhook error:', error);
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

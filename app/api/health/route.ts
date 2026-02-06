/**
 * Health check API route
 * Used by Vercel cron to keep the app warm
 */
export async function GET() {
  return Response.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
}

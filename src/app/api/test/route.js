export async function GET(request) {
  console.log('Test API GET called');
  return Response.json({
    success: true,
    message: 'Test API is working',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request) {
  console.log('Test API POST called');
  const body = await request.json();
  return Response.json({
    success: true,
    message: 'Test API POST is working',
    data: body,
    timestamp: new Date().toISOString()
  });
}

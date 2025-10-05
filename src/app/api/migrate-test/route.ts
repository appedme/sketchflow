import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Migration API is accessible',
    timestamp: new Date().toISOString(),
  });
}

export async function POST() {
  return NextResponse.json({
    status: 'ok', 
    message: 'POST endpoint works',
    timestamp: new Date().toISOString(),
  });
}

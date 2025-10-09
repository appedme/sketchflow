import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const provider = searchParams.get('provider') || 'pexels';
    const perPage = parseInt(searchParams.get('perPage') || '15');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    if (provider === 'pexels') {
      const API_KEY = process.env.PEXELS_API_KEY;

      if (!API_KEY) {
        return NextResponse.json(
          { error: 'Pexels API key not configured' },
          { status: 500 }
        );
      }

      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}`,
        {
          headers: {
            Authorization: API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.statusText}`);
      }

      const data = await response.json();

      return NextResponse.json({
        images: data.photos,
        total: data.total_results,
        page: data.page,
        perPage: data.per_page,
      });
    }

    return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
  } catch (error: any) {
    console.error('Image search error:', error);
    return NextResponse.json(
      { error: 'Failed to search images', message: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { sampleChallenges } from '@/lib/loaders/challenges';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const unit = searchParams.get('unit') || undefined;
    const subunit = searchParams.get('subunit') || undefined;
    const tags = (searchParams.get('tags') || '').split(',').filter(Boolean);
    
    const items = sampleChallenges({ unit, subunit, tags });
    
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
}




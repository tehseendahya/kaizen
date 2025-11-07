import { NextRequest, NextResponse } from 'next/server';
import { sampleQuestions } from '@/lib/loaders/questions';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const unit = searchParams.get('unit') || undefined;
    const subunit = searchParams.get('subunit') || undefined;
    const tags = (searchParams.get('tags') || '').split(',').filter(Boolean);
    const n = Number(searchParams.get('n') || 5);
    
    const items = sampleQuestions({ unit, subunit, tags, n });
    
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}




import { NextRequest, NextResponse } from 'next/server';
import { getAllProperties } from '../../components/utils/contractInteraction';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Get all properties
    const allProperties = await getAllProperties();
    
    // If featured is requested, sort by value and take the top ones
    let result = allProperties;
    if (featured) {
      result = allProperties
        .sort((a: any, b: any) => parseInt(b.value) - parseInt(a.value))
        .slice(0, limit);
    } else if (limit) {
      result = allProperties.slice(0, limit);
    }
    
    // Ensure result is always an array
    if (!Array.isArray(result)) {
      result = [];
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in properties API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}
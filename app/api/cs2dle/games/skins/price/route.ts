import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

interface SteamPrices {
  last_24h: number;
  last_7d: number;
  last_30d: number;
  last_90d: number;
  last_ever: number;
}

interface PriceData {
  steam: SteamPrices;
}

// Helper function to chunk array into smaller pieces
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Helper function to retry operations
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
}

export async function POST() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/ByMykel/counter-strike-price-tracker/main/static/prices/latest.json');
    const data = await response.json();

    // Ensure we have valid data
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data format received from API');
    }

    // Transform the data into an array of documents
    const skins = Object.entries(data).map(([name, priceData]) => {
      const steamPrices = (priceData as PriceData).steam || {};
      return {
        name,
        prices: {
          last_24h: Number(steamPrices.last_24h) || 0,
          last_7d: Number(steamPrices.last_7d) || 0,
          last_30d: Number(steamPrices.last_30d) || 0,
          last_90d: Number(steamPrices.last_90d) || 0,
          last_ever: Number(steamPrices.last_ever) || 0
        },
        updatedAt: new Date()
      };
    });

    // Get MongoDB connection with retry
    const client = await retryOperation(() => clientPromise);
    const db = client.db();
    
    // Clear existing data with retry
    await retryOperation(() => db.collection('skinprices').deleteMany({}));
    
    if (skins.length > 0) {
      // Split into chunks of 100 documents
      const chunks = chunkArray(skins, 100);
      
      // Process each chunk with retry
      for (const chunk of chunks) {
        await retryOperation(() => db.collection('skinprices').insertMany(chunk));
      }
    }

    return NextResponse.json(
      { message: 'Prices updated successfully', count: skins.length },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error updating skins:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message: 'Failed to update skins', error: errorMessage },
      { status: 500 }
    );
  }
} 
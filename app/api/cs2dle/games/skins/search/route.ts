import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db();

    // If query is empty, return empty results
    if (!query.trim()) {
      return NextResponse.json({ 
        skins: [],
        hasMore: false,
        total: 0
      });
    }

    // Create multiple search patterns for flexible matching
    const searchPatterns = createSearchPatterns(query.trim());
    
    // Build aggregation pipeline for flexible search with relevance scoring
    const pipeline = [
      {
        $match: {
          $and: [
            { updatedAt: { $exists: true } },
            { $or: searchPatterns }
          ]
        }
      },
      {
        $addFields: {
          relevanceScore: {
            $sum: [
              // Exact match gets highest score
              { $cond: [{ $eq: [{ $toLower: "$name" }, query.toLowerCase()] }, 1000, 0] },
              // Starts with query
              { $cond: [{ $regexMatch: { input: { $toLower: "$name" }, regex: `^${query.toLowerCase()}` } }, 500, 0] },
              // Contains query as whole word
              { $cond: [{ $regexMatch: { input: { $toLower: "$name" }, regex: `\\b${query.toLowerCase()}\\b` } }, 300, 0] },
              // Contains query anywhere
              { $cond: [{ $regexMatch: { input: { $toLower: "$name" }, regex: query.toLowerCase() } }, 100, 0] },
              // First and last word exact match
              { $cond: [{ $regexMatch: { input: { $toLower: "$name" }, regex: `^${query.toLowerCase().split(' ')[0]}.*${query.toLowerCase().split(' ').slice(-1)[0]}$` } }, 400, 0] },
              // First and last word flexible match
              { $cond: [{ $regexMatch: { input: { $toLower: "$name" }, regex: `.*${query.toLowerCase().split(' ')[0]}.*${query.toLowerCase().split(' ').slice(-1)[0]}.*` } }, 250, 0] },
              // Word boundary matches
              { $cond: [{ $regexMatch: { input: { $toLower: "$name" }, regex: `\\b${query.toLowerCase().split(' ').join('.*\\b.*')}\\b` } }, 150, 0] }
            ]
          }
        }
      },
      {
        $match: {
          relevanceScore: { $gt: 0 }
        }
      },
      {
        $sort: { relevanceScore: -1, name: 1 }
      },
      {
        $project: { 
          name: 1, 
          image: 1, 
          _id: 1, 
          weapon: 1, 
          category: 1, 
          id: 1, 
          rarity: 1, 
          collections: 1,
          relevanceScore: 1
        }
      },
      {
        $facet: {
          skins: [
            { $skip: skip },
            { $limit: limit }
          ],
          total: [
            { $count: "count" }
          ]
        }
      }
    ];

    const result = await db.collection('csgoskins').aggregate(pipeline).toArray();
    
    const skins = result[0]?.skins || [];
    const total = result[0]?.total[0]?.count || 0;

    return NextResponse.json({ 
      skins,
      hasMore: skip + skins.length < total,
      total
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search skins' },
      { status: 500 }
    );
  }
}

function createSearchPatterns(query: string): Array<{ name: { $regex: string, $options: string } }> {
  const patterns = [];
  const words = query.split(' ').filter(word => word.length > 0);
  
  // Exact match
  patterns.push({ name: { $regex: query, $options: 'i' } });
  
  // Individual word matches (including single characters)
  words.forEach(word => {
    patterns.push({ name: { $regex: `\\b${word}`, $options: 'i' } });
    patterns.push({ name: { $regex: word, $options: 'i' } });
  });
  
  // First and last word combination
  if (words.length >= 2) {
    const firstWord = words[0];
    const lastWord = words[words.length - 1];
    if (firstWord !== lastWord) {
      // Exact first and last word match
      patterns.push({ 
        name: { 
          $regex: `^${firstWord}.*${lastWord}$`, 
          $options: 'i' 
        } 
      });
      // Word boundary first and last word match
      patterns.push({ 
        name: { 
          $regex: `\\b${firstWord}.*\\b${lastWord}`, 
          $options: 'i' 
        } 
      });
      // Flexible first and last word match (words can be anywhere)
      patterns.push({ 
        name: { 
          $regex: `.*${firstWord}.*${lastWord}.*`, 
          $options: 'i' 
        } 
      });
    }
  }
  
  // Multi-word combinations (for 3+ words)
  if (words.length >= 3) {
    const firstWord = words[0];
    const lastWord = words[words.length - 1];
    const middleWords = words.slice(1, -1);
    
    // First, middle, last word pattern
    patterns.push({ 
      name: { 
        $regex: `.*${firstWord}.*${middleWords.join('.*')}.*${lastWord}.*`, 
        $options: 'i' 
      } 
    });
  }
  
  return patterns;
}
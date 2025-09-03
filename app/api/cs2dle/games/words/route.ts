import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

interface WordleWord {
  word: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
}

// GET - Fetch all Wordle words
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    const words = await db.collection('wordleWords')
      .find({})
      .sort({ word: 1 })
      .toArray();

    return NextResponse.json({ 
      words: words.map(word => ({
        _id: word._id.toString(),
        word: word.word,
        createdAt: word.createdAt,
        updatedAt: word.updatedAt,
        createdBy: word.createdBy
      }))
    });
  } catch (error) {
    console.error('Error fetching Wordle words:', error);
    return NextResponse.json(
      { error: 'Failed to fetch words' },
      { status: 500 }
    );
  }
}

// POST - Add new Wordle word
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { word } = await request.json();

    if (!word || typeof word !== 'string') {
      return NextResponse.json(
        { error: 'Word is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate word format (5 letters, uppercase)
    const cleanWord = word.trim().toUpperCase();
    if (!/^[A-Z]{5}$/.test(cleanWord)) {
      return NextResponse.json(
        { error: 'Word must be exactly 5 letters' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    
    // Check if word already exists
    const existingWord = await db.collection('wordleWords').findOne({
      word: cleanWord
    });

    if (existingWord) {
      return NextResponse.json(
        { error: 'Word already exists' },
        { status: 409 }
      );
    }

    // Add new word
    const newWord: WordleWord = {
      word: cleanWord,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: session.user?.email || 'unknown'
    };

    const result = await db.collection('wordleWords').insertOne(newWord);

    return NextResponse.json({
      message: 'Word added successfully',
      word: {
        _id: result.insertedId.toString(),
        word: cleanWord,
        createdAt: newWord.createdAt,
        updatedAt: newWord.updatedAt,
        createdBy: newWord.createdBy
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding Wordle word:', error);
    return NextResponse.json(
      { error: 'Failed to add word' },
      { status: 500 }
    );
  }
}

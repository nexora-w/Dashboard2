import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

interface GameAnswerData {
  skinId: string;
  emojis?: string[];
  hints?: string[];
  skin?: {
    id: string;
    name: string;
    description: string;
    image: string;
    weapon: string;
    category: string;
    pattern: string;
    rarity: {
      id: string;
      name: string;
      color: string;
    };
    team: string;
    stattrak: boolean;
    souvenir: boolean;
  };
}

interface AnswersData {
  [key: string]: GameAnswerData;
}

interface QueryFilter {
  [key: string]: { $exists: boolean } | { $in: string[] };
}

interface SkinDetails {
  id: string;
  name: string;
  description: string;
  image: string;
  weapon: { name: string };
  category: { name: string };
  pattern: { name: string };
  rarity: {
    id: string;
    name: string;
    color: string;
  };
  team: { name: string };
  stattrak: boolean;
  souvenir: boolean;
}

interface SkinMap {
  [key: string]: {
    id: string;
    name: string;
    description: string;
    image: string;
    weapon: string;
    category: string;
    pattern: string;
    rarity: {
      id: string;
      name: string;
      color: string;
    };
    team: string;
    stattrak: boolean;
    souvenir: boolean;
  };
}

interface GameAnswer {
  _id?: string;
  answers: {
    [key: string]: GameAnswerData;
  };
  date: string;
  status: string;
  createdBy?: string;
  lastModifiedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get gameType from URL parameters
    const { searchParams } = new URL(request.url);
    const gameType = searchParams.get('gameType');

    const client = await clientPromise;
    const db = client.db();

    // Build query based on gameType
    const query: QueryFilter = {};
    if (gameType) {
      query[`answers.${gameType}`] = { $exists: true };
    }

    // Get game answers sorted by date
    const answers = await db.collection('gameanswers')
      .find(query)
      .sort({ date: -1 })
      .limit(100)
      .toArray();

    // Extract skinIds based on gameType
    const skinIds = answers.map(answer => {
      const typedAnswer = answer as unknown as GameAnswer;
      if (gameType) {
        return typedAnswer.answers?.[gameType]?.skinId;
      }
      // If no gameType specified, get all skinIds
      return Object.values(typedAnswer.answers || {})
        .map(game => game?.skinId)
        .filter(Boolean);
    }).flat().filter(Boolean);

    // Get all referenced skins in one query
    const skins = (await db.collection('csgoskins')
      .find({ id: { $in: skinIds } })
      .toArray()) as unknown as SkinDetails[];

    // Create a map of skinId to skin details for easy lookup
    const skinMap = skins.reduce((map: SkinMap, skin) => {
      map[skin.id] = {
        id: skin.id,
        name: skin.name,
        description: skin.description,
        image: skin.image,
        weapon: skin.weapon.name,
        category: skin.category.name,
        pattern: skin.pattern.name,
        rarity: {
          id: skin.rarity.id,
          name: skin.rarity.name,
          color: skin.rarity.color
        },
        team: skin.team.name,
        stattrak: skin.stattrak,
        souvenir: skin.souvenir
      };
      return map;
    }, {});

    // Enhance answers with skin details
    const enhancedAnswers = answers.map(answer => {
      const typedAnswer = answer as unknown as GameAnswer;
      const enhancedAnswer = {
        ...typedAnswer,
        answers: {} as AnswersData,
        date: typedAnswer.date,
        status: typedAnswer.status,
        createdBy: typedAnswer.createdBy,
        lastModifiedBy: typedAnswer.lastModifiedBy,
        createdAt: typedAnswer.createdAt,
        updatedAt: typedAnswer.updatedAt
      };

      // Only include the requested game type or all if no specific type requested
      if (gameType) {
        if (typedAnswer.answers?.[gameType]) {
          enhancedAnswer.answers[gameType] = {
            ...typedAnswer.answers[gameType],
            skin: skinMap[typedAnswer.answers[gameType].skinId]
          };
        }
      } else {
        // Include all game types if no specific type requested
        Object.entries(typedAnswer.answers || {}).forEach(([type, data]) => {
          if (data?.skinId) {
            enhancedAnswer.answers[type] = {
              ...data,
              skin: skinMap[data.skinId]
            };
          }
        });
      }

      return enhancedAnswer;
    });

    return NextResponse.json({ answers: enhancedAnswers });
  } catch (error) {
    console.error('Error fetching answers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch answers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    if (!data.date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    if (isNaN(Date.parse(data.date))) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // const existingAnswer = await db.collection('gameanswers').findOne({ date: data.date });
    // if (existingAnswer) {
    //   return NextResponse.json(
    //     { error: 'An answer already exists for this date' },
    //     { status: 400 }
    //   );
    // }

    const answer = await db.collection('gameanswers').insertOne({
      ...data,
      createdBy: session.user.email,
      lastModifiedBy: session.user.email,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ answer }, { status: 201 });
  } catch (error) {
    console.error('Error creating answer:', error);
    return NextResponse.json(
      { error: 'Failed to create answer' },
      { status: 500 }
    );
  }
} 
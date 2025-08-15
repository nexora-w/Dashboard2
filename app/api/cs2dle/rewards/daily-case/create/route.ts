import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      skinId,
      name,
      description,
      image,
      weapon,
      category,
      pattern,
      min_float,
      max_float,
      rarity,
      paint_index,
      probability,
      price,
      status = "active",
      stattrak = false,
      souvenir = false,
    } = body;

    // Validate required fields
    if (!name || !image || !weapon || !category || !pattern || !rarity) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Create the new precase item
    const newPreCase = {
      skinId: skinId || `skin_${Date.now()}`,
      name,
      description: description || "",
      image,
      weapon: {
        id: weapon.id || `weapon_${Date.now()}`,
        weapon_id: weapon.weapon_id || 0,
        name: weapon.name,
      },
      category: {
        id: category.id || `category_${Date.now()}`,
        name: category.name,
      },
      pattern: {
        id: pattern.id || `pattern_${Date.now()}`,
        name: pattern.name,
      },
      min_float: min_float !== undefined ? min_float : null,
      max_float: max_float !== undefined ? max_float : null,
      rarity: {
        id: rarity.id || `rarity_${Date.now()}`,
        name: rarity.name,
        color: rarity.color || "#b0c3d9",
      },
      paint_index: paint_index || null,
      probability: probability || 0,
      price: price || 0,
      status,
      stattrak,
      souvenir,
      createdBy: session.user.email,
      lastModifiedBy: session.user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
      isManual: true,
    };

    const result = await db.collection("precases").insertOne(newPreCase);

    if (result.acknowledged) {
      return NextResponse.json({
        success: true,
        message: "Precase item created successfully",
        precase: { ...newPreCase, _id: result.insertedId },
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Failed to create precase item" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating precase:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

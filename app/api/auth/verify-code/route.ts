import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';

const verifyCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  type: z.enum(['signup', 'signin']),
  username: z.string().optional(), // Only required for signup
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = verifyCodeSchema.parse(body);
    
    const client = await clientPromise;
    const db = client.db();
    
    // Find the verification code
    const verificationCode = await db.collection('verificationCodes').findOne({
      email: validatedData.email,
      code: validatedData.code,
      type: validatedData.type
    });
    
    if (!verificationCode) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }
    
    // Check if code has expired
    if (new Date() > new Date(verificationCode.expiresAt)) {
      return NextResponse.json(
        { error: 'Verification code has expired' },
        { status: 400 }
      );
    }
    
    if (validatedData.type === 'signup') {
      // Create new user
      if (!validatedData.username) {
        return NextResponse.json(
          { error: 'Username is required for signup' },
          { status: 400 }
        );
      }
      
      const newUser = await db.collection('admins').insertOne({
        name: validatedData.username,
        email: validatedData.email,
        status: 'Active',
        role: 'admin'
      });
      
      // Delete the verification code
      await db.collection('verificationCodes').deleteOne({
        email: validatedData.email,
        code: validatedData.code
      });
      
      return NextResponse.json(
        { 
          message: 'User created successfully',
          userId: newUser.insertedId.toString()
        },
        { status: 201 }
      );
    } else {
      // For signin, just verify the code is valid
      // The actual authentication will be handled by NextAuth
      
      // Delete the verification code
      await db.collection('verificationCodes').deleteOne({
        email: validatedData.email,
        code: validatedData.code
      });
      
      return NextResponse.json(
        { message: 'Code verified successfully' },
        { status: 200 }
      );
    }
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Verify code error:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
} 
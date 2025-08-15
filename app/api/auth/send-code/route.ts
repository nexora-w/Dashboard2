import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';

const sendCodeSchema = z.object({
  email: z.string().email(),
  type: z.enum(['signup', 'signin']),
});

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  host: 'mail.privateemail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Generate a 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = sendCodeSchema.parse(body);
    
    const client = await clientPromise;
    const db = client.db();
    
    // Check if user exists for signin, or doesn't exist for signup
    const existingUser = await db.collection('admins').findOne({
      email: validatedData.email
    });
    
    if (validatedData.type === 'signin' && !existingUser) {
      return NextResponse.json(
        { error: 'No user found with this email' },
        { status: 404 }
      );
    }
    
    if (validatedData.type === 'signup' && existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }
    
    // Generate 6-digit code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Store the code in database
    await db.collection('verificationCodes').updateOne(
      { email: validatedData.email },
      {
        $set: {
          email: validatedData.email,
          code,
          type: validatedData.type,
          expiresAt,
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    
    // Send email
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: validatedData.email,
      subject: `Verification Code - ${validatedData.type === 'signup' ? 'Sign Up' : 'Sign In'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Verification Code</h2>
          <p>Your 6-digit verification code is:</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    return NextResponse.json(
      { message: 'Verification code sent successfully' },
      { status: 200 }
    );
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Send code error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/options';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'No valid session found' },
        { status: 401 }
      );
    }

    // Generate JWT token using the same secret as Express server
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret'; // Use same default as Express server
    
    const token = jwt.sign(
      { 
        id: session.user.id, 
        email: session.user.email, 
        role: session.user.role 
      }, 
      JWT_SECRET, 
      { expiresIn: '8h' }
    );

    return NextResponse.json({
      success: true,
      token: token
    });
  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate token' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { z } from 'zod';

const emailSchema = z.object({
  email: z.string().email(),
  tableName: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, tableName = 'waitlist' } = emailSchema.parse(body);

    // Use supabaseAdmin client with service role
    const { error } = await supabaseAdmin
      .from(tableName)
      .insert({ email });

    // Handle duplicate emails gracefully
    if (error?.code === '23505') {
      return NextResponse.json({ ok: true, message: "You're already on the list!" });
    }

    if (error) {
      console.error('Error inserting to waitlist:', error);
      return NextResponse.json(
        { error: `Failed to join waitlist: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      ok: true, 
      message: "You're on the list! Check your inbox soon." 
    });
  } catch (err) {
    console.error('Waitlist submission error:', err);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
} 
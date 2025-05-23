import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import resend from '@/lib/resend';
import ContactEmailTemplate from '@/components/ContactEmailTemplate';

const FROM_EMAIL = process.env.FROM_EMAIL ?? 'support@dock108.ai';

export async function POST(req: Request) {
  try {
    const { name, email, message, website } = await req.json();

    // Honeypot check - reject if honeypot field is filled (likely a bot)
    if (website) {
      console.log('Honeypot triggered, likely a bot submission');
      return NextResponse.json({ error: 'bot' }, { status: 400 });
    }

    // Validate required fields
    if (!email || !message) {
      return NextResponse.json({ error: 'missing' }, { status: 400 });
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
    }

    // Check message length
    if (message.length > 1000) {
      return NextResponse.json({ error: 'message_too_long' }, { status: 400 });
    }

    // Insert into support_requests table
    await supabaseAdmin.from('support_requests').insert({
      name,
      email,
      message,
    });

    // Send notification email
    await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: process.env.FEEDBACK_RECIPIENT_EMAIL!,
      subject: 'New DOCK108 contact form submission',
      react: ContactEmailTemplate({ name, email, message }) as React.ReactElement,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error('Error processing contact form submission:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 },
    );
  }
}

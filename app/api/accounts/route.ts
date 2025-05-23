import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { /* NextRequest, */ NextResponse } from 'next/server';
import { Database } from '@/types/supabase';

// Select fields needed by the frontend
// Join stripe_accounts with account_backfill_status
const ACCOUNTS_QUERY = `
  id, 
  stripe_account_id, 
  status, 
  scope, 
  created_at, 
  rule_set_id,
  rule_sets ( id, name ), 
  account_backfill_status ( status, progress, error_message, updated_at )
`;

// GET: Fetch all accounts with their assigned rule set names
export async function GET(/* _request: NextRequest */) {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } },
  );

  try {
    // Get current user - RLS relies on this being set
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Fetch accounts for the user
    // RLS on stripe_accounts ensures user can only select their own.
    const { data: accountsData, error: accountsError } = await supabase
      .from('stripe_accounts')
      .select(ACCOUNTS_QUERY)
      .order('created_at', { ascending: false });

    if (accountsError) {
      console.error('Error fetching connected accounts:', accountsError);
      return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
    }

    // Transform data slightly for frontend consistency?
    // e.g., flatten backfill status
    const transformedAccounts =
      accountsData?.map((acc) => ({
        ...acc,
        backfill_status: acc.account_backfill_status[0]?.status ?? 'unknown',
        backfill_progress: acc.account_backfill_status[0]?.progress ?? 0,
        backfill_error: acc.account_backfill_status[0]?.error_message ?? null,
        backfill_updated_at: acc.account_backfill_status[0]?.updated_at ?? null,
        rule_set_name: acc.rule_sets?.name ?? 'Default', // Provide default name if null/no join
        // Remove nested objects if not needed
        account_backfill_status: undefined,
        rule_sets: undefined,
      })) ?? [];

    return NextResponse.json(transformedAccounts);
  } catch (error: any) {
    console.error('Unexpected error in /api/accounts GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/accounts - Link a new Stripe account
export async function POST(/* _request: Request */) {
  console.log('POST /api/accounts called');
  // const supabase = createServerClient<Database>( // Removed unused variable
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  //   { cookies: { get: (name) => cookies().get(name)?.value } },
  // );

  // ... existing code ...
  // The actual logic for POST (likely creating a Stripe connect link)
  // should use a Supabase client if it needs user info or to store state.
  // If the entire POST logic was removed, this function might be obsolete.
  // For now, just removing the unused client.
  return NextResponse.json({ message: 'POST handler needs implementation' }, { status: 501 });
}

import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabaseServer';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = supabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login?next=/settings');
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {children}
    </div>
  );
}

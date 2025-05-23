import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Database } from '@/types/supabase';
// import RetentionStatusBadge from './admin/RetentionStatusBadge';
import { RssIcon } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';

export async function Footer() {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const isAdmin = session?.user?.user_metadata?.role === 'admin';

  return (
    <footer className="py-12">
      <Container className="flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row md:justify-between">
        <div className="flex items-center gap-4">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 DOCK108
          </p>
          {/* {isAdmin && <RetentionStatusBadge />} */}
        </div>
        <div className="flex gap-4">
          <Link
            href="https://twitter.com/dock108dev"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4 text-sm text-muted-foreground hover:text-foreground"
          >
            Twitter
          </Link>
          <Link
            href="/docs"
            className="font-medium underline underline-offset-4 text-sm text-muted-foreground hover:text-foreground"
          >
            Docs
          </Link>
          <Link
            href="/contact"
            className="font-medium underline underline-offset-4 text-sm text-muted-foreground hover:text-foreground"
          >
            Contact
          </Link>
          <Link
            href="/rss.xml"
            className="font-medium underline underline-offset-4 text-sm text-muted-foreground hover:text-foreground"
          >
            RSS
          </Link>
          <Link
            href="/feed.xml"
            aria-label="RSS Feed"
            title="RSS Feed"
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <RssIcon className="h-5 w-5" />
          </Link>
        </div>
      </Container>
    </footer>
  );
}

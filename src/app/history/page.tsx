import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function HistoryRedirectPage() {
  redirect('/r/the-pit-cafe/history');
}

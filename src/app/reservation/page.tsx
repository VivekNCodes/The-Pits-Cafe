import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function ReservationRedirectPage() {
  redirect('/r/the-pit-cafe/reservation');
}

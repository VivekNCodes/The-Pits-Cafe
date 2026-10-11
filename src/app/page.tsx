import RestaurantPage, { generateMetadata as generateRestMetadata } from './r/[slug]/page';

export async function generateMetadata() {
  return generateRestMetadata({ params: { slug: 'the-pit-cafe' } });
}

export default async function HomePage() {
  return RestaurantPage({ params: { slug: 'the-pit-cafe' } });
}

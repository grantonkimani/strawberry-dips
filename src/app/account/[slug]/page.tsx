'use client';

import { redirect, useParams, useRouter } from 'next/navigation';
import CustomerAccountPage from '../page';

export default function CustomerAccountBySlug() {
  // Reuse the same account dashboard; the slug is cosmetic
  return <CustomerAccountPage />;
}



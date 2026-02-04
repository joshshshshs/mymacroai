/**
 * Profile Tab - Redirect to Profile Modal
 * This tab exists for deep linking but redirects to the modal
 */

import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function ProfileTab() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the profile modal
    router.replace('/(modals)/profile' as any);
  }, [router]);

  return null;
}

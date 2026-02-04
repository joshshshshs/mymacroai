import { Redirect } from 'expo-router';

/**
 * Home Tab - Redirects to Dashboard
 */
export default function HomeTab() {
  return <Redirect href="/dashboard" />;
}
import { redirect } from 'next/navigation';

/**
 * /register redirect page.
 * Signup is embedded in /login?mode=signup
 */
export default function RegisterRedirect() {
  redirect('/login?mode=signup');
}

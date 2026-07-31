import { redirect } from 'next/navigation';

/**
 * /signup redirect page.
 * Signup is embedded in /login?mode=signup
 */
export default function SignupRedirect() {
  redirect('/login?mode=signup');
}

import Navbar from './Navbar';
import { getAuthUser } from '@/lib/auth/session';

export default async function ServerNavbar() {
  const user = await getAuthUser();
  return <Navbar user={user} />;
}

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TestUploadClient from './TestUploadClient';

export default async function TestUploadPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/professor/test-upload');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, username')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'professor' && profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="p-8 border border-red-200 rounded-xl bg-white shadow-sm">
          <h1 className="text-2xl font-semibold text-red-600 mb-2">403 • Professor Access Only</h1>
          <p className="text-gray-600">You must have professor role to access this page.</p>
        </div>
      </div>
    );
  }

  return <TestUploadClient userId={user.id} username={profile?.username || user.email || ''} />;
}


'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';

export default function Homepage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 drop-shadow-lg">Welcome to Arcane Archives</h2>
      <p className="text-lg md:text-2xl text-slate-300 mb-8 max-w-2xl">
        Your personal companion for organizing and exploring D&D adventures. Create, categorize, and search notes for all your campaign details.
      </p>
      <div className="flex space-x-4">
        <Link href="/my-worlds" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all text-lg">Go to My Worlds</Link>
        <Link href="/my-parties" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all text-lg">Go to My Parties</Link>
      </div>
    </div>
  );
}
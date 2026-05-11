'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, User, LogOut, Award, Star, Mail, Shield, Lock } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase
          .from('gamification')
          .select('*')
          .eq('user_email', user.email!)
          .single();
        setStats(data);
      }
      setLoading(false);
    }
    getProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setUpdateStatus({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }

    setUpdatingPassword(true);
    setUpdateStatus(null);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setUpdateStatus({ type: 'error', message: error.message });
    } else {
      setUpdateStatus({ type: 'success', message: 'Password updated successfully!' });
      setNewPassword('');
    }
    setUpdatingPassword(false);
  };

  const getLevel = (xp: number) => {
    if (xp >= 3500) return 3;
    if (xp >= 1500) return 2;
    if (xp >= 500) return 1;
    return 0;
  };

  if (loading) return null;

  return (
    <div className="flex flex-col min-h-screen bg-navy text-white pb-safe">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full bg-navy/95 backdrop-blur-xl border-b border-white/5 pt-safe px-6">
        <div className="flex items-center gap-4 h-16">
          <Link href="/" className="flex items-center gap-1.5 text-zinc-400 active:text-teal transition-colors shrink-0">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-bold">Back</span>
          </Link>
          <div className="flex-1 text-center">
            <h1 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
              Account Settings
            </h1>
          </div>
          <div className="w-12 shrink-0" />
        </div>
      </header>

      <main className="flex-1 p-6 space-y-8">
        {/* Profile Card */}
        <section className="space-y-4">
          <div className="flex flex-col items-center py-6">
            <div className="w-24 h-24 rounded-full bg-teal/10 border-2 border-teal/20 flex items-center justify-center mb-4 relative shadow-2xl shadow-teal/5">
              <User className="w-10 h-10 text-teal" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-navy border-2 border-teal rounded-full flex items-center justify-center shadow-lg">
                <span className="text-teal text-xs font-black">L{getLevel(stats?.xp_points || 0)}</span>
              </div>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">{user?.email?.split('@')[0]}</h2>
            <p className="text-xs font-bold text-zinc-500 tracking-widest uppercase">{user?.email}</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-teal/10 rounded-2xl flex items-center justify-center text-teal shadow-inner">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Current Level</p>
                <p className="text-lg font-black text-white">Level {getLevel(stats?.xp_points || 0)}</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber/10 rounded-2xl flex items-center justify-center text-amber shadow-inner">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total Experience</p>
                <p className="text-lg font-black text-white">{stats?.xp_points || 0} XP</p>
              </div>
            </div>
          </div>
        </section>

        {/* Update Password */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Lock className="w-4 h-4 text-teal" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Security Update</h3>
          </div>
          
          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <div className="relative">
              <input 
                type="password"
                placeholder="New Secure Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-base font-bold outline-none focus:border-teal/50 transition-all placeholder:text-zinc-600"
              />
            </div>
            
            <button 
              type="submit"
              disabled={updatingPassword || !newPassword}
              className="w-full bg-teal text-navy py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-xl shadow-teal/10"
            >
              {updatingPassword ? 'Syncing...' : 'Update Password'}
            </button>

            {updateStatus && (
              <div className={`p-4 rounded-2xl text-center animate-in fade-in slide-in-from-top-2 duration-300 ${
                updateStatus.type === 'success' ? 'bg-teal/10 text-teal border border-teal/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
              }`}>
                <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                  {updateStatus.message}
                </p>
              </div>
            )}
          </form>
        </section>

        {/* Security / Info */}
        <section className="space-y-3">
           <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
              <div className="p-4 border-b border-white/5 flex items-center gap-3">
                <Mail className="w-4 h-4 text-zinc-500" />
                <span className="text-sm font-bold text-zinc-300">{user?.email}</span>
              </div>
              <div className="p-4 flex items-center gap-3">
                <Shield className="w-4 h-4 text-zinc-500" />
                <span className="text-sm font-bold text-zinc-300">Active Session</span>
              </div>
           </div>
        </section>

        {/* Danger Zone */}
        <section className="pt-10">
          <button 
            onClick={handleSignOut}
            className="w-full border-2 border-red-500/50 bg-red-500/10 text-red-500 py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-red-500/5"
          >
            <LogOut className="w-5 h-5" />
            Secure Sign Out
          </button>
        </section>
      </main>
    </div>
  );
}

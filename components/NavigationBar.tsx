"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { ICON_MAP } from "@/lib/icons";
import React from "react";
import { User } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";

export default function NavigationBar() {
  const [user, setUser] = useState<User | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Hide nav if on /my-worlds and login form is present
  useEffect(() => {
    if (pathname === "/my-worlds" && typeof window !== "undefined") {
      if (document.body.innerText.includes("Sign in with Google")) {
        setHideNav(true);
      } else {
        setHideNav(false);
      }
    } else {
      setHideNav(false);
    }
  }, [pathname]);
  const [hideNav, setHideNav] = useState(false);
  if (hideNav) return null;

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [profileOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfileOpen(false);
    router.push('/my-worlds');
  };

  return (
    <nav className="bg-slate-800/90 border-b border-slate-700 shadow-xl z-10">
      <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">🎲 Arcane Archives</h1>
        <div className="flex space-x-6 items-center relative" ref={profileRef}>
          <Link href="/" className="text-slate-300 hover:text-white font-medium transition-colors">Home</Link>
          <Link href="/my-worlds" className="text-slate-300 hover:text-white font-medium transition-colors">My Worlds</Link>
          <Link href="/my-parties" className="text-slate-300 hover:text-white font-medium transition-colors">My Parties</Link>
          {user ? (
            <>
              <button
                className="text-2xl text-slate-300 items-center hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-colors ml-4"
                onClick={() => setProfileOpen((o) => !o)}
                aria-label="Open profile menu"
              >
                {ICON_MAP.user && React.createElement(ICON_MAP.user as any, { size: 28 })}
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-[9999] animate-fade-in p-4 flex flex-col items-center min-w-[220px]">
                  <div className="w-full flex flex-col items-center mb-4">
                    <div className="bg-slate-700 text-slate-300 rounded-full p-3 mb-2 flex items-center justify-center">
                      {ICON_MAP.user && React.createElement(ICON_MAP.user as any, { size: 32 })}
                    </div>
                    <span className="text-base font-semibold text-white mb-1">Profile</span>
                    <span className="text-xs text-slate-400 mb-1">{user.email ?? ''}</span>
                    {user.id && (
                      <span className="text-xs text-slate-500 break-all">ID: {user.id}</span>
                    )}
                  </div>
                  <div className="w-full border-t border-slate-700 my-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link href="/my-worlds" className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
} 
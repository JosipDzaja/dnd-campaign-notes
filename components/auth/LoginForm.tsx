'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FcGoogle } from 'react-icons/fc';
import { FaDiscord } from 'react-icons/fa';

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        alert('Check your email for confirmation!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('An unexpected error occurred.')
        console.error('Unexpected error:', error);
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md p-8 bg-slate-800/90 rounded-xl shadow-2xl border border-slate-700">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">
        {isSignUp ? 'Sign Up' : 'Login'} to Arcane archives
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter your email"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-300">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter your password"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Login')}
        </button>
      </form>
      <div className="flex flex-col items-center my-8">
        <div className="flex flex-row gap-6">
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={async () => {
                const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
                if (error) alert('Google sign-in error: ' + error.message);
              }}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-slate-700 border border-slate-600 hover:bg-slate-600 transition-colors shadow-lg"
              aria-label="Sign in with Google"
            >
              <FcGoogle className="w-7 h-7" />
            </button>
            <span className="mt-2 text-xs text-slate-400">Sign in with Google</span>
          </div>
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={async () => {
                const { error } = await supabase.auth.signInWithOAuth({ provider: 'discord' });
                if (error) alert('Discord sign-in error: ' + error.message);
              }}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-slate-700 border border-slate-600 hover:bg-slate-600 transition-colors shadow-lg"
              aria-label="Sign in with Discord"
            >
              <FaDiscord className="w-7 h-7 text-indigo-400" />
            </button>
            <span className="mt-2 text-xs text-slate-400">Sign in with Discord</span>
          </div>
        </div>
      </div>
      <p className="mt-4 text-center text-slate-400">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-blue-400 hover:underline"
        >
          {isSignUp ? 'Login' : 'Sign Up'}
        </button>
      </p>
    </div>
  )
}
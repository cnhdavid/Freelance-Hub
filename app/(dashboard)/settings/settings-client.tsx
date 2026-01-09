'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { updateProfile } from '@/app/actions/profile'
import { toast } from 'sonner'
import { User as UserIcon, Mail, Globe, AtSign, Loader2, Camera } from 'lucide-react'

interface SettingsClientProps {
  user: User
  profile: {
    id: string
    full_name: string | null
    username: string | null
    website: string | null
    avatar_url: string | null
  } | null
}

export function SettingsClient({ user, profile }: SettingsClientProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    website: profile?.website || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await updateProfile(formData)

      if (result.error) {
        toast.error('Failed to update profile', {
          description: result.error,
        })
      } else {
        toast.success('Profile updated successfully', {
          description: 'Your changes have been saved.',
        })
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent mb-2">
          Settings
        </h1>
        <p className="text-zinc-400">Manage your account settings and preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-violet-400" />
            Profile Information
          </h2>

          {/* Avatar Section */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-zinc-400 mb-3">
              Profile Picture
            </label>
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-zinc-800">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span>{formData.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}</span>
                  )}
                </div>
                <button
                  type="button"
                  className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  disabled
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </div>
              <div>
                <p className="text-sm text-zinc-400 mb-2">
                  Upload a profile picture (Coming soon)
                </p>
                <p className="text-xs text-zinc-500">
                  JPG, PNG or GIF. Max size 2MB.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-500 cursor-not-allowed"
                />
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                Email cannot be changed from this page
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-zinc-400 mb-2">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-zinc-400 mb-2">
                Username
              </label>
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-zinc-400 mb-2">
                Website
              </label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                  className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end pt-4 border-t border-zinc-800">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-violet-600/50 disabled:to-indigo-600/50 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-violet-500/50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Account Information */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300">
          <h2 className="text-xl font-bold text-white mb-6">Account Information</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
              <span className="text-zinc-400">User ID</span>
              <span className="text-sm font-mono text-zinc-500">{user.id}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
              <span className="text-zinc-400">Account Created</span>
              <span className="text-sm text-white">
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
              <span className="text-zinc-400">Last Sign In</span>
              <span className="text-sm text-white">
                {user.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

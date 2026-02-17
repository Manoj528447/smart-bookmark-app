'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Bookmark = {
  id: string
  title: string
  url: string
  user_id: string
}

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch Bookmarks
  const fetchBookmarks = async (userId: string) => {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch Error:', error.message)
    } else {
      setBookmarks(data || [])
    }
  }

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      setLoading(false)

      if (data.user) {
        fetchBookmarks(data.user.id)

        const channel = supabase
          .channel('bookmarks-channel')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'bookmarks',
            },
            () => {
              fetchBookmarks(data.user.id)
            }
          )
          .subscribe()

        return () => {
          supabase.removeChannel(channel)
        }
      }
    }

    getUser()
  }, [])

  // Add Bookmark
  const addBookmark = async () => {
    if (!user || !title || !url) return

    const { error } = await supabase.from('bookmarks').insert([
      {
        title,
        url,
        user_id: user.id,
      },
    ])

    if (error) {
      console.error('Insert Error:', error.message)
    } else {
      setTitle('')
      setUrl('')
      fetchBookmarks(user.id)
    }
  }

  // Delete Bookmark
  const deleteBookmark = async (id: string) => {
    if (!user) return

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete Error:', error.message)
    } else {
      fetchBookmarks(user.id)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    location.reload()
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <button
          onClick={() =>
            supabase.auth.signInWithOAuth({ provider: 'google' })
          }
          className="bg-black text-white px-6 py-3 rounded"
        >
          Sign in with Google
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-10">
      <h2 className="mb-4 text-lg font-semibold">
        Logged in as {user.email}
      </h2>

      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-2 rounded mb-6"
      >
        Logout
      </button>

      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Bookmark Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 flex-1"
        />
        <input
          type="text"
          placeholder="Bookmark URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border p-2 flex-1"
        />
        <button
          onClick={addBookmark}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      <ul>
        {bookmarks.map((bookmark) => (
          <li
            key={bookmark.id}
            className="flex justify-between items-center bg-gray-100 p-3 rounded mb-2"
          >
            <a
              href={bookmark.url}
              target="_blank"
              className="text-blue-600 underline"
            >
              {bookmark.title}
            </a>
            <button
              onClick={() => deleteBookmark(bookmark.id)}
              className="text-red-500"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}


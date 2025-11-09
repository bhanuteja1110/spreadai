import React, { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { motion } from 'framer-motion'
import { auth } from '../config/firebase'
import ChatApp from './ChatApp'
import Login from './Login'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          await currentUser.reload()
          setUser(auth.currentUser)
        } catch (error) {
          console.error('Error reloading user:', error)
          setUser(currentUser)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-dark-navy">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            className="w-12 h-12 border-4 border-neon-blue/30 border-t-neon-blue rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-400">Loading...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-dark-navy via-dark-navy to-[#050810] overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="relative h-full flex items-center justify-center p-4">
        {!user ? (
          <Login />
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-[700px] h-[90vh] bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-white">SpreadAI</h1>
                <motion.div
                  className="w-2 h-2 bg-neon-blue rounded-full"
                  animate={{ 
                    opacity: [1, 0.5, 1],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity
                  }}
                />
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-400">
                  {(() => {
                    let userName = user.displayName
                    if (!userName && user.email) {
                      const emailPart = user.email.split('@')[0]
                      let cleaned = emailPart.replace(/[^a-zA-Z]/g, ' ')
                      const words = cleaned.split(' ').filter(word => word.length > 0)
                      if (words.length > 0) {
                        const longestWord = words.reduce((a, b) => a.length > b.length ? a : b)
                        userName = longestWord.charAt(0).toUpperCase() + longestWord.slice(1).toLowerCase()
                      }
                    }
                    return userName || user.email?.split('@')[0] || 'User'
                  })()}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    const { signOut } = await import('firebase/auth')
                    await signOut(auth)
                  }}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 text-sm font-medium transition-all"
                >
                  Logout
                </motion.button>
              </div>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-hidden">
              <ChatApp user={user} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

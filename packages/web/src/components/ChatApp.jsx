import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ChatApp({ user }) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showGreeting, setShowGreeting] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const formatTimestamp = (date) => {
    return date.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    let userName = user?.displayName
    if (!userName && user?.email) {
      const emailPart = user.email.split('@')[0]
      let cleaned = emailPart.replace(/[^a-zA-Z]/g, ' ')
      const words = cleaned.split(' ').filter(word => word.length > 0)
      if (words.length > 0) {
        const longestWord = words.reduce((a, b) => a.length > b.length ? a : b)
        userName = longestWord.charAt(0).toUpperCase() + longestWord.slice(1).toLowerCase()
      }
    }
    userName = userName || 'there'
    
    if (hour >= 5 && hour < 12) {
      return `Good Morning ${userName}!`
    } else if (hour >= 12 && hour < 17) {
      return `Good Afternoon ${userName}!`
    } else if (hour >= 17 && hour < 21) {
      return `Good Evening ${userName}!`
    } else {
      return `Good Night ${userName}!`
    }
  }

  async function send() {
    if (!input.trim() || loading) return

    const userMessage = { 
      role: 'user', 
      content: input.trim(),
      timestamp: new Date()
    }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setError(null)
    setShowGreeting(false)

    try {
      const token = await user.getIdToken()
      
      const resp = await fetch('https://spreadai.onrender.com/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages: newMessages })
      })

      const text = await resp.text()
      
      if (!text || text.trim() === '') {
        throw new Error('Empty response from server')
      }

      let data
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        const contentType = resp.headers.get('content-type') || ''
        console.error('JSON parse error:', parseError, 'Content-Type:', contentType, 'Response text:', text.substring(0, 200))
        throw new Error(`Invalid response from server: ${text.substring(0, 100)}`)
      }

      if (!resp.ok) {
        throw new Error(data.error || data.details || `HTTP ${resp.status}`)
      }

      if (data.assistant) {
        setMessages([...newMessages, {
          role: 'assistant',
          content: data.assistant,
          timestamp: new Date()
        }])
      }
    } catch (err) {
      console.error('Chat error:', err)
      setError(err.message || 'Failed to send message')
      setMessages(newMessages.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex flex-col h-full bg-dark-navy">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scroll-smooth">
        <AnimatePresence>
          {messages.length === 0 && !loading && showGreeting && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center h-full"
            >
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl max-w-md text-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  className="text-5xl mb-4"
                >
                  👋
                </motion.div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                  {getGreeting()}
                </h2>
                <p className="text-gray-400 text-sm">
                  How can I help you today?
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-3 max-w-[75%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  m.role === 'user' 
                    ? 'bg-gradient-to-br from-neon-blue to-blue-500' 
                    : 'bg-white/10 border border-white/20'
                }`}>
                  {m.role === 'user' ? (
                    <span className="text-white text-sm font-semibold">
                      {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  ) : (
                    <span className="text-neon-blue text-lg">🤖</span>
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`rounded-2xl px-4 py-3 ${
                  m.role === 'user'
                    ? 'bg-neon-blue/20 backdrop-blur-sm border border-neon-blue/30 text-white'
                    : 'bg-white/5 backdrop-blur-sm border border-white/10 text-gray-200'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {m.content}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {formatTimestamp(m.timestamp)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading Indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-start gap-3 max-w-[75%]">
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-neon-blue text-lg">🤖</span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <motion.div
                    className="w-2 h-2 bg-neon-blue rounded-full"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-neon-blue rounded-full"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-neon-blue rounded-full"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-3 text-red-300 text-sm"
          >
            {error}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 bg-dark-navy/50 backdrop-blur-xl p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message — Press Enter to send"
                disabled={loading}
                rows={1}
                className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:border-neon-blue/50 focus:ring-2 focus:ring-neon-blue/20 transition-all disabled:opacity-50"
                style={{
                  minHeight: '48px',
                  maxHeight: '120px',
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto'
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
                }}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={send}
              disabled={loading || !input.trim()}
              className="bg-neon-blue/20 hover:bg-neon-blue/30 border border-neon-blue/30 text-neon-blue px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <motion.div
                    className="w-4 h-4 border-2 border-neon-blue border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span>Sending...</span>
                </>
              ) : (
                <span>Send</span>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

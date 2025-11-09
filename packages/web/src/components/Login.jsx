import React, { useState } from 'react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../config/firebase'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        
        // Update user profile with display name
        if (name.trim()) {
          await updateProfile(userCredential.user, {
            displayName: name.trim()
          })
          // Reload user to get updated displayName
          await userCredential.user.reload()
        }
      }
    } catch (err) {
      console.error('Auth error:', err)
      
      // Provide user-friendly error messages
      let errorMessage = 'Authentication failed';
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <h1 style={{
            color: 'white',
            fontSize: '2rem',
            fontWeight: 700,
            margin: 0,
            marginBottom: '0.5rem'
          }}>
            SpreadAI
          </h1>
          <p style={{
            color: 'var(--muted)',
            fontSize: '0.9rem',
            margin: 0
          }}>
            {isLogin ? 'Sign in to continue' : 'Create an account to get started'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {!isLogin && (
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                required={!isLogin}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(255,255,255,0.06)',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  color: 'var(--muted)',
                  fontSize: '0.9375rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.12)'
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.06)'
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.03)'
                }}
              />
            </div>
          )}
          
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255,255,255,0.06)',
                backgroundColor: 'rgba(255,255,255,0.03)',
                color: 'var(--muted)',
                fontSize: '0.9375rem',
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.12)'
                e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.06)'
                e.target.style.backgroundColor = 'rgba(255,255,255,0.03)'
              }}
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              disabled={loading}
              minLength={6}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255,255,255,0.06)',
                backgroundColor: 'rgba(255,255,255,0.03)',
                color: 'var(--muted)',
                fontSize: '0.9375rem',
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.12)'
                e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.06)'
                e.target.style.backgroundColor = 'rgba(255,255,255,0.03)'
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '0.75rem',
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ff6b6b',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password || (!isLogin && !name.trim())}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: loading || !email || !password || (!isLogin && !name.trim())
                ? 'rgba(255,255,255,0.1)'
                : 'linear-gradient(90deg, var(--accent), #ff9f77)',
              color: loading || !email || !password || (!isLogin && !name.trim()) ? 'var(--muted)' : '#0b1020',
              fontWeight: 700,
              cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
              fontSize: '0.9375rem',
              transition: 'all 0.2s',
              opacity: loading || !email || !password || (!isLogin && !name.trim()) ? 0.5 : 1
            }}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center'
        }}>
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
              setName('')
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  )
}


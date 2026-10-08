import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/Button'
import gsap from 'gsap'
import '../styles/pages.css'

export default function Home() {
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const chars = document.querySelectorAll('.logo-char')
    if (chars.length === 0) return

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 3 })

    chars.forEach((char, i) => {
      const randomX = (Math.random() - 0.5) * 500
      const randomY = (Math.random() - 0.5) * 500
      
      gsap.set(char, { x: randomX, y: randomY, opacity: 0, scale: 0.5 })
      tl.to(char, { x: 0, y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'back.out' }, i * 0.1)
    })

    tl.to(chars, { opacity: 1, duration: 2 }, '+=0.5')
    tl.to(chars, { opacity: 0, scale: 0.8, y: 30, duration: 0.8 }, '+=0.3')
  }, [])

  return (
    <main className="page page-home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="logo-animation">
              {['P', 'L', 'A', 'N', 'N', 'O', 'R', 'A'].map((char, i) => (
                <span key={i} className="logo-char" style={{ fontFamily: 'var(--font-syne)', fontSize: '64px', fontWeight: 800, color: 'var(--burnt-orange)' }}>
                  {char}
                </span>
              ))}
            </div>
            <p className="hero-tagline">Where Moments Become Memories</p>
            <p className="hero-subtitle">Plan events without the usual complexity. Connect with vendors, manage timelines, create memories.</p>
            <div className="hero-cta">
              {!isAuthenticated ? (
                <>
                  <Link to="/register"><Button>Get Started</Button></Link>
                  <Link to="/vendors"><Button variant="secondary">Explore Vendors</Button></Link>
                </>
              ) : (
                <>
                  <Link to="/vendors"><Button>Explore Vendors</Button></Link>
                  <Link to="/dashboard"><Button variant="secondary">Go to Dashboard</Button></Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section section-how-it-works">
        <div className="container">
          <h2>How Plannora Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Explore Vendors</h3>
              <p>Browse verified event vendors in your area</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Plan Your Event</h3>
              <p>Create a timeline and manage all details</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Connect & Book</h3>
              <p>Get in touch with vendors and confirm bookings</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Celebrate</h3>
              <p>Enjoy your perfectly planned event</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Plannora */}
      <section className="section section-why">
        <div className="container">
          <h2>Why Choose Plannora</h2>
          <div className="features">
            <div className="feature">
              <h3>Premium Vendors</h3>
              <p>Carefully vetted vendors who excel at their craft</p>
            </div>
            <div className="feature">
              <h3>Easy Management</h3>
              <p>Intuitive interface to keep everything organized</p>
            </div>
            <div className="feature">
              <h3>Professional Support</h3>
              <p>Expert guidance throughout your planning journey</p>
            </div>
            <div className="feature">
              <h3>Secure & Private</h3>
              <p>Your event details are protected and confidential</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section section-cta">
        <div className="container">
          <h2>Ready to Plan Your Perfect Event?</h2>
          <p>Join hundreds of happy clients who have created unforgettable moments with Plannora</p>
          {!isAuthenticated ? (
            <Link to="/register"><Button size="lg">Start Planning Today</Button></Link>
          ) : (
            <Link to="/vendors"><Button size="lg">Explore Vendors Now</Button></Link>
          )}
        </div>
      </section>
    </main>
  )
}

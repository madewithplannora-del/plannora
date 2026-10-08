import React from 'react'
import '../styles/components.css'

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>PLANNORA</h3>
            <p>Plan events without the usual complexity.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/vendors">Vendors</a></li>
              <li><a href="/login">Login</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p><a href="mailto:madewithplannora@gmail.com">madewithplannora@gmail.com</a></p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Plannora. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

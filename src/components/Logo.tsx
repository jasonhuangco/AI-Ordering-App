import React from 'react'

export default function Logo({ className = "", width = 120, height = 120 }) {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 120 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Coffee cup */}
      <path 
        d="M30 45h50c8.284 0 15 6.716 15 15v20c0 16.569-13.431 30-30 30s-30-13.431-30-30V45z" 
        fill="currentColor"
        opacity="0.8"
      />
      
      {/* Coffee cup handle */}
      <path 
        d="M80 55c8.284 0 15 6.716 15 15s-6.716 15-15 15" 
        stroke="currentColor" 
        strokeWidth="4" 
        fill="none"
      />
      
      {/* Steam lines */}
      <path d="M40 25v10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
      <path d="M50 20v15" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
      <path d="M60 25v10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
      <path d="M70 20v15" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
      
      {/* Coffee beans decoration */}
      <ellipse cx="20" cy="30" rx="4" ry="6" fill="currentColor" opacity="0.4" transform="rotate(-20 20 30)"/>
      <ellipse cx="100" cy="35" rx="4" ry="6" fill="currentColor" opacity="0.4" transform="rotate(20 100 35)"/>
      <ellipse cx="15" cy="70" rx="4" ry="6" fill="currentColor" opacity="0.4" transform="rotate(-45 15 70)"/>
      <ellipse cx="105" cy="75" rx="4" ry="6" fill="currentColor" opacity="0.4" transform="rotate(45 105 75)"/>
    </svg>
  )
}

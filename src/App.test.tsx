import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the autonomous replay webviz dashboard', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /Autonomous Driving Webviz/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/LiDAR \/ Radar \/ BEV/i)).toBeInTheDocument()
    expect(screen.getByText(/Front Camera/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Play/i })).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CodeBlock } from '@/components/Home/CodeBlock'

describe('CodeBlock', () => {
  it('renderiza children', () => {
    render(<CodeBlock>npm install</CodeBlock>)
    expect(screen.getByText('npm install')).toBeInTheDocument()
  })
})

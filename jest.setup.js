import '@testing-library/jest-dom'
import { NextResponse } from 'next/server'

// Mock the environment variables
process.env = {
  ...process.env,
  ASSEMBLYAI_API_KEY: 'test-assembly-key',
  OPENAI_API_KEY: 'test-openai-key',
  NEXTAUTH_SECRET: 'test-secret',
  NEXTAUTH_URL: 'http://localhost:3000',
}

// Mock fetch globally
global.fetch = jest.fn()

// Mock FormData
global.FormData = class FormData {
  constructor() {
    this.data = new Map()
  }
  append(key, value) {
    this.data.set(key, value)
  }
  get(key) {
    return this.data.get(key)
  }
}

// Mock File
global.File = class File {
  constructor(bits, name, options = {}) {
    this.bits = bits
    this.name = name
    this.options = options
  }
  async arrayBuffer() {
    return Buffer.from(this.bits.join(''))
  }
}

// Mock Headers
global.Headers = class Headers {
  constructor(init = {}) {
    this.headers = new Map(Object.entries(init))
  }
  get(name) {
    return this.headers.get(name)
  }
  set(name, value) {
    this.headers.set(name, value)
  }
}

// Mock Response
global.Response = class Response {
  constructor(body, init = {}) {
    this._body = body
    this.status = init.status || 200
    this.statusText = init.statusText || ''
    this.headers = new Headers(init.headers)
  }

  async json() {
    return typeof this._body === 'string' ? JSON.parse(this._body) : this._body
  }
}

// Mock NextResponse
jest.mock('next/server', () => {
  return {
    NextResponse: {
      json: (body, init) => {
        const response = new Response(JSON.stringify(body), init)
        response.json = async () => body
        return response
      },
    },
  }
})

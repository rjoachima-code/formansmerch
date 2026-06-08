import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

function getPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })
}

let prisma: PrismaClient

// Lazy initialization pattern for Next.js compatibility
if (typeof window === 'undefined') {
  // Server-side: check if we're in a build context
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    // During build, return a proxy that will be replaced at runtime
    prisma = new Proxy({} as PrismaClient, {
      get() {
        throw new Error('PrismaClient should not be instantiated at build time')
      }
    }) as unknown as PrismaClient
  } else if (process.env.DATABASE_URL) {
    // At runtime with database configured
    prisma = global.prisma || getPrismaClient()
    if (process.env.NODE_ENV !== 'production') {
      global.prisma = prisma
    }
  } else {
    // At runtime but no database - still need to create a client for type safety
    // This will throw when actually used
    prisma = getPrismaClient()
  }
} else {
  // Client-side: should not happen for server-only code
  prisma = {} as PrismaClient
}

export { prisma }
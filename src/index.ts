import { Hono } from 'hono'
// import { PrismaClient } from '@prisma/client'
import { getPrisma } from './prismaFunction'

// Create the main Hono app
const app = new Hono<{
  Bindings: {
    DATABASE_URL: string
    JWT_SECRET: string
  }
  Variables: {
    userId: string
  }
}>()

app.get('/', (c) => {
  return c.text('Hello, World!')
})

app.get('/table', async (c) => {
  // Now you can use it wherever you want
  const prisma = getPrisma(c.env.DATABASE_URL);
  
  const users = await prisma.user.findMany();

  return c.json(users, 200)
})

export default app
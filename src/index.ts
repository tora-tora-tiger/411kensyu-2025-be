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
});

app.get('/table', async (c) => {
  // Now you can use it wherever you want
  const prisma = getPrisma(c.env.DATABASE_URL);
  
  const users = await prisma.user.findMany();

  return c.json(users, 200)
});

app.get('/seed', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);

  const user = await prisma.user.createMany({
    data: [
      {
        name: 'John Doe',
        email: 'user1@example.com'
      },
      {
        name: 'Kakua Doe',
        email: 'user2@example.com'
      },
      {
        name: 'Eguchi Doe',
        email: 'user3@example.com'
      }
    ]
  })
  return c.text(user.count + 'users seeded successfully');
});

app.post('/update', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const { id, name, email }: { id: number; name: string; email: string } = await c.req.json();
  if (!id || !name || !email) {
    return c.json({ error: 'Missing required fields' }, 400);
  }
  const updatedUser = await prisma.user.update({
    where: { id },
    data: { name, email }
  });
  return c.json(updatedUser, 200);
});

export default app
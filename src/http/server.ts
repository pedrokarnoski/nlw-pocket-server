import fastify from 'fastify'
import {
  type ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

import z from 'zod'
import { createGoal } from '../use-cases/create-goal'
import { getWeekPendingGoals } from '../use-cases/get-week-pending-goals'
import { createGoalCompletion } from '../use-cases/create-goal-completion'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.get('/pending-goals', async () => {
  const { pendingGoals } = await getWeekPendingGoals()

  return { pendingGoals }
})

app.post(
  '/goals',
  {
    schema: {
      body: z.object({
        title: z.string(),
        desiredWeeklyFrequency: z.number().int().min(1).max(7),
      }),
    },
  },
  async request => {
    const { title, desiredWeeklyFrequency } = request.body

    await createGoal({
      title,
      desiredWeeklyFrequency,
    })
  }
)

app.post('/goal-completions', {
  schema: {
    body: z.object({
      goalId: z.string(),
    }),
  },
}, async (request) => {
  const { goalId } = request.body

  await createGoalCompletion({
    goalId,
  })
})

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('Server running on http://localhost:3333')
  })

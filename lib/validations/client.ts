import { z } from 'zod'

export const clientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
})

export type ClientFormData = z.infer<typeof clientSchema>

import { z } from 'zod'

export const PROFILE_ENTRY_MAX = 160
export const PROFILE_LIST_MAX = 8

export const learnerProfileSchema = z
  .object({
    name: z.string().max(PROFILE_ENTRY_MAX).nullable(),
    goal: z.string().max(PROFILE_ENTRY_MAX).nullable(),
    preferences: z.array(z.string().min(1).max(PROFILE_ENTRY_MAX)).max(PROFILE_LIST_MAX),
    struggles: z.array(z.string().min(1).max(PROFILE_ENTRY_MAX)).max(PROFILE_LIST_MAX),
    wins: z.array(z.string().min(1).max(PROFILE_ENTRY_MAX)).max(PROFILE_LIST_MAX),
  })
  .strict()

export type LearnerProfile = z.infer<typeof learnerProfileSchema>

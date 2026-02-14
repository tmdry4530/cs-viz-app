import { z } from "zod"

// Auth
export const loginSchema = z.object({
  email: z.string().email("유효한 이메일을 입력하세요"),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다"),
})

// Comments
export const commentSchema = z.object({
  content: z
    .string()
    .min(1, "댓글 내용을 입력하세요")
    .max(1000, "댓글은 1000자 이내로 작성하세요"),
  postId: z.string().min(1),
  parentId: z.string().optional(),
})

// Report
export const reportSchema = z.object({
  targetType: z.enum(["post", "comment"]),
  targetId: z.string().min(1),
  reason: z.enum([
    "spam",
    "harassment",
    "inappropriate",
    "misinformation",
    "other",
  ]),
  detail: z.string().max(500).optional(),
})

// Reflection
export const reflectionSchema = z.object({
  sessionRunId: z.string().min(1),
  sentence1: z.string().min(1, "첫 번째 문장을 입력하세요").max(300),
  sentence2: z.string().min(1, "두 번째 문장을 입력하세요").max(300),
  sentence3: z.string().min(1, "세 번째 문장을 입력하세요").max(300),
  isPublic: z.boolean().default(false),
})

// Quiz attempt
export const quizAttemptSchema = z.object({
  questionId: z.string().min(1),
  sessionRunId: z.string().min(1),
  selectedAnswer: z.number().int().min(0),
})

// Apply attempt
export const applyAttemptSchema = z.object({
  sessionRunId: z.string().min(1),
  answer: z.string().min(1, "답변을 입력하세요").max(2000),
})

// Share
export const shareSchema = z.object({
  sessionRunId: z.string().min(1),
  isPublic: z.boolean().default(true),
})

// Profile update
export const profileUpdateSchema = z.object({
  name: z.string().min(1, "이름을 입력하세요").max(50).optional(),
  bio: z.string().max(200).optional(),
})

// Feed post query
export const feedQuerySchema = z.object({
  sort: z.enum(["popular", "recent"]).default("popular"),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(20),
})

// Reaction
export const reactionSchema = z.object({
  targetType: z.enum(["post", "comment"]),
  targetId: z.string().min(1),
  type: z.enum(["like"]),
})

// Diagnostic submit
export const diagnosticAnswerSchema = z.object({
  questionId: z.string().min(1),
  answer: z.string().min(1),
})

export const diagnosticSubmitSchema = z.object({
  attemptId: z.string().min(1),
  answers: z.array(diagnosticAnswerSchema).min(1).max(30),
})

export type LoginInput = z.infer<typeof loginSchema>
export type CommentInput = z.infer<typeof commentSchema>
export type ReportInput = z.infer<typeof reportSchema>
export type ReflectionInput = z.infer<typeof reflectionSchema>
export type QuizAttemptInput = z.infer<typeof quizAttemptSchema>
export type ApplyAttemptInput = z.infer<typeof applyAttemptSchema>
export type ShareInput = z.infer<typeof shareSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type FeedQueryInput = z.infer<typeof feedQuerySchema>
// Search
export const searchQuerySchema = z.object({
  q: z.string().min(2, "검색어는 2자 이상이어야 합니다"),
  type: z.enum(["module", "user", "all"]).optional().default("all"),
})

export type ReactionInput = z.infer<typeof reactionSchema>
export type SearchQueryInput = z.infer<typeof searchQuerySchema>
export type DiagnosticAnswerInput = z.infer<typeof diagnosticAnswerSchema>
export type DiagnosticSubmitInput = z.infer<typeof diagnosticSubmitSchema>

// Study Room
export const createRoomSchema = z.object({
  name: z
    .string()
    .min(1, "방 이름을 입력하세요")
    .max(50, "방 이름은 50자 이내로 작성하세요"),
  description: z.string().max(200, "설명은 200자 이내로 작성하세요").optional(),
  maxMembers: z.number().int().min(2, "최소 2명").max(10, "최대 10명").default(5),
})

export const sendMessageSchema = z.object({
  content: z
    .string()
    .min(1, "메시지를 입력하세요")
    .max(500, "메시지는 500자 이내로 작성하세요"),
})

export type CreateRoomInput = z.infer<typeof createRoomSchema>
export type SendMessageInput = z.infer<typeof sendMessageSchema>

// Stripe checkout
export const checkoutSchema = z.object({
  plan: z.enum(["pro"]),
})

// Stripe webhook
export const webhookSchema = z.object({
  type: z.enum([
    "checkout.session.completed",
    "customer.subscription.deleted",
    "invoice.payment_failed",
  ]),
  data: z.object({
    userId: z.string().min(1),
    plan: z.string().optional(),
    subscriptionId: z.string().optional(),
  }),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>
export type WebhookInput = z.infer<typeof webhookSchema>

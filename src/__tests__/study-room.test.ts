import { createRoomSchema, sendMessageSchema } from "../lib/validations"

// ─── Pure logic for testing ─────────────────────────────────

function canJoinRoom(
  currentMembers: number,
  maxMembers: number,
  isActive: boolean,
  isAlreadyMember: boolean
): { ok: boolean; reason?: string } {
  if (!isActive) return { ok: false, reason: "비활성 스터디 룸입니다." }
  if (isAlreadyMember) return { ok: false, reason: "이미 참여 중인 방입니다." }
  if (currentMembers >= maxMembers)
    return { ok: false, reason: "방이 가득 찼습니다." }
  return { ok: true }
}

function canLeaveRoom(
  userId: string,
  ownerId: string,
  isMemeber: boolean
): { ok: boolean; reason?: string } {
  if (!isMemeber) return { ok: false, reason: "방에 참여하고 있지 않습니다." }
  if (userId === ownerId)
    return { ok: false, reason: "방장은 방을 나갈 수 없습니다." }
  return { ok: true }
}

function canDeleteRoom(
  userId: string,
  ownerId: string
): { ok: boolean; reason?: string } {
  if (userId !== ownerId)
    return { ok: false, reason: "방장만 삭제할 수 있습니다." }
  return { ok: true }
}

function canSendMessage(
  isMember: boolean,
  isActive: boolean
): { ok: boolean; reason?: string } {
  if (!isActive) return { ok: false, reason: "비활성 스터디 룸입니다." }
  if (!isMember) return { ok: false, reason: "방에 참여해야 메시지를 보낼 수 있습니다." }
  return { ok: true }
}

// ─── Tests ──────────────────────────────────────────────────

describe("createRoomSchema", () => {
  it("accepts valid room creation", () => {
    const result = createRoomSchema.safeParse({
      name: "알고리즘 스터디",
      description: "매일 1문제씩",
      maxMembers: 5,
    })
    expect(result.success).toBe(true)
  })

  it("accepts without optional fields", () => {
    const result = createRoomSchema.safeParse({
      name: "CS 스터디",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.maxMembers).toBe(5)
    }
  })

  it("rejects empty name", () => {
    const result = createRoomSchema.safeParse({
      name: "",
    })
    expect(result.success).toBe(false)
  })

  it("rejects name exceeding 50 chars", () => {
    const result = createRoomSchema.safeParse({
      name: "a".repeat(51),
    })
    expect(result.success).toBe(false)
  })

  it("rejects description exceeding 200 chars", () => {
    const result = createRoomSchema.safeParse({
      name: "스터디",
      description: "a".repeat(201),
    })
    expect(result.success).toBe(false)
  })

  it("rejects maxMembers below 2", () => {
    const result = createRoomSchema.safeParse({
      name: "스터디",
      maxMembers: 1,
    })
    expect(result.success).toBe(false)
  })

  it("rejects maxMembers above 10", () => {
    const result = createRoomSchema.safeParse({
      name: "스터디",
      maxMembers: 11,
    })
    expect(result.success).toBe(false)
  })
})

describe("sendMessageSchema", () => {
  it("accepts valid message", () => {
    const result = sendMessageSchema.safeParse({
      content: "안녕하세요!",
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty message", () => {
    const result = sendMessageSchema.safeParse({
      content: "",
    })
    expect(result.success).toBe(false)
  })

  it("rejects message exceeding 500 chars", () => {
    const result = sendMessageSchema.safeParse({
      content: "a".repeat(501),
    })
    expect(result.success).toBe(false)
  })
})

describe("canJoinRoom", () => {
  it("allows joining active room with space", () => {
    const result = canJoinRoom(3, 5, true, false)
    expect(result.ok).toBe(true)
  })

  it("rejects joining inactive room", () => {
    const result = canJoinRoom(3, 5, false, false)
    expect(result.ok).toBe(false)
    expect(result.reason).toBe("비활성 스터디 룸입니다.")
  })

  it("rejects joining if already a member", () => {
    const result = canJoinRoom(3, 5, true, true)
    expect(result.ok).toBe(false)
    expect(result.reason).toBe("이미 참여 중인 방입니다.")
  })

  it("rejects joining full room", () => {
    const result = canJoinRoom(5, 5, true, false)
    expect(result.ok).toBe(false)
    expect(result.reason).toBe("방이 가득 찼습니다.")
  })
})

describe("canLeaveRoom", () => {
  it("allows member to leave", () => {
    const result = canLeaveRoom("user-2", "user-1", true)
    expect(result.ok).toBe(true)
  })

  it("rejects if not a member", () => {
    const result = canLeaveRoom("user-2", "user-1", false)
    expect(result.ok).toBe(false)
    expect(result.reason).toBe("방에 참여하고 있지 않습니다.")
  })

  it("rejects owner leaving", () => {
    const result = canLeaveRoom("user-1", "user-1", true)
    expect(result.ok).toBe(false)
    expect(result.reason).toBe("방장은 방을 나갈 수 없습니다.")
  })
})

describe("canDeleteRoom", () => {
  it("allows owner to delete", () => {
    const result = canDeleteRoom("user-1", "user-1")
    expect(result.ok).toBe(true)
  })

  it("rejects non-owner deleting", () => {
    const result = canDeleteRoom("user-2", "user-1")
    expect(result.ok).toBe(false)
    expect(result.reason).toBe("방장만 삭제할 수 있습니다.")
  })
})

describe("canSendMessage", () => {
  it("allows member to send in active room", () => {
    const result = canSendMessage(true, true)
    expect(result.ok).toBe(true)
  })

  it("rejects sending in inactive room", () => {
    const result = canSendMessage(true, false)
    expect(result.ok).toBe(false)
    expect(result.reason).toBe("비활성 스터디 룸입니다.")
  })

  it("rejects non-member sending", () => {
    const result = canSendMessage(false, true)
    expect(result.ok).toBe(false)
    expect(result.reason).toBe("방에 참여해야 메시지를 보낼 수 있습니다.")
  })
})

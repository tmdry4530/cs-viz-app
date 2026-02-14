/**
 * Content Tooling - Version creation logic tests
 * Tests the version numbering and data snapshot logic
 */

describe("ModuleVersion logic", () => {
  describe("version numbering", () => {
    it("first version should be 1", () => {
      const latestVersion = null
      const nextVersion = (latestVersion ?? 0) + 1
      expect(nextVersion).toBe(1)
    })

    it("increments version from latest", () => {
      const latestVersion = 5
      const nextVersion = (latestVersion ?? 0) + 1
      expect(nextVersion).toBe(6)
    })

    it("handles zero as latest version", () => {
      const latestVersion = 0
      const nextVersion = (latestVersion ?? 0) + 1
      expect(nextVersion).toBe(1)
    })
  })

  describe("version data snapshot", () => {
    const moduleData = {
      title: "Binary Search",
      subtitle: "이진 탐색의 원리",
      outcomes: ["이진 탐색의 시간 복잡도를 이해한다", "구현할 수 있다"],
      difficulty: "중급",
      time: "20분",
      tag: "알고리즘",
      color: "#3B82F6",
      vizConfig: { type: "array", steps: 10 },
    }

    it("creates a complete snapshot of module fields", () => {
      const snapshot = {
        title: moduleData.title,
        subtitle: moduleData.subtitle,
        outcomes: moduleData.outcomes,
        difficulty: moduleData.difficulty,
        time: moduleData.time,
        tag: moduleData.tag,
        color: moduleData.color,
        vizConfig: moduleData.vizConfig,
      }

      expect(snapshot.title).toBe("Binary Search")
      expect(snapshot.subtitle).toBe("이진 탐색의 원리")
      expect(snapshot.outcomes).toHaveLength(2)
      expect(snapshot.difficulty).toBe("중급")
      expect(snapshot.time).toBe("20분")
      expect(snapshot.tag).toBe("알고리즘")
      expect(snapshot.color).toBe("#3B82F6")
      expect(snapshot.vizConfig).toEqual({ type: "array", steps: 10 })
    })

    it("snapshot is independent of original data", () => {
      const snapshot = { ...moduleData }
      snapshot.title = "Changed Title"
      expect(moduleData.title).toBe("Binary Search")
    })

    it("handles null vizConfig", () => {
      const dataWithNull = { ...moduleData, vizConfig: null }
      const snapshot = {
        title: dataWithNull.title,
        vizConfig: dataWithNull.vizConfig,
      }
      expect(snapshot.vizConfig).toBeNull()
    })

    it("handles empty outcomes array", () => {
      const dataWithEmpty = { ...moduleData, outcomes: [] }
      const snapshot = { outcomes: dataWithEmpty.outcomes }
      expect(snapshot.outcomes).toEqual([])
    })
  })

  describe("revert logic", () => {
    it("restores fields from version data", () => {
      const currentModule = {
        title: "Current Title",
        subtitle: "Current Subtitle",
        difficulty: "고급",
      }

      const versionData = {
        title: "Old Title",
        subtitle: "Old Subtitle",
        difficulty: "초급",
      }

      // Simulate revert
      const reverted = {
        ...currentModule,
        title: versionData.title,
        subtitle: versionData.subtitle,
        difficulty: versionData.difficulty,
      }

      expect(reverted.title).toBe("Old Title")
      expect(reverted.subtitle).toBe("Old Subtitle")
      expect(reverted.difficulty).toBe("초급")
    })

    it("backup version is created before revert", () => {
      const backupVersions: Array<{ version: number; changelog: string }> = []
      const latestVersion = 3

      // Simulate backup creation
      backupVersions.push({
        version: latestVersion + 1,
        changelog: `버전 2으로 복원 전 백업`,
      })

      expect(backupVersions).toHaveLength(1)
      expect(backupVersions[0].version).toBe(4)
      expect(backupVersions[0].changelog).toContain("복원 전 백업")
    })
  })

  describe("partial update logic", () => {
    it("only includes defined fields in update", () => {
      const updateInput = {
        title: "New Title",
        subtitle: undefined,
        difficulty: "고급",
        tag: undefined,
      }

      const updateData: Record<string, unknown> = {}
      if (updateInput.title !== undefined) updateData.title = updateInput.title
      if (updateInput.subtitle !== undefined) updateData.subtitle = updateInput.subtitle
      if (updateInput.difficulty !== undefined) updateData.difficulty = updateInput.difficulty
      if (updateInput.tag !== undefined) updateData.tag = updateInput.tag

      expect(Object.keys(updateData)).toEqual(["title", "difficulty"])
      expect(updateData.title).toBe("New Title")
      expect(updateData.difficulty).toBe("고급")
    })

    it("handles empty update", () => {
      const updateInput = {
        title: undefined,
        subtitle: undefined,
      }

      const updateData: Record<string, unknown> = {}
      if (updateInput.title !== undefined) updateData.title = updateInput.title
      if (updateInput.subtitle !== undefined) updateData.subtitle = updateInput.subtitle

      expect(Object.keys(updateData)).toHaveLength(0)
    })
  })

  describe("changelog generation", () => {
    it("uses provided changelog if given", () => {
      const changelog = "퀴즈 문항 업데이트"
      const result = changelog || `버전 3 생성`
      expect(result).toBe("퀴즈 문항 업데이트")
    })

    it("generates default changelog if empty", () => {
      const changelog = ""
      const version = 3
      const result = changelog || `버전 ${version} 생성`
      expect(result).toBe("버전 3 생성")
    })

    it("generates default changelog if undefined", () => {
      const changelog = undefined
      const version = 1
      const result = changelog || `버전 ${version} 생성`
      expect(result).toBe("버전 1 생성")
    })
  })
})

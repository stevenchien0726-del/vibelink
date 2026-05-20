type BuildEmbeddingTextInput = {
  displayName?: string | null
  username?: string | null
  bio?: string | null
  city?: string | null
  captions?: string[]
  aiTags?: string[]
  aiStyleTags?: string[]
}

export function buildEmbeddingText(input: BuildEmbeddingTextInput) {
  const parts = [
    input.displayName,
    input.username,
    input.bio,
    input.city,
    ...(input.captions ?? []),
    ...(input.aiTags ?? []),
    ...(input.aiStyleTags ?? []),
  ]
    .filter(Boolean)
    .map((item) => String(item).trim())
    .filter(Boolean)

  return parts.join(' / ')
}
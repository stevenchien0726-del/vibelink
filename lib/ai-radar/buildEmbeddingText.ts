type BuildEmbeddingTextInput = {
  displayName?: string | null
  username?: string | null
  bio?: string | null
  city?: string | null
  captions?: string[]
  aiTags?: string[]
  aiStyleTags?: string[]
}

function uniqueStrings(values: unknown[]) {
  return [
    ...new Set(
      values
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.toLowerCase().trim())
        .filter(Boolean)
    ),
  ]
}

export function buildEmbeddingText(input: BuildEmbeddingTextInput) {
  const captions = (input.captions ?? [])
    .filter(Boolean)
    .map((caption) => String(caption).trim())
    .filter(Boolean)
    .slice(0, 8)
  const aiTags = uniqueStrings(input.aiTags ?? [])
  const aiStyleTags = uniqueStrings(input.aiStyleTags ?? [])
  const parts = [
    input.displayName ? `Display name: ${input.displayName}` : '',
    input.username ? `Username: ${input.username}` : '',
    input.bio ? `Profile bio: ${input.bio}` : '',
    input.city ? `City: ${input.city}` : '',
    captions.length > 0
      ? `Recent captions: ${captions.join(' / ')}`
      : '',
    aiTags.length > 0
      ? `AI content tags: ${aiTags.join(', ')}`
      : '',
    aiStyleTags.length > 0
      ? `AI style tags: ${aiStyleTags.join(', ')}`
      : '',
  ]
    .filter(Boolean)
    .map((item) => String(item).trim())
    .filter(Boolean)

  return parts.join('\n')
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const input = text.trim()

  if (!input) {
    throw new Error('generateEmbedding: empty text')
  }

  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY')
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input,
      encoding_format: 'float',
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenAI embedding failed: ${errorText}`)
  }

  const data = await response.json()
  const embedding = data?.data?.[0]?.embedding

  if (!Array.isArray(embedding)) {
    throw new Error('OpenAI embedding response missing vector')
  }

  return embedding
}
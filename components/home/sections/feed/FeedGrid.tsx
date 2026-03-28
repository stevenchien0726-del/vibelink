'use client'

export type FeedMode = '1x1' | '2x2' | '3x3'

export type PostItem = {
  id: string
  author: string
  text: string
  likes: number
  image: string
}

const mockPosts = [
  {
    id: 'p1',
    author: 'Sky.07_21',
    text: 'HI 大家好，今天是開心的一天',
    likes: 50,
    image: '#d8d8d8',
  },
  {
    id: 'p2',
    author: 'Ryan_88',
    text: '今天的配對牆先放生活照。',
    likes: 27,
    image: '#d8d8d8',
  },
]

type FeedGridProps = {
  posts?: PostItem[]
  feedMode?: FeedMode
  setFeedMode?: (mode: FeedMode) => void
}

export default function FeedGrid({
  posts = [],
  feedMode = '1x1',
}: FeedGridProps) {
  if (feedMode === '1x1') {
    const firstPost = posts[0]

    if (!firstPost) return null

    return (
      <div>
        <div className="mb-3 flex items-center gap-2">
          <div className="h-[30px] w-[30px] rounded-full bg-[#d6a6e3]" />
          <div className="text-[15px] text-[#555]">{firstPost.author}</div>
          <div className="text-[20px] leading-none text-[#666]">···</div>
        </div>

        <div className="h-[446px] w-full rounded-[18px] bg-[#dddddd]" />

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-[16px] text-[#555]">
              <span>💗</span>
              <span>{firstPost.likes}</span>
            </div>

            <div className="flex items-center gap-1 text-[16px] text-[#555]">
              <span>💬</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[14px]">
            <span className="text-[#d77eea]">•</span>
            <span className="text-[#cfcfcf]">•</span>
            <span className="text-[#cfcfcf]">•</span>
          </div>

          <button className="rounded-full border border-[#ddd] bg-[#e9e9e9] px-4 py-2 text-[12px] text-[#666]">
            ✉ 發送邀請
          </button>
        </div>

        <div className="mt-3 text-[16px] text-[#444]">{firstPost.text}</div>
      </div>
    )
  }

  if (feedMode === '2x2') {
  return (
    <div className="grid grid-cols-2 gap-2">
      {posts.slice(0, 4).map((post) => (
        <div
          key={post.id}
          className="aspect-square w-full rounded-[16px] bg-[#dddddd]"
        />
      ))}
    </div>
  )
}

  return (
    <div className="grid grid-cols-3 gap-2">
      {posts.slice(0, 9).map((post) => (
        <div key={post.id}>
          <div className="aspect-square w-full rounded-[14px] bg-[#dddddd]" />
        </div>
      ))}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    width: "100%",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },

  authorRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
    flex: 1,
  },

  avatarDot: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    background: "#d6a5dd",
    flex: "0 0 auto",
  },

  authorText: {
    fontSize: 16,
    color: "#666",
    fontWeight: 500,
    lineHeight: 1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 100,
  },

  moreInline: {
    fontSize: 25,
    color: "#666",
    lineHeight: 1,
    flex: "0 0 auto",
    marginLeft: 3,
    transform: "translateY(-7px)",
  },

  heroImage: {
    width: "100%",
    aspectRatio: "1 / 1.1",
    background: "#dcdcdc",
    borderRadius: 15,
    transition: "all 220ms ease",
  },

  metaRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    marginTop: 8,
    minHeight: 28,
    columnGap: 8,
  },

  metaLeft: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    minWidth: 0,
  },

  likeText: {
    fontSize: 20,
    lineHeight: 1,
  },

  metaCount: {
    fontSize: 16,
    color: "#565656",
    lineHeight: 1,
  },

  commentText: {
    fontSize: 20,
    color: "#0b0309",
    lineHeight: 1,
    marginLeft: 6,
  },

  metaCenter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  dotActive: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#de76cf",
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#cfcfcf",
  },

  metaRight: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  sendButton: {
    height: 40,
    border: "1px solid #d8cedb",
    borderRadius: 999,
    background: "#dedede",
    padding: "0 12px",
    fontSize: 11,
    color: "#6f6f6f",
    display: "flex",
    alignItems: "center",
    gap: 5,
    whiteSpace: "nowrap",
    cursor: "pointer",
    flex: "0 0 auto",
  },

  sendButtonIcon: {
    fontSize: 13,
    lineHeight: 1,
    color: "#9371a5",
  },

  postText: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 1.45,
    color: "#444",
    letterSpacing: -0.1,
  },

  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 4,
    transition: "all 220ms ease",
  },

  grid3: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 4,
    transition: "all 220ms ease",
  },

  gridCard: {
    width: "100%",
    transition: "all 220ms ease",
  },

  gridCardAccent: {
    transition: "all 220ms ease",
  },

  gridImage: {
    width: "100%",
    aspectRatio: "1 / 1.34",
    background: "#dcdcdc",
    borderRadius: 4,
    transition: "all 220ms ease",
  },

  gridImageSmall: {
    width: "100%",
    aspectRatio: "1 / 1.08",
    background: "#dcdcdc",
    borderRadius: 4,
    transition: "all 220ms ease",
  },

  gridImageAccent: {
    background: "#d2a6d8",
  },
};
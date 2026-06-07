export type PeopleLibraryUser = {
  id: string
  name: string
  avatar?: string
  followedAt?: string | null
  favoritedAt?: string | null
  accountType?: 'normal' | 'creator' | 'official' | 'business'
  isCreator?: boolean
  isFavorite?: boolean

  messageCount?: number
  commentCount?: number
  likeCount?: number
  profileViewCount?: number
}

export type PeopleLibraryFolders = {
  recent: PeopleLibraryUser[]
  favorite: PeopleLibraryUser[]
  'more-interaction': PeopleLibraryUser[]
  'less-interaction': PeopleLibraryUser[]
  creator: PeopleLibraryUser[]
  'official-business': PeopleLibraryUser[]
}

function getInteractionScore(user: PeopleLibraryUser) {
  return (
    (user.messageCount ?? 0) * 5 +
    (user.commentCount ?? 0) * 4 +
    (user.likeCount ?? 0) * 2 +
    (user.profileViewCount ?? 0) * 1
  )
}

export function sortPeopleLibraryUsers(
  users: PeopleLibraryUser[]
): PeopleLibraryFolders {
  const favorite = users
    .filter((user) => user.isFavorite)
    .sort(
      (a, b) =>
        new Date(b.favoritedAt ?? 0).getTime() -
        new Date(a.favoritedAt ?? 0).getTime()
    )

  const favoriteIdSet = new Set(favorite.map((user) => user.id))

  const nonFavoriteUsers = users.filter((user) => !favoriteIdSet.has(user.id))

  const recent = nonFavoriteUsers
    .filter((user) => user.followedAt)
    .sort(
      (a, b) =>
        new Date(b.followedAt ?? 0).getTime() -
        new Date(a.followedAt ?? 0).getTime()
    )
    .slice(0, 50)

  const recentIdSet = new Set(recent.map((user) => user.id))

  const autoPool = nonFavoriteUsers.filter(
    (user) => !recentIdSet.has(user.id)
  )

  const officialBusiness = autoPool.filter(
    (user) =>
      user.accountType === 'official' ||
      user.accountType === 'business'
  )

  const officialBusinessIdSet = new Set(
    officialBusiness.map((user) => user.id)
  )

  const creator = autoPool.filter((user) => {
    if (officialBusinessIdSet.has(user.id)) return false

    return user.accountType === 'creator' || user.isCreator === true
  })

  const creatorIdSet = new Set(creator.map((user) => user.id))

  const normalUsers = autoPool.filter(
    (user) =>
      !officialBusinessIdSet.has(user.id) &&
      !creatorIdSet.has(user.id)
  )

  const moreInteraction = normalUsers
    .filter((user) => getInteractionScore(user) >= 10)
    .sort((a, b) => getInteractionScore(b) - getInteractionScore(a))

  const lessInteraction = normalUsers
    .filter((user) => getInteractionScore(user) < 10)
    .sort((a, b) => getInteractionScore(a) - getInteractionScore(b))

  return {
    recent,
    favorite,
    'more-interaction': moreInteraction,
    'less-interaction': lessInteraction,
    creator,
    'official-business': officialBusiness,
  }
}
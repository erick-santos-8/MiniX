"use client";

import { getProfileByUsername, getUserPosts } from "@/actions/profile.action";

type User = Awaited<ReturnType<typeof getProfileByUsername>>;
type Posts = Awaited<ReturnType<typeof getUserPosts>>;

interface ProfilePageClientProps {
  user: User
  posts: Posts
  likedPosts: Posts
  isFollowing: boolean
}

function ProfilePageClient({ user, isFollowing:initialIsFollowing, likedPosts, posts }: ProfilePageClientProps) {
  return (
    <div>ProfilePageClient</div>
  )
}

export default ProfilePageClient
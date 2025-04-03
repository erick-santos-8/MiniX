import { getProfileByUsername, getUserLikedPosts, getUserPosts, isFollowing } from "@/actions/profile.action";
import ProfilePageClient from "@/components/ProfilePageClient";
import { notFound } from "next/navigation";

//Mudar título da página de acordo com o nome do perfil
export async function generateMetadata({params}:{params: {username:string}}) {
  const user = await getProfileByUsername(params.username);
  if(!user) return;

  return {
    title: `${user.name ?? user.username}`,
    description: user.bio || `Visualizar o perfil de ${user.username}`,
  }
}

async function ProfilePageServer({params}: {params: {username: string}}) {
  const user = await getProfileByUsername(params.username);

  if(!user) notFound();

  const [posts, likedPosts, isCurrentUserFollowing] = await Promise.all([
    getUserPosts(user.id),
    getUserLikedPosts(user.id),
    isFollowing(user.id)
  ])
  return (
    <ProfilePageClient user={user} posts={posts} likedPosts={likedPosts} isFollowing={isCurrentUserFollowing}/>
  )
}

export default ProfilePageServer;
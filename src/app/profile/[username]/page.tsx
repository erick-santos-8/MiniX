import { getProfileByUsername } from "@/actions/profile.action";

//Mudar título da página de acordo com o nome do perfil
export async function generateMetadata({params}:{params: {username:string}}) {
  const user = await getProfileByUsername(params.username);
  if(!user) return;

  return {
    title: `${user.name ?? user.username}`,
    description: user.bio || `Visualizar o perfil de ${user.username}`,
  }
}

async function ProfilePage({params}: {params: {username: string}}) {
  console.log(params)
  return (
    <div>page</div>
  )
}

export default ProfilePage;
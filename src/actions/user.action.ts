"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { error } from "console";

export async function syncUser() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return;
    }

    //Verificar a existencia do usuario
    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    })

    if (existingUser) {
      return existingUser
    }


    const dbuser = await prisma.user.create({
      data: {
        clerkId: userId,
        name: `${user.firstName || ""} ${user.lastName || ""}`,
        username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
      },
    })

    return dbuser;
  } catch (error) {
    console.log("Erro ao sincronizar o usuario", error);
  }
}

export async function getUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({
    where: {
      clerkId,
    },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  })
}

export async function getDbUserId() {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Sem autorização")

  const user = await getUserByClerkId(clerkId);

  if (!user) throw new Error("Usuário não encontrado!");
  return user.id;
}

export async function getRandomUsers() {
  const userId = await getDbUserId();

  try {
    const randomUsers = await prisma.user.findMany({
      where: {
        AND: [
          { NOT: { id: userId } },
          {
            NOT: {
              followers: {
                some: {
                  followerId: userId
                }
              }
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        _count: {
          select: {
            followers: true
          }
        }
      },

      //Escolhe 3 usuários
      take: 3,
    })
    return randomUsers;
  } catch (error) {
    console.log("Erro ao escolher usuários para seguir", error);
    return [];
  }
}

export async function toggleFollow(targetUserId: string) {
  try {
    const userId = await getDbUserId();

    if (userId === targetUserId) throw new Error('Não é permitido seguir a sí mesmo');

    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId
        }
      }
    })

    if (existingFollow) {
      //Deixar de seguir
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId
          }
        }
      })
    } else {
      //Seguir
      //transaction é all or nothing
      await prisma.$transaction([
        prisma.follows.create({
          data: {
            followerId: userId,
            followingId: targetUserId
          }
        }),

        prisma.notification.create({
          data: {
            type: "FOLLOW",
            userId: targetUserId, //usuário seguido
            creatorId: userId //usuário seguindo
          }
        })
      ])
    }
    return { success: true }

  } catch (error) {
    console.log("Erro ao gerenciar os seguidores")
    return { success: false, error: "Erro ao gerenciar os seguidores" }
  }
}
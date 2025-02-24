"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export async function createPost(content: string, image: string) {
  try {
    const userId = await getDbUserId();

    if (!userId) return

    const post = await prisma.post.create({
      data: {
        content,
        image,
        authorId: userId
      }
    })


    revalidatePath("/");
    return { success: true, post }
  } catch (error) {
    console.error("Falha ao criar o post: ", error);
    return { success: false, error: "Falha ao criar um post" }
  }
}

export async function getPosts() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc"
      },
      include: {
        author: {
          select: {
            name: true,
            image: true,
            username: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                image: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: "asc"
          }
        },
        likes: {
          select: {
            userId: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    })

    return posts;
  } catch (error) {
    console.log("Erro em getPosts", error);
    throw new Error("Falha ao receber os posts");
  }
}

export async function toggleLike(postId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return null;

    //Checagem de existencia de dados
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true }
    })
    if (!post) throw new Error("Post não encontrado");

    if (existingLike) {
      //Dislike
      await prisma.like.delete({
        where: { userId_postId: { userId, postId } }
      })
    } else {
      //Like
      await prisma.$transaction([
        prisma.like.create({
          data: {
            userId,
            postId
          }
        }),
        ...(post.authorId !== userId ? [
          prisma.notification.create({
            data: {
              type: "LIKE",
              userId: post.authorId,
              creatorId: userId,
              postId,
            }
          })
        ] : [])
      ])
    }
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Falha ao dar like", error);
    return { success: false, error: "Falha em toggleLike" }
  }
}
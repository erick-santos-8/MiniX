"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export async function createPost(content: string, image: string) {
  try {
    const userId = await getDbUserId();

    if(!userId) return 

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

export async function getPosts(){

}
"use client";

import { createComment, deletePost, getPosts, toggleLike } from '@/actions/post.action';
import { SignInButton, useUser } from '@clerk/nextjs';
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { Card, CardContent } from './ui/card';
import Link from 'next/link';
import { Avatar, AvatarImage } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns'
import { DeleteAlertDialog } from './DeleteAlertDialog';
import { Button } from './ui/button';
import { HeartIcon, MessageCircleIcon } from 'lucide-react';

type Posts = Awaited<ReturnType<typeof getPosts>>
type Post = Posts[number]

function PostCard({ post, dbUserId }: { post: Post; dbUserId: string | null }) {
  const { user } = useUser();
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasLiked, setHasLiked] = useState(post.likes.some((like) => like.userId === dbUserId));
  const [optimisticLikes, setOptimisticLikes] = useState(post._count.likes);
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;

    try {
      setIsLiking(true);
      setHasLiked(prev => !prev)
      setOptimisticLikes((prev) => prev + (hasLiked ? -1 : 1))
      await toggleLike(post.id)
    } catch (error) {
      setOptimisticLikes(post._count.likes);
      setHasLiked(post.likes.some((like) => like.userId === dbUserId));
    } finally {
      setIsLiking(false);
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || isCommenting) return

    try {
      setIsCommenting(true);
      const result = await createComment(post.id, newComment);
      if (result?.success) {
        toast.success("Comentario realizado");
        setNewComment("");
      }
    } catch (error) {
      toast.error("Falha ao comentar");
    } finally {
      setIsCommenting(false);
    }
  }

  const handleDeletePost = async () => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      const result = await deletePost(post.id);
      if (result.success) toast.success("Post deletado")
      else throw new Error(result.error)
    } catch (error) {
      toast.error("Falha ao deletar post")
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Card className='overflow-hidden'>
      <CardContent className='p-4 sm:p-6'>
        <div className='space-y-4'>
          <div className='flex space-x-3 sm:*:space-x-4'>
            <Link href={`/profile/${post.author.username}`}>
              <Avatar className='size-8 sm:size-10'>
                <AvatarImage src={post.author.image ?? "/avatar.png"} />
              </Avatar>
            </Link>
            {/* Cabeçalho e conteudo */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 truncate">
                  <Link
                    href={`/profile/${post.author.username}`}
                    className="font-semibold truncate"
                  >
                    {post.author.name}
                  </Link>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Link href={`/profile/${post.author.username}`}>@{post.author.username}</Link>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                  </div>
                </div>
                {/* Checagem para ver se o usuário atual é o autor do post*/}
                {dbUserId === post.author.id && (
                  <DeleteAlertDialog isDeleting={isDeleting} onDelete={handleDeletePost} />
                )}
              </div>
              <p className="mt-2 text-sm text-foreground break-words">{post.content}</p>
            </div>
          </div>
          {/*Imagem do post*/}
          {post.image && (
            <div className='rounded-lg overflow-hidden'>
              <img src={post.image} alt='Conteúdo' className='w-full h-auto object-cover' />
            </div>
          )}

          {/* Botões de like e comentários */}
          <div className="flex items-center pt-2 space-x-4">
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                className={`text-muted-foreground gap-2 ${hasLiked ? "text-red-500 hover:text-red-600" : "hover:text-red-500"
                  }`}
                onClick={handleLike}
              >
                {hasLiked ? (
                  <HeartIcon className="size-5 fill-current" />
                ) : (
                  <HeartIcon className="size-5" />
                )}
                <span>{optimisticLikes}</span>
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="text-muted-foreground gap-2">
                  <HeartIcon className="size-5" />
                  <span>{optimisticLikes}</span>
                </Button>
              </SignInButton>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-2 hover:text-blue-500"
              onClick={() => setShowComments((prev) => !prev)}
            >
              <MessageCircleIcon
                className={`size-5 ${showComments ? "fill-blue-500 text-blue-500" : ""}`}
              />
              <span>{post.comments.length}</span>
            </Button>
          </div>
        </div>

      </CardContent>
    </Card>
  )
}

export default PostCard
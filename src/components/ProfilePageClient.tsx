"use client";

import { getProfileByUsername, getUserPosts, updateProfile } from "@/actions/profile.action";
import { toggleFollow } from "@/actions/user.action";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import { useState } from "react";
import toast from "react-hot-toast";

type User = Awaited<ReturnType<typeof getProfileByUsername>>;
type Posts = Awaited<ReturnType<typeof getUserPosts>>;

interface ProfilePageClientProps {
  user: NonNullable<User>
  posts: Posts
  likedPosts: Posts
  isFollowing: boolean
}

function ProfilePageClient({ user, isFollowing: initialIsFollowing, likedPosts, posts }: ProfilePageClientProps) {
  const { user: currentUser } = useUser();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);

  const [editForm, setEditForm] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || ""
  });

  const handleSubmit = async () => {
    const formData = new FormData();
    Object.entries(editForm).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const result = await updateProfile(formData);
    if(result.success) {
      setShowEditDialog(false);
      toast.success("Perfil atualizado!")
    }
  }

  const handleFollow = async () => {
    if(!currentUser) return;

    try {
      setIsUpdatingFollow(true);
      await toggleFollow(user.id)
      setIsFollowing(!isFollowing);
      toast.success("Campo de seguidor atualizado!");
    } catch (error) {
      toast.error("Falha ao atualizar o campo de seguidor");
    } finally {
      setIsUpdatingFollow(false);
    }
  }

  const isOwnProfile = currentUser?.username === user.username || currentUser?.emailAddresses[0].emailAddress.split("@")[0] === user.username;

  const formattedDate = format(new Date(user.createdAt), "MMMM yyyy");
  return (
    <div>ProfilePageClient</div>
  )
}

export default ProfilePageClient
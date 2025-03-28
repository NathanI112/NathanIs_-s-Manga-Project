"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ThumbsUp, MessageSquare, MoreVertical, Smile } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useSupabaseAuth } from "@/components/supabase-auth-provider"
import { useRouter } from "next/navigation"

type Comment = {
  id: number
  user: {
    name: string
    avatar: string | null
  }
  content: string
  timestamp: string
  likes: number
  isLiked?: boolean
  replies?: Comment[]
}

interface CommentSectionProps {
  initialComments?: Comment[]
  contentType?: string
  contentId?: string | number
}

export default function CommentSection({
  initialComments = [],
  contentType = "manga",
  contentId = "1",
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useSupabaseAuth()
  const router = useRouter()

  const handleSubmitComment = async () => {
    if (!user) {
      router.push("/login?redirect=" + router.asPath)
      return
    }

    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      const newCommentObj = {
        id: Date.now(),
        user: {
          name: user.email?.split("@")[0] || "Anonymous",
          avatar: user.user_metadata?.avatar_url || "/placeholder.svg?height=40&width=40",
        },
        content: newComment,
        timestamp: "Just now",
        likes: 0,
        isLiked: false,
        replies: [],
      }

      setComments([newCommentObj, ...comments])
      setNewComment("")
    } catch (error) {
      console.error("Error submitting comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitReply = async (parentId: number) => {
    if (!user) {
      router.push("/login?redirect=" + router.asPath)
      return
    }

    if (!replyContent.trim()) return

    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call
      const newReply = {
        id: Date.now(),
        user: {
          name: user.email?.split("@")[0] || "Anonymous",
          avatar: user.user_metadata?.avatar_url || "/placeholder.svg?height=40&width=40",
        },
        content: replyContent,
        timestamp: "Just now",
        likes: 0,
        isLiked: false,
      }

      // Update the comments state with the new reply
      const updatedComments = comments.map((comment) => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply],
          }
        }
        return comment
      })

      setComments(updatedComments)
      setReplyTo(null)
      setReplyContent("")
    } catch (error) {
      console.error("Error submitting reply:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLikeComment = async (commentId: number) => {
    if (!user) {
      router.push("/login?redirect=" + router.asPath)
      return
    }

    // Update UI
    const updatedComments = comments.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
          isLiked: !comment.isLiked,
        }
      }

      // Check in replies
      if (comment.replies) {
        return {
          ...comment,
          replies: comment.replies.map((reply) => {
            if (reply.id === commentId) {
              return {
                ...reply,
                likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                isLiked: !reply.isLiked,
              }
            }
            return reply
          }),
        }
      }

      return comment
    })

    setComments(updatedComments)
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!user) return

    // Update UI
    const updatedComments = comments.filter((comment) => {
      if (comment.id === commentId) {
        return false
      }

      // Filter out deleted replies
      if (comment.replies) {
        comment.replies = comment.replies.filter((reply) => reply.id !== commentId)
      }

      return true
    })

    setComments(updatedComments)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg?height=40&width=40"} />
              <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "?"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={!user}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm">
            <Smile className="mr-2 h-4 w-4" />
            Emoji
          </Button>
          <Button onClick={handleSubmitComment} disabled={isSubmitting || !newComment.trim() || !user}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </CardFooter>
      </Card>

      {comments.length === 0 ? (
        <div className="text-center py-4">No comments yet. Be the first to comment!</div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id} className="overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.user?.avatar || "/placeholder.svg?height=40&width=40"} />
                    <AvatarFallback>{comment.user?.name?.charAt(0).toUpperCase() || "?"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{comment.user?.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{comment.timestamp}</span>
                      </div>
                      {user && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDeleteComment(comment.id)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    <p className="text-sm">{comment.content}</p>
                    <div className="flex items-center gap-4 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`flex items-center gap-1 ${comment.isLiked ? "text-primary" : ""}`}
                        onClick={() => handleLikeComment(comment.id)}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{comment.likes}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Reply</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {replyTo === comment.id && (
                  <div className="ml-14 mt-4">
                    <div className="flex gap-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg?height=32&width=32"} />
                        <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "?"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder="Write a reply..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          disabled={!user}
                          className="min-h-[80px]"
                        />
                        <div className="flex justify-end mt-2 gap-2">
                          <Button variant="outline" size="sm" onClick={() => setReplyTo(null)}>
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSubmitReply(comment.id)}
                            disabled={isSubmitting || !replyContent.trim() || !user}
                          >
                            {isSubmitting ? "Submitting..." : "Reply"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-14 mt-4 space-y-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-4">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={reply.user?.avatar || "/placeholder.svg?height=32&width=32"} />
                          <AvatarFallback>{reply.user?.name?.charAt(0).toUpperCase() || "?"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">{reply.user?.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">{reply.timestamp}</span>
                            </div>
                            {user && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleDeleteComment(reply.id)}>
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                          <p className="text-sm">{reply.content}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`flex items-center gap-1 ${reply.isLiked ? "text-primary" : ""}`}
                            onClick={() => handleLikeComment(reply.id)}
                          >
                            <ThumbsUp className="h-4 w-4" />
                            <span>{reply.likes}</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


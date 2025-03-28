"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Ban, UserX, Bell, Shield, User, Search, CheckCircle, Clock, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Sample user data
const userData = [
  {
    id: "1",
    username: "MangaFan123",
    email: "mangafan123@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "active",
    role: "user",
    joinDate: "2023-01-15",
    lastActive: "2023-03-15",
  },
  {
    id: "2",
    username: "NathanIs",
    email: "taha62batu@gmail.com",
    avatar: "/placeholder.svg?height=40&width=40&text=NI",
    status: "active",
    role: "admin",
    joinDate: "2023-01-01",
    lastActive: "2023-03-16",
  },
  {
    id: "3",
    username: "AnimeWatcher42",
    email: "anime42@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "active",
    role: "user",
    joinDate: "2023-02-10",
    lastActive: "2023-03-14",
  },
  {
    id: "4",
    username: "MangaCollector",
    email: "collector@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "muted",
    role: "user",
    joinDate: "2023-01-20",
    lastActive: "2023-03-10",
    mutedUntil: "2023-03-20",
    muteReason: "Excessive spamming in comments",
  },
  {
    id: "5",
    username: "SpamUser123",
    email: "spam@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "banned",
    role: "user",
    joinDate: "2023-02-05",
    lastActive: "2023-02-28",
    banReason: "Spamming comments",
    banExpiry: "permanent",
  },
]

export default function AdminUserManagement() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState(userData)
  const [selectedUser, setSelectedUser] = useState<(typeof userData)[0] | null>(null)
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [muteDialogOpen, setMuteDialogOpen] = useState(false)
  const [userDetailsDialogOpen, setUserDetailsDialogOpen] = useState(false)
  const [banReason, setBanReason] = useState("")
  const [banDuration, setBanDuration] = useState("permanent")
  const [banExpiryDate, setBanExpiryDate] = useState("")
  const [muteReason, setMuteReason] = useState("")
  const [muteDuration, setMuteDuration] = useState("24")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterRole, setFilterRole] = useState("all")

  const filteredUsers = users.filter((user) => {
    // Text search filter
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    // Status filter
    const matchesStatus = filterStatus === "all" || user.status === filterStatus

    // Role filter
    const matchesRole = filterRole === "all" || user.role === filterRole

    return matchesSearch && matchesStatus && matchesRole
  })

  const handleBanUser = () => {
    if (!selectedUser) return

    let banExpiryValue = null
    if (banDuration === "temporary" && banExpiryDate) {
      banExpiryValue = banExpiryDate
    } else if (banDuration === "permanent") {
      banExpiryValue = "permanent"
    } else {
      toast({
        title: "Missing expiry date",
        description: "Please select an expiry date for temporary bans",
        variant: "destructive",
      })
      return
    }

    const updatedUsers = users.map((user) => {
      if (user.id === selectedUser.id) {
        return {
          ...user,
          status: "banned",
          banReason,
          banExpiry: banExpiryValue,
        }
      }
      return user
    })

    setUsers(updatedUsers)
    setBanDialogOpen(false)
    setBanReason("")
    setBanDuration("permanent")
    setBanExpiryDate("")

    toast({
      title: "User Banned",
      description: `${selectedUser.username} has been banned from the platform.`,
    })
  }

  const handleMuteUser = () => {
    if (!selectedUser) return

    if (!muteReason) {
      toast({
        title: "Missing reason",
        description: "Please provide a reason for muting this user",
        variant: "destructive",
      })
      return
    }

    // Calculate mute end date
    const now = new Date()
    const muteEnd = new Date(now.getTime() + Number.parseInt(muteDuration) * 60 * 60 * 1000)
    const muteEndStr = muteEnd.toISOString().split("T")[0]

    const updatedUsers = users.map((user) => {
      if (user.id === selectedUser.id) {
        return {
          ...user,
          status: "muted",
          mutedUntil: muteEndStr,
          muteReason,
        }
      }
      return user
    })

    setUsers(updatedUsers)
    setMuteDialogOpen(false)
    setMuteDuration("24")
    setMuteReason("")

    toast({
      title: "User Muted",
      description: `${selectedUser.username} has been muted until ${muteEndStr}.`,
    })
  }

  const handleUnrestrictUser = (userId: string) => {
    const updatedUsers = users.map((user) => {
      if (user.id === userId) {
        const updatedUser = {
          ...user,
          status: "active",
        }
        // Remove restriction properties
        delete updatedUser.banReason
        delete updatedUser.banExpiry
        delete updatedUser.mutedUntil
        delete updatedUser.muteReason
        return updatedUser
      }
      return user
    })

    setUsers(updatedUsers)

    const user = users.find((u) => u.id === userId)
    if (user) {
      toast({
        title: "Restrictions Removed",
        description: `${user.username} can now fully access the platform.`,
      })
    }
  }

  const handlePromoteToAdmin = (userId: string) => {
    const updatedUsers = users.map((user) => {
      if (user.id === userId) {
        return {
          ...user,
          role: "admin",
        }
      }
      return user
    })

    setUsers(updatedUsers)

    const user = users.find((u) => u.id === userId)
    if (user) {
      toast({
        title: "User Promoted",
        description: `${user.username} has been promoted to admin.`,
      })
    }
  }

  const handleDemoteToUser = (userId: string) => {
    const updatedUsers = users.map((user) => {
      if (user.id === userId) {
        return {
          ...user,
          role: "user",
        }
      }
      return user
    })

    setUsers(updatedUsers)

    const user = users.find((u) => u.id === userId)
    if (user) {
      toast({
        title: "Admin Demoted",
        description: `${user.username} has been demoted to regular user.`,
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            Active
          </Badge>
        )
      case "muted":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            Muted
          </Badge>
        )
      case "banned":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            Banned
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Admin
          </Badge>
        )
      case "user":
        return <Badge variant="outline">User</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="muted">Muted</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">Users</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Avatar</TableHead>
              <TableHead>Username</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Role</TableHead>
              <TableHead className="hidden md:table-cell">Joined</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.username} />
                      <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{user.username}</span>
                      <span className="text-xs text-muted-foreground md:hidden">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                  <TableCell className="hidden md:table-cell">{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="hidden md:table-cell">{getRoleBadge(user.role)}</TableCell>
                  <TableCell className="hidden md:table-cell">{user.joinDate}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user)
                            setUserDetailsDialogOpen(true)
                          }}
                        >
                          <User className="mr-2 h-4 w-4" />
                          <span>View Details</span>
                        </DropdownMenuItem>

                        {user.status === "active" && (
                          <>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user)
                                setMuteDialogOpen(true)
                              }}
                            >
                              <Bell className="mr-2 h-4 w-4" />
                              <span>Mute User</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user)
                                setBanDialogOpen(true)
                              }}
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              <span>Ban User</span>
                            </DropdownMenuItem>
                          </>
                        )}

                        {(user.status === "banned" || user.status === "muted") && (
                          <DropdownMenuItem onClick={() => handleUnrestrictUser(user.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            <span>Remove Restrictions</span>
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        {user.role === "user" ? (
                          <DropdownMenuItem onClick={() => handlePromoteToAdmin(user.id)}>
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Promote to Admin</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleDemoteToUser(user.id)}>
                            <UserX className="mr-2 h-4 w-4" />
                            <span>Demote to User</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Ban User Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>This will prevent the user from accessing the platform.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {selectedUser && (
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={selectedUser.avatar} alt={selectedUser.username} />
                  <AvatarFallback>{selectedUser.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedUser.username}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="banReason">Reason for ban *</Label>
              <Textarea
                id="banReason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="e.g. Violating community guidelines"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Ban Duration</Label>
              <RadioGroup value={banDuration} onValueChange={setBanDuration}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="permanent" id="permanent" />
                  <Label htmlFor="permanent">Permanent</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="temporary" id="temporary" />
                  <Label htmlFor="temporary">Temporary</Label>
                </div>
              </RadioGroup>
            </div>

            {banDuration === "temporary" && (
              <div className="space-y-2">
                <Label htmlFor="banExpiryDate">Ban Until *</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="banExpiryDate"
                    type="date"
                    value={banExpiryDate}
                    onChange={(e) => setBanExpiryDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBanUser}>
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mute User Dialog */}
      <Dialog open={muteDialogOpen} onOpenChange={setMuteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mute User</DialogTitle>
            <DialogDescription>
              This will prevent the user from commenting or interacting with others for the specified duration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {selectedUser && (
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={selectedUser.avatar} alt={selectedUser.username} />
                  <AvatarFallback>{selectedUser.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedUser.username}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="muteReason">Reason for muting *</Label>
              <Textarea
                id="muteReason"
                value={muteReason}
                onChange={(e) => setMuteReason(e.target.value)}
                placeholder="e.g. Excessive spamming in comments"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="muteDuration">Mute Duration (hours) *</Label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="muteDuration"
                  type="number"
                  value={muteDuration}
                  onChange={(e) => setMuteDuration(e.target.value)}
                  min="1"
                  max="720"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">Maximum duration: 30 days (720 hours)</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMuteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleMuteUser}>
              Mute User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={userDetailsDialogOpen} onOpenChange={setUserDetailsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <Tabs defaultValue="info">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="restrictions">Restrictions</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4 pt-4">
                <div className="flex flex-col items-center gap-4 py-2">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedUser.avatar} alt={selectedUser.username} />
                    <AvatarFallback>{selectedUser.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="text-lg font-medium">{selectedUser.username}</h3>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      {getStatusBadge(selectedUser.status)}
                      {getRoleBadge(selectedUser.role)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">User ID:</span>
                    <span className="text-sm font-medium">{selectedUser.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Join Date:</span>
                    <span className="text-sm font-medium">{selectedUser.joinDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Last Active:</span>
                    <span className="text-sm font-medium">{selectedUser.lastActive}</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4 pt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Comments</span>
                    <span className="text-sm">42</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Likes</span>
                    <span className="text-sm">128</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Bookmarks</span>
                    <span className="text-sm">15</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Reading History</span>
                    <span className="text-sm">87 chapters</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Commented on Chapter 223 of Jujutsu Kaisen</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Added One Piece to bookmarks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Read Chapter 1089 of One Piece</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="restrictions" className="space-y-4 pt-4">
                {selectedUser.status === "banned" && (
                  <div className="space-y-2 border rounded-md p-4 bg-destructive/5">
                    <div className="flex items-center gap-2">
                      <Ban className="h-4 w-4 text-destructive" />
                      <h4 className="font-medium text-destructive">Banned</h4>
                    </div>
                    <p className="text-sm">Reason: {selectedUser.banReason}</p>
                    <p className="text-sm">
                      Duration:{" "}
                      {selectedUser.banExpiry === "permanent" ? "Permanent" : `Until ${selectedUser.banExpiry}`}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => handleUnrestrictUser(selectedUser.id)}
                    >
                      <CheckCircle className="mr-2 h-3 w-3" />
                      Remove Ban
                    </Button>
                  </div>
                )}

                {selectedUser.status === "muted" && (
                  <div className="space-y-2 border rounded-md p-4 bg-yellow-500/5">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-yellow-500" />
                      <h4 className="font-medium text-yellow-500">Muted</h4>
                    </div>
                    <p className="text-sm">Reason: {selectedUser.muteReason}</p>
                    <p className="text-sm">Until: {selectedUser.mutedUntil}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => handleUnrestrictUser(selectedUser.id)}
                    >
                      <CheckCircle className="mr-2 h-3 w-3" />
                      Remove Mute
                    </Button>
                  </div>
                )}

                {selectedUser.status === "active" && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                    <h4 className="font-medium">No Active Restrictions</h4>
                    <p className="text-sm text-muted-foreground">This user has no active restrictions.</p>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setUserDetailsDialogOpen(false)
                          setMuteDialogOpen(true)
                        }}
                      >
                        <Bell className="mr-2 h-3 w-3" />
                        Mute User
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setUserDetailsDialogOpen(false)
                          setBanDialogOpen(true)
                        }}
                      >
                        <Ban className="mr-2 h-3 w-3" />
                        Ban User
                      </Button>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Restriction History</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Muted for 24 hours on 2023-01-05</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Warning issued on 2022-12-20</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


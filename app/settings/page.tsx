"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { User, Shield, Bell, BookOpen, Moon, Sun, AlertCircle, Camera } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import Header from "@/components/header"

export default function SettingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, updateUser, updatePassword, logout } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    avatar: "",
    bio: "",
    favoriteGenres: [] as string[],
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [readerSettings, setReaderSettings] = useState({
    readerMode: "vertical",
    autoNextChapter: true,
    showPageNumbers: true,
  })

  const [themeSettings, setThemeSettings] = useState({
    theme: "system",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    newChapters: true,
    comments: true,
    updates: false,
    newsletter: true,
  })

  const [passwordError, setPasswordError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  // Available genres for selection
  const availableGenres = [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Fantasy",
    "Horror",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Slice of Life",
    "Sports",
    "Supernatural",
    "Thriller",
  ]

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  // Load user data
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio || "",
        favoriteGenres: user.favoriteGenres || [],
      })

      setReaderSettings({
        readerMode: user.preferences?.readerMode || "vertical",
        autoNextChapter: user.preferences?.autoNextChapter !== false,
        showPageNumbers: user.preferences?.showPageNumbers !== false,
      })

      setThemeSettings({
        theme: user.preferences?.theme || "system",
      })
    }
  }, [user])

  // Handle profile changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle password changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setPasswordError("")
    setPasswordSuccess(false)
  }

  // Handle notification toggle
  const handleNotificationToggle = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }))
  }

  // Handle reader settings toggle
  const handleReaderToggle = (setting: keyof typeof readerSettings) => {
    if (typeof readerSettings[setting] === "boolean") {
      setReaderSettings((prev) => ({
        ...prev,
        [setting]: !prev[setting],
      }))
    }
  }

  // Handle reader mode change
  const handleReaderModeChange = (value: string) => {
    setReaderSettings((prev) => ({
      ...prev,
      readerMode: value as "vertical" | "horizontal",
    }))
  }

  // Handle theme change
  const handleThemeChange = (value: string) => {
    setThemeSettings((prev) => ({
      ...prev,
      theme: value as "light" | "dark" | "system",
    }))
  }

  // Handle genre toggle
  const handleGenreToggle = (genre: string) => {
    setProfileData((prev) => {
      const updatedGenres = prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter((g) => g !== genre)
        : [...prev.favoriteGenres, genre]

      return {
        ...prev,
        favoriteGenres: updatedGenres,
      }
    })
  }

  // Handle avatar upload button click
  const handleAvatarUploadClick = () => {
    fileInputRef.current?.click()
  }

  // Handle avatar file change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Avatar image must be less than 2MB",
        variant: "destructive",
      })
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, GIF)",
        variant: "destructive",
      })
      return
    }

    // Create a preview URL
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setPreviewAvatar(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  // Save profile
  const handleSaveProfile = () => {
    if (!user) return

    updateUser({
      username: profileData.username,
      email: profileData.email,
      avatar: previewAvatar || profileData.avatar,
      bio: profileData.bio,
      favoriteGenres: profileData.favoriteGenres,
    })

    // Reset preview after saving
    setPreviewAvatar(null)
  }

  // Save password
  const handleSavePassword = async () => {
    if (!user) return

    // Reset states
    setPasswordError("")
    setPasswordSuccess(false)

    // Validate passwords
    if (passwordData.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    setIsSubmitting(true)

    try {
      const success = await updatePassword(passwordData.currentPassword, passwordData.newPassword)

      if (success) {
        setPasswordSuccess(true)
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      }
    } catch (error) {
      console.error("Error updating password:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Save reader settings
  const handleSaveReaderSettings = () => {
    if (!user) return

    updateUser({
      preferences: {
        ...user.preferences,
        readerMode: readerSettings.readerMode as "vertical" | "horizontal",
        autoNextChapter: readerSettings.autoNextChapter,
        showPageNumbers: readerSettings.showPageNumbers,
      },
    })
  }

  // Save theme settings
  const handleSaveThemeSettings = () => {
    if (!user) return

    updateUser({
      preferences: {
        ...user.preferences,
        theme: themeSettings.theme as "light" | "dark" | "system",
      },
    })

    // Apply theme
    const html = document.querySelector("html")
    if (html) {
      if (themeSettings.theme === "dark") {
        html.classList.add("dark")
      } else if (themeSettings.theme === "light") {
        html.classList.remove("dark")
      }
    }
  }

  // Save notification settings
  const handleSaveNotifications = () => {
    toast({
      title: "Notification settings updated",
      description: "Your notification preferences have been saved",
    })
  }

  if (!user) {
    return null // Loading or redirecting
  }

  return (
    <>
      <Header />
      <div className="container py-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="password" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Password</span>
              </TabsTrigger>
              <TabsTrigger value="reader" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Reader</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                <span>Appearance</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your profile information and how others see you on the site</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <div className="relative">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={previewAvatar || profileData.avatar} alt="Profile picture" />
                        <AvatarFallback>{profileData.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute -bottom-2 -right-2 rounded-full h-8 w-8"
                        onClick={handleAvatarUploadClick}
                      >
                        <Camera className="h-4 w-4" />
                        <span className="sr-only">Change avatar</span>
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                    </div>
                    <div>
                      <Button size="sm" variant="outline" onClick={handleAvatarUploadClick}>
                        Change Avatar
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">JPG, GIF or PNG. Max size 2MB.</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        value={profileData.username}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      placeholder="Tell us a little about yourself"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Favorite Genres</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {availableGenres.map((genre) => (
                        <div key={genre} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`genre-${genre}`}
                            checked={profileData.favoriteGenres.includes(genre)}
                            onChange={() => handleGenreToggle(genre)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <label
                            htmlFor={`genre-${genre}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {genre}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveProfile}>Save Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Password Tab */}
            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your password to keep your account secure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {passwordError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{passwordError}</AlertDescription>
                    </Alert>
                  )}

                  {passwordSuccess && (
                    <Alert variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
                      <AlertDescription>Your password has been updated successfully!</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSavePassword} disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update Password"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Reader Tab */}
            <TabsContent value="reader">
              <Card>
                <CardHeader>
                  <CardTitle>Reader Settings</CardTitle>
                  <CardDescription>Customize your manga reading experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="readerMode">Reader Mode</Label>
                    <Select value={readerSettings.readerMode} onValueChange={handleReaderModeChange}>
                      <SelectTrigger id="readerMode" className="w-full sm:w-[240px]">
                        <SelectValue placeholder="Select reader mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vertical">Vertical Scrolling</SelectItem>
                        <SelectItem value="horizontal">Horizontal Paging</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Vertical mode allows continuous scrolling, while horizontal mode shows one page at a time.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="autoNextChapter">Auto Next Chapter</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically proceed to the next chapter when reaching the end
                        </p>
                      </div>
                      <Switch
                        id="autoNextChapter"
                        checked={readerSettings.autoNextChapter}
                        onCheckedChange={() => handleReaderToggle("autoNextChapter")}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="showPageNumbers">Show Page Numbers</Label>
                        <p className="text-sm text-muted-foreground">Display page numbers while reading</p>
                      </div>
                      <Switch
                        id="showPageNumbers"
                        checked={readerSettings.showPageNumbers}
                        onCheckedChange={() => handleReaderToggle("showPageNumbers")}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveReaderSettings}>Save Settings</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize the look and feel of the website</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select value={themeSettings.theme} onValueChange={handleThemeChange}>
                      <SelectTrigger id="theme" className="w-full sm:w-[240px]">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="h-4 w-4" />
                            <span>Light</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            <span>Dark</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center gap-2">
                            <span>System</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">Choose between light, dark, or system theme.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <Card className="bg-background border-2 hover:border-primary cursor-pointer transition-all">
                      <CardContent className="p-6">
                        <div className="aspect-video bg-background rounded-md border flex items-center justify-center">
                          <Sun className="h-8 w-8 text-foreground" />
                        </div>
                        <h3 className="mt-3 font-medium text-center">Light Mode</h3>
                      </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-2 hover:border-primary cursor-pointer transition-all">
                      <CardContent className="p-6">
                        <div className="aspect-video bg-zinc-800 rounded-md border border-zinc-700 flex items-center justify-center">
                          <Moon className="h-8 w-8 text-zinc-100" />
                        </div>
                        <h3 className="mt-3 font-medium text-center text-zinc-100">Dark Mode</h3>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveThemeSettings}>Save Preferences</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Configure how and when you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="newChapters">New Chapter Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications when new chapters are released for manga you follow
                        </p>
                      </div>
                      <Switch
                        id="newChapters"
                        checked={notificationSettings.newChapters}
                        onCheckedChange={() => handleNotificationToggle("newChapters")}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="comments">Comment Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications when someone replies to your comments
                        </p>
                      </div>
                      <Switch
                        id="comments"
                        checked={notificationSettings.comments}
                        onCheckedChange={() => handleNotificationToggle("comments")}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="updates">Site Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications about site updates and new features
                        </p>
                      </div>
                      <Switch
                        id="updates"
                        checked={notificationSettings.updates}
                        onCheckedChange={() => handleNotificationToggle("updates")}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="newsletter">Weekly Newsletter</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive our weekly newsletter with manga recommendations
                        </p>
                      </div>
                      <Switch
                        id="newsletter"
                        checked={notificationSettings.newsletter}
                        onCheckedChange={() => handleNotificationToggle("newsletter")}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveNotifications}>Save Preferences</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}


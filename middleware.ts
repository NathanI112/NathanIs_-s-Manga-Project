import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

// Rate limiter için basit bir in-memory store
// Gerçek uygulamada Redis gibi bir çözüm kullanılmalıdır
const ipRequestMap = new Map<string, { count: number; timestamp: number }>()
const pathRequestMap = new Map<string, { count: number; timestamp: number }>()

// Konfigürasyon
const rateLimitConfig = {
  // IP başına saniyede izin verilen maksimum istek sayısı
  ipRateLimit: 20,

  // Belirli bir endpoint için saniyede izin verilen maksimum istek sayısı
  pathRateLimit: {
    "/api/": 50,
    "/api/manga": 30,
    "/api/chapters": 30,
    "/api/users": 20,
    "/api/comments": 15,
  },

  // Rate limit penceresi (milisaniye)
  windowMs: 60 * 1000, // 1 dakika

  // Şüpheli davranış eşikleri
  suspiciousThresholds: {
    consecutiveErrors: 5,
    rapidRequests: 10,
    concurrentConnections: 15,
  },

  // Beyaz liste - bu IP'ler rate limit'e tabi değil
  whitelist: ["127.0.0.1"],

  // Kara liste - bu IP'ler her zaman engellenir
  blacklist: [],

  // Engelleme süresi (milisaniye)
  blockDuration: 10 * 60 * 1000, // 10 dakika
}

// Şüpheli IP'leri izlemek için
const suspiciousIPs = new Map<
  string,
  {
    consecutiveErrors: number
    lastErrorTime: number
    rapidRequests: number
    lastRequestTime: number
    blocked: boolean
    blockUntil: number
  }
>()

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes that require authentication
  const protectedRoutes = ["/settings", "/library", "/history"]

  // Admin routes that require admin role
  const adminRoutes = ["/admin/dashboard"]

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Check if the current path is admin route
  const isAdminRoute = adminRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // For admin routes, check if user has admin role
  if (isAdminRoute && session) {
    // Get user role from database
    const { data: userData, error } = await supabase.from("users").select("role").eq("uuid", session.user.id).single()

    if (error || !userData || userData.role !== "admin") {
      // Redirect non-admin users to home page
      return NextResponse.redirect(new URL("/", request.url))
    }
  } else if (isAdminRoute && !session) {
    // Redirect to admin login if not authenticated
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  const ip = request.ip || "unknown"
  const path = request.nextUrl.pathname
  const userAgent = request.headers.get("user-agent") || ""
  const now = Date.now()

  // Beyaz listedeki IP'leri kontrol et
  if (rateLimitConfig.whitelist.includes(ip)) {
    return res
  }

  // Kara listedeki IP'leri kontrol et
  if (rateLimitConfig.blacklist.includes(ip)) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  // Şüpheli IP kontrolü
  if (isSuspicious(ip, now)) {
    return new NextResponse("Too Many Requests", { status: 429 })
  }

  // IP bazlı rate limiting
  if (!checkRateLimit(ip, ipRequestMap, rateLimitConfig.ipRateLimit, now)) {
    trackSuspiciousActivity(ip, "rapidRequests", now)
    return new NextResponse("Too Many Requests", { status: 429 })
  }

  // Path bazlı rate limiting
  for (const [pathPrefix, limit] of Object.entries(rateLimitConfig.pathRateLimit)) {
    if (path.startsWith(pathPrefix)) {
      if (!checkRateLimit(`${ip}:${pathPrefix}`, pathRequestMap, limit, now)) {
        trackSuspiciousActivity(ip, "rapidRequests", now)
        return new NextResponse("Too Many Requests", { status: 429 })
      }
      break
    }
  }

  // Şüpheli user-agent kontrolü
  if (isSuspiciousUserAgent(userAgent)) {
    trackSuspiciousActivity(ip, "consecutiveErrors", now)
    return new NextResponse("Forbidden", { status: 403 })
  }

  // HTTP flood koruması
  if (isHttpFlood(ip, path, now)) {
    trackSuspiciousActivity(ip, "rapidRequests", now)
    return new NextResponse("Too Many Requests", { status: 429 })
  }

  // Güvenlik başlıkları ekle
  const response = res

  // XSS koruması
  response.headers.set("X-XSS-Protection", "1; mode=block")

  // Clickjacking koruması
  response.headers.set("X-Frame-Options", "SAMEORIGIN")

  // MIME sniffing koruması
  response.headers.set("X-Content-Type-Options", "nosniff")

  // Referrer Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'",
  )

  return response
}

// Rate limit kontrolü
function checkRateLimit(
  key: string,
  store: Map<string, { count: number; timestamp: number }>,
  limit: number,
  now: number,
): boolean {
  const windowStart = now - rateLimitConfig.windowMs

  // Mevcut kayıt varsa kontrol et
  if (store.has(key)) {
    const record = store.get(key)!

    // Pencere dışındaysa sıfırla
    if (record.timestamp < windowStart) {
      store.set(key, { count: 1, timestamp: now })
      return true
    }

    // Limit aşıldıysa reddet
    if (record.count >= limit) {
      return false
    }

    // Sayacı artır
    record.count++
    return true
  }

  // Yeni kayıt oluştur
  store.set(key, { count: 1, timestamp: now })
  return true
}

// Şüpheli IP kontrolü
function isSuspicious(ip: string, now: number): boolean {
  if (!suspiciousIPs.has(ip)) {
    return false
  }

  const record = suspiciousIPs.get(ip)!

  // IP engellendiyse ve engelleme süresi dolmadıysa
  if (record.blocked && now < record.blockUntil) {
    return true
  }

  // Engelleme süresi dolduysa engeli kaldır
  if (record.blocked && now >= record.blockUntil) {
    record.blocked = false
    record.consecutiveErrors = 0
    record.rapidRequests = 0
  }

  return false
}

// Şüpheli aktivite takibi
function trackSuspiciousActivity(ip: string, type: "consecutiveErrors" | "rapidRequests", now: number): void {
  if (!suspiciousIPs.has(ip)) {
    suspiciousIPs.set(ip, {
      consecutiveErrors: 0,
      lastErrorTime: 0,
      rapidRequests: 0,
      lastRequestTime: 0,
      blocked: false,
      blockUntil: 0,
    })
  }

  const record = suspiciousIPs.get(ip)!

  if (type === "consecutiveErrors") {
    record.consecutiveErrors++
    record.lastErrorTime = now
  } else if (type === "rapidRequests") {
    record.rapidRequests++
    record.lastRequestTime = now
  }

  // Eşik aşıldıysa IP'yi engelle
  if (
    record.consecutiveErrors >= rateLimitConfig.suspiciousThresholds.consecutiveErrors ||
    record.rapidRequests >= rateLimitConfig.suspiciousThresholds.rapidRequests
  ) {
    record.blocked = true
    record.blockUntil = now + rateLimitConfig.blockDuration

    // Gerçek uygulamada burada bir log veya alarm sistemi olabilir
    console.log(`IP ${ip} blocked until ${new Date(record.blockUntil).toISOString()}`)

    // Belirli bir süre sonra eski kayıtları temizle
    setTimeout(() => {
      if (suspiciousIPs.has(ip)) {
        const currentRecord = suspiciousIPs.get(ip)!
        if (now >= currentRecord.blockUntil) {
          suspiciousIPs.delete(ip)
        }
      }
    }, rateLimitConfig.blockDuration + 1000)
  }
}

// Şüpheli user-agent kontrolü
function isSuspiciousUserAgent(userAgent: string): boolean {
  const suspiciousPatterns = [
    /bot/i,
    /crawl/i,
    /scrape/i,
    /spider/i,
    /curl/i,
    /wget/i,
    /^$/, // Boş user-agent
    /python/i,
    /go-http/i,
    /java/i,
  ]

  // Bilinen tarayıcılar için whitelist
  const knownBrowsers = [/chrome/i, /firefox/i, /safari/i, /edge/i, /opera/i, /msie|trident/i]

  // Bilinen bir tarayıcı ise izin ver
  for (const pattern of knownBrowsers) {
    if (pattern.test(userAgent)) {
      return false
    }
  }

  // Şüpheli bir pattern varsa engelle
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(userAgent)) {
      return true
    }
  }

  return false
}

// HTTP flood kontrolü
function isHttpFlood(ip: string, path: string, now: number): boolean {
  const key = `${ip}:${path}`
  const floodThreshold = 5 // 1 saniyede aynı endpoint'e 5'ten fazla istek
  const floodWindow = 1000 // 1 saniye

  if (!pathRequestMap.has(key)) {
    pathRequestMap.set(key, { count: 1, timestamp: now })
    return false
  }

  const record = pathRequestMap.get(key)!
  const timeDiff = now - record.timestamp

  if (timeDiff < floodWindow && record.count >= floodThreshold) {
    return true
  }

  if (timeDiff >= floodWindow) {
    record.count = 1
    record.timestamp = now
  } else {
    record.count++
  }

  return false
}

// Middleware'in çalışacağı path'leri belirt
export const config = {
  matcher: [
    "/settings/:path*",
    "/library/:path*",
    "/history/:path*",
    "/admin/:path*",
    // API rotaları
    //"/api/:path*",
    // Admin rotaları
    //"/admin/:path*",
    // Kullanıcı işlemleri
    //"/login",
    //"/register",
    //"/settings",
    // Manga ve bölüm sayfaları
    //"/manga/:path*",
  ],
}


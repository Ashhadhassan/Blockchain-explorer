"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usersApi } from "@/lib/api"
import { CheckCircle, Mail, Loader2 } from "lucide-react"
import Link from "next/link"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [token, setToken] = useState("")
  const [email, setEmail] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    const emailParam = searchParams.get("email")
    
    if (tokenParam) {
      setToken(tokenParam)
      handleVerify(tokenParam)
    } else if (emailParam) {
      setEmail(emailParam)
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }, [searchParams])

  const handleVerify = async (verifyToken?: string) => {
    const tokenToUse = verifyToken || token
    if (!tokenToUse) {
      toast.error("Verification token is required")
      return
    }

    setIsVerifying(true)
    try {
      await usersApi.verifyEmail(tokenToUse)
      setIsVerified(true)
      toast.success("Email verified successfully! Your wallet has been created.")
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (error: any) {
      const message = error.data?.message || error.message || "Verification failed"
      toast.error(message)
    } finally {
      setIsVerifying(false)
      setIsLoading(false)
    }
  }

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleVerify()
  }

  const handleResendVerification = async () => {
    if (!email) {
      toast.error("Email address is required")
      return
    }

    setIsResending(true)
    try {
      await usersApi.resendVerification(email)
      toast.success("Verification email sent! Please check your inbox.")
    } catch (error: any) {
      const message = error.data?.message || error.message || "Failed to resend verification email"
      toast.error(message)
    } finally {
      setIsResending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Verifying email...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show email sent confirmation if email param is present but no token
  if (email && !token && !isVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold">Check Your Email</CardTitle>
            <CardDescription>
              We've sent a verification link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-foreground text-center">
                  📧 Please check your email inbox and click the verification link to activate your account.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center">
                  Didn't receive the email? Check your spam folder or
                </p>
                <Button 
                  onClick={handleResendVerification}
                  disabled={isResending}
                  variant="outline"
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Resend Verification Email"
                  )}
                </Button>
              </div>
              <Button 
                onClick={() => router.push("/login")} 
                variant="ghost"
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <CardTitle className="text-2xl font-semibold">Email Verified!</CardTitle>
            <CardDescription>Your email has been verified and your wallet has been created automatically.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                <p className="text-sm text-foreground">
                  ✅ Email verified successfully
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  ✅ Wallet created automatically
                </p>
              </div>
              <Button 
                onClick={() => router.push("/login")} 
                className="w-full"
              >
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-semibold">Verify Your Email</CardTitle>
          <CardDescription>
            Enter the verification token sent to your email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleManualVerify} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter your email to resend verification if needed
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="token">Verification Token</Label>
                <Input
                  id="token"
                  placeholder="Enter verification token from email"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Check your email for the verification token or click the link in the email
                </p>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isVerifying}>
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>
          </form>
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email?
            </p>
            <Button 
              onClick={handleResendVerification}
              disabled={isResending || !email}
              variant="outline"
              size="sm"
            >
              {isResending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend Verification Email"
              )}
            </Button>
            {!email && (
              <p className="text-xs text-muted-foreground mt-2">
                Enter your email above to resend
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
          <Card className="w-full max-w-md">
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}


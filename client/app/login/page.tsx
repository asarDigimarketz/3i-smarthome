"use client"

import { useState, useEffect } from "react"
import { Mail, Lock, Eye, EyeOff, Smartphone, Shield, Wifi } from "lucide-react"
import { addToast } from "@heroui/toast"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { IconBrandGoogle } from "@tabler/icons-react"
import { resendVerificationEmail } from "../../lib/auth"
import { Button } from "@heroui/button"
import { Input } from "@heroui/input"
import { getGeneralDetails } from "@/lib/GeneralDetails"
import Image from "next/image"

const LoadingOverlay = ({ smartHomeLogo }: { smartHomeLogo: string | null }) => (
  <div className="fixed inset-0 backdrop-blur-xl bg-gradient-to-br from-slate-900/95 via-red-900/90 to-red-800/95 flex flex-col items-center justify-center z-50">
    <div className="relative w-40 h-40 mb-8">
      {/* Animated tech rings */}
      <div className="absolute inset-0 border-2 border-red-400/60 rounded-full animate-pulse"></div>
      <div className="absolute inset-4 border-2 border-red-500/40 rounded-full animate-spin-slow"></div>
      <div className="absolute inset-8 border-2 border-red-600/30 rounded-full animate-spin-reverse"></div>
      
      {/* Glowing center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-500 rounded-full animate-pulse flex items-center justify-center">
          {smartHomeLogo ? (
            <div className="relative w-10 h-10">
              <Image
                src={smartHomeLogo}
                alt="3i Smart Home Logo"
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <Smartphone className="w-8 h-8 text-white" />
          )}
        </div>
      </div>
    </div>

    <h3 className="text-3xl font-bold text-white mb-3 animate-fade-in bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
      Welcome to 3i Smart Home
    </h3>
    <p className="text-gray-300 text-center max-w-md animate-fade-in-delay text-lg">
      Connecting you to your intelligent home ecosystem...
    </p>

    <div className="w-80 h-2 bg-slate-800/50 rounded-full mt-8 overflow-hidden backdrop-blur-sm">
      <div className="h-full bg-gradient-to-r from-red-500 via-red-600 to-red-700 rounded-full animate-progress-infinite"></div>
    </div>
  </div>
);

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [smartHomeLogo, setSmartHomeLogo] = useState<string | null>(null)

  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setRedirecting(true)
      let redirectUrl = "/dashboard"
      if (session.user.isEmployee) {
        const permissions = session.user.permissions || []
        const firstAccessiblePage = permissions.find(p => p.actions.view)
        if (firstAccessiblePage?.url) {
          redirectUrl = firstAccessiblePage.url
        }
      }

      setTimeout(() => {
        router.replace(redirectUrl)
      }, 1000)
    }
  }, [session, status, router])

  useEffect(() => {
    async function fetchSmartHomeDetails() {
      const generalData = await getGeneralDetails()
      if (generalData?.logo) {
        setSmartHomeLogo(generalData.logo)
      }
    }
    fetchSmartHomeDetails()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      localStorage.clear()
      sessionStorage.clear()

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl: "/dashboard"
      })

      if (result?.error) {
        if (result.error === "Email not verified. Please verify your email before logging in.") {
          addToast({
            title: "Email Not Verified",
            description: "Your email is not verified. Would you like to resend the verification email?",
            color: "danger",
            endContent: (
              <Button 
                variant="bordered" 
                size="sm" 
                onPress={() => handleResendVerification(email)}
                className="bg-white hover:bg-gray-100 text-black border-white hover:border-gray-100"
              >
                Resend
              </Button>
            ),
          })
        } else {
          addToast({
            title: "Error",
            description: result.error,
            color: "danger",
          })
        }
      } else if (result?.url) {
        setRedirecting(true)
        router.push(result.url)
      }
    } catch {
      addToast({
        title: "Error",
        description: "An unexpected error occurred",
        color: "danger",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleResendVerification(email: string) {
    try {
      const resendResult = await resendVerificationEmail(email)
      if (resendResult.success) {
        addToast({
          title: "Verification Email Sent",
          description: resendResult.message || "Please check your inbox and verify your email to login.",
          color: "success",
        })
      } else {
        addToast({
          title: "Error",
          description: resendResult.error || "Failed to resend verification email. Please try again later.",
          color: "danger",
        })
      }
    } catch {
      addToast({
        title: "Error",
        description: "An unexpected error occurred while resending the verification email.",
        color: "danger",
      })
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signIn("google", {
        redirect: true,
        callbackUrl: "/auth/redirect"
      })
    } catch {
      addToast({
        title: "Error",
        description: "An error occurred during Google sign-in",
        color: "danger"
      })
      setLoading(false)
      setRedirecting(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-red-800">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-red-400/30 rounded-full animate-spin border-t-red-400"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-red-500/30 rounded-full animate-spin-reverse border-t-red-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-red-800 relative overflow-hidden">
      {redirecting && <LoadingOverlay smartHomeLogo={smartHomeLogo} />}
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Left Section - Smart Home Features */}
      <div className="relative hidden w-1/2 p-8 lg:flex flex-col justify-center">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-12">
            {smartHomeLogo && (
              <div className="mb-8 flex justify-center">
                <div className="relative w-24 h-24 bg-gradient-to-br from-red-400/20 to-red-500/20 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                  <Image
                    src={smartHomeLogo}
                    alt="3i Smart Home Logo"
                    fill
                    className="object-contain p-2"
                  />
                </div>
              </div>
            )}
            <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
              3i Smart Home
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Your Intelligent Home Ecosystem
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                icon: <Smartphone className="w-6 h-6" />,
                title: "Smart Control",
                description: "Control all your devices from anywhere",
                gradient: "from-red-500 to-red-600"
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Advanced Security",
                description: "Protect your home with intelligent monitoring",
                gradient: "from-red-600 to-red-700"
              },
              {
                icon: <Wifi className="w-6 h-6" />,
                title: "Connected Living",
                description: "Seamless integration across all devices",
                gradient: "from-red-700 to-red-800"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white shadow-lg`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-gray-300 text-sm">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2 relative">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
            {/* Mobile logo */}
            {smartHomeLogo && (
              <div className="mb-8 flex justify-center lg:hidden">
                <div className="relative w-20 h-20 bg-gradient-to-br from-red-400/20 to-red-500/20 rounded-2xl p-3 backdrop-blur-sm border border-white/10">
                  <Image
                    src={smartHomeLogo}
                    alt="3i Smart Home Logo"
                    fill
                    className="object-contain p-1"
                  />
                </div>
              </div>
            )}

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-gray-300">Access your smart home dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Email Address   
              </label>
                <div className="relative">
                  <Input
                   
                    placeholder="Enter your email"
                    type="email"
                    variant="bordered"
                    radius="lg"
                    size="lg"
                    startContent={<Mail className="text-red-400" />}
                    isRequired
                    
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    classNames={{
                      inputWrapper: "bg-transparent border-red-400/40 focus:border-red-500 h-[50px]",
                      input: "text-white placeholder:text-red-100",
                    }}
                    className="mb-4 text-white placeholder:text-red-100"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
               <label className="text-sm font-medium text-gray-200">
                  Password
                </label>
                <div className="relative">
                  <Input
                   
                    placeholder="Enter your password"
                    type={showPassword ? "text" : "password"}
                    variant="bordered"
                    radius="lg"
                    size="lg"
                    startContent={<Lock className="text-red-400" />}
                    endContent={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-red-400 hover:text-white focus:outline-none focus:text-white transition-colors p-1 rounded-full hover:bg-red-400/20"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    }
                    isRequired
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    classNames={{
                      inputWrapper: "bg-transparent border-red-400/40 focus:border-red-500 h-[50px]",
                      input: "text-white placeholder:text-red-100",
                    }}
                    className="mb-4"
                  />
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex items-center justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-red-400 hover:text-red-300 
                    transition-colors hover:underline decoration-2 underline-offset-4"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="h-12 w-full bg-gradient-to-r from-red-500 to-red-600 
                  hover:from-red-600 hover:to-red-700 text-white font-semibold 
                  rounded-xl shadow-lg hover:shadow-red-500/25 transition-all 
                  duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-0"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Signing in...
                  </div>
                ) : (
                  "Sign in to Smart Home"
                )}
              </Button>

              {/* Separator */}
              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-transparent px-4 text-gray-400 text-sm">or continue with</span>
                </div>
              </div>

              {/* Google Sign In */}
              <Button
                type="button"
                variant="bordered"
                onPress={handleGoogleSignIn}
                disabled={loading}
                className="h-12 w-full border border-white/20 bg-white/5 backdrop-blur-sm
                  hover:bg-white/10 transition-all duration-200 rounded-xl group"
              >
                <div className="flex items-center gap-3 text-white">
                  <div className="bg-white p-2 rounded-lg">
                    <IconBrandGoogle className="h-5 w-5 text-black" />
                  </div>
                  <span className="font-medium">Continue with Google</span>
                </div>
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                Secured by advanced encryption and smart authentication
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
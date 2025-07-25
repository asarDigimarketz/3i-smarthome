"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { Input } from "@heroui/input"
import { Button } from "@heroui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { addToast } from "@heroui/toast"
import { CheckCircle, Lock, Eye, EyeOff, Shield, User } from "lucide-react"
import Link from "next/link"
import { validatePassword } from "../../utils/passwordValidation"
import { getGeneralDetails } from "@/lib/GeneralDetails"
import Image from "next/image"

const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
  <div className="flex items-center gap-1.5">
    <div className={`h-1.5 w-1.5 rounded-full transition-colors duration-200 ${met ? "bg-green-400" : "bg-red-400"}`} />
    <span className={`transition-colors duration-200 ${met ? "text-green-400" : "text-red-400"}`}>{text}</span>
  </div>
)

const LoadingOverlay = ({ hotelLogo }: { hotelLogo: string | null }) => (
  <div className="fixed inset-0 backdrop-blur-xl bg-gradient-to-br from-slate-900/95 via-blue-900/90 to-purple-900/95 flex flex-col items-center justify-center z-50">
    <div className="relative w-40 h-40 mb-8">
      {/* Animated tech rings */}
      <div className="absolute inset-0 border-2 border-blue-400/60 rounded-full animate-pulse"></div>
      <div className="absolute inset-4 border-2 border-purple-400/40 rounded-full animate-spin-slow"></div>
      <div className="absolute inset-8 border-2 border-cyan-400/30 rounded-full animate-spin-reverse"></div>

      {/* Glowing center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full animate-pulse flex items-center justify-center">
          {hotelLogo ? (
            <div className="relative w-10 h-10">
              <Image src={hotelLogo || "/placeholder.svg"} alt="Hotel Logo" fill className="object-contain" />
            </div>
          ) : (
            <Lock className="w-8 h-8 text-white" />
          )}
        </div>
      </div>
    </div>

    <h3 className="text-3xl font-bold text-white mb-3 animate-fade-in bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
      Resetting Password
    </h3>
    <p className="text-gray-300 text-center max-w-md animate-fade-in-delay text-lg">
      Securing your account with new credentials...
    </p>

    <div className="w-80 h-2 bg-slate-800/50 rounded-full mt-8 overflow-hidden backdrop-blur-sm">
      <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full animate-progress-infinite"></div>
    </div>
  </div>
)

const ResetPasswordContent = () => {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [hotelLogo, setHotelLogo] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      addToast({
        title: "Error",
        description: "Invalid reset link. Please request a new one.",
        color: "danger",
      })
      router.push("/forgot-password")
    }
  }, [token, router])

  useEffect(() => {
    async function fetchHotelDetails() {
      const generalData = await getGeneralDetails()
      if (generalData?.logo) {
        setHotelLogo(generalData.logo)
      }
    }
    fetchHotelDetails()
  }, [])

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    const { errors } = validatePassword(newPassword)
    setPasswordErrors(errors)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { isValid } = validatePassword(password)
    if (!isValid) {
      addToast({
        title: "Invalid Password",
        description: "Please ensure your password meets all requirements",
        color: "danger",
      })
      return
    }

    if (password !== confirmPassword) {
      addToast({
        title: "Error",
        description: "Passwords do not match.",
        color: "danger",
      })
      return
    }
    setLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      })

      const data = await response.json()
      if (response.ok) {
        setIsSubmitted(true)
        addToast({
          title: "Success",
          description: "Your password has been reset successfully.",
          color: "success",
        })
        setTimeout(() => router.push("/login"), 3000)
      } else {
        addToast({
          title: "Error",
          description: data.error || "An error occurred. Please try again.",
          color: "danger",
        })
      }
    } catch {
      addToast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        color: "danger",
      })
    }
    setLoading(false)
  }

  if (!token) return null

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="flex w-full items-center justify-center p-6 relative z-10">
          <div className="w-full max-w-md">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl text-center">
              <div className="mb-8 mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-white">Password Reset Successful</h2>
              <p className="mb-8 text-gray-300">
                Your password has been reset successfully. You will be redirected to the login page shortly.
              </p>
              <Link
                href="/login"
                className="inline-block h-12 px-8 bg-gradient-to-r from-blue-500 to-purple-600 
                  hover:from-blue-600 hover:to-purple-700 text-white font-semibold 
                  rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all 
                  duration-200 flex items-center justify-center"
              >
                Return to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {loading && <LoadingOverlay hotelLogo={hotelLogo} />}

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Left Section - Password Reset Features */}
      <div className="relative hidden w-1/2 p-8 lg:flex flex-col justify-center">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-12">
            {hotelLogo && (
              <div className="mb-8 flex justify-center">
                <div className="relative w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                  <Image src={hotelLogo || "/placeholder.svg"} alt="Hotel Logo" fill className="object-contain p-2" />
                </div>
              </div>
            )}
            <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Hotel Management
            </h1>
            <p className="text-xl text-gray-300 mb-8">Secure Your Account</p>
          </div>

          <div className="space-y-6">
            {[
              {
                icon: <Lock className="w-6 h-6" />,
                title: "New Password",
                description: "Create a strong, secure password",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Enhanced Security",
                description: "Advanced password validation",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: <User className="w-6 h-6" />,
                title: "Account Access",
                description: "Regain access to your dashboard",
                gradient: "from-green-500 to-emerald-500",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white shadow-lg`}
                  >
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

      {/* Right Section - Reset Password Form */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2 relative">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
            {/* Mobile logo */}
            {hotelLogo && (
              <div className="mb-8 flex justify-center lg:hidden">
                <div className="relative w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-2xl p-3 backdrop-blur-sm border border-white/10">
                  <Image src={hotelLogo || "/placeholder.svg"} alt="Hotel Logo" fill className="object-contain p-1" />
                </div>
              </div>
            )}

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
              <p className="text-gray-300">Enter your new password below to reset your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">New Password</label>
                <div className="relative">
                  <Input
                    placeholder="Enter new password"
                    type={showPassword ? "text" : "password"}
                    variant="bordered"
                    radius="lg"
                    size="lg"
                    startContent={<Lock className="text-blue-400" />}
                    endContent={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-blue-400 hover:text-white focus:outline-none focus:text-white transition-colors p-1 rounded-full hover:bg-blue-400/20"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    }
                    isRequired
                    value={password}
                    onChange={handlePasswordChange}
                    classNames={{
                      inputWrapper: `bg-transparent ${
                        passwordErrors.length > 0 ? "border-red-500/40" : "border-blue-400/40"
                      } focus:border-blue-500 h-[50px]`,
                      input: "text-white placeholder:text-blue-100",
                    }}
                    className="mb-4"
                  />
                </div>

                {/* Password Requirements List */}
                <div className="mt-2">
                  {password && (
                    <div className="text-xs space-y-1.5">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <RequirementItem met={password.length >= 8} text="8+ characters" />
                        <RequirementItem met={/[A-Z]/.test(password)} text="Uppercase letter" />
                        <RequirementItem met={/[a-z]/.test(password)} text="Lowercase letter" />
                        <RequirementItem met={/\d/.test(password)} text="Number" />
                        <RequirementItem met={/[@$!%*?&]/.test(password)} text="Special character" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Confirm Password</label>
                <div className="relative">
                  <Input
                    placeholder="Confirm new password"
                    type={showConfirmPassword ? "text" : "password"}
                    variant="bordered"
                    radius="lg"
                    size="lg"
                    startContent={<Lock className="text-blue-400" />}
                    endContent={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-blue-400 hover:text-white focus:outline-none focus:text-white transition-colors p-1 rounded-full hover:bg-blue-400/20"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    }
                    isRequired
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    classNames={{
                      inputWrapper: "bg-transparent border-blue-400/40 focus:border-blue-500 h-[50px]",
                      input: "text-white placeholder:text-blue-100",
                    }}
                    className="mb-4"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="h-12 w-full bg-gradient-to-r from-blue-500 to-purple-600 
                  hover:from-blue-600 hover:to-purple-700 text-white font-semibold 
                  rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all 
                  duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-0"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Resetting Password...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </Button>

              <div className="mt-8 text-center">
                <p className="text-gray-400 text-sm mb-4">
                  Remember your password?{" "}
                  <Link
                    href="/login"
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors hover:underline decoration-2 underline-offset-4"
                  >
                    Back to Login
                  </Link>
                </p>
                <p className="text-gray-400 text-xs">Secured by advanced encryption</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

// Update the loading state to match the theme
export default function ResetPassword() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-400/30 rounded-full animate-spin border-t-blue-400"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-purple-400/30 rounded-full animate-spin-reverse border-t-purple-400"></div>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}

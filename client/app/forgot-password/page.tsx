"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@heroui/input"
import { Button } from "@heroui/button"
import { addToast } from "@heroui/toast"
import { CheckCircle, Mail, Shield, Lock } from "lucide-react"
import Link from "next/link"
import { getGeneralDetails } from "../../lib/GeneralDetails"
import Image from "next/image"

const LoadingOverlay = ({ hotelLogo }: { hotelLogo: string | null }) => (
  <div className="fixed inset-0 backdrop-blur-xl bg-gradient-to-br from-slate-900/95 via-red-900/90 to-red-800/95 flex flex-col items-center justify-center z-50">
    <div className="relative w-40 h-40 mb-8">
      {/* Animated tech rings */}
      <div className="absolute inset-0 border-2 border-red-400/60 rounded-full animate-pulse"></div>
      <div className="absolute inset-4 border-2 border-red-500/40 rounded-full animate-spin-slow"></div>
      <div className="absolute inset-8 border-2 border-red-600/30 rounded-full animate-spin-reverse"></div>

      {/* Glowing center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-500 rounded-full animate-pulse flex items-center justify-center">
          {hotelLogo ? (
            <div className="relative w-10 h-10">
              <Image src={hotelLogo || "/placeholder.svg"} alt="Hotel Logo" fill className="object-contain" />
            </div>
          ) : (
            <Mail className="w-8 h-8 text-white" />
          )}
        </div>
      </div>
    </div>

    <h3 className="text-3xl font-bold text-white mb-3 animate-fade-in bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
      Sending Reset Link
    </h3>
    <p className="text-gray-300 text-center max-w-md animate-fade-in-delay text-lg">
      Processing your password reset request...
    </p>

    <div className="w-80 h-2 bg-slate-800/50 rounded-full mt-8 overflow-hidden backdrop-blur-sm">
      <div className="h-full bg-gradient-to-r from-red-500 via-red-600 to-red-700 rounded-full animate-progress-infinite"></div>
    </div>
  </div>
)

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [hotelLogo, setHotelLogo] = useState<string | null>(null)

  useEffect(() => {
    async function fetchHotelDetails() {
      const generalData = await getGeneralDetails()
      if (generalData?.logo) {
        setHotelLogo(generalData.logo)
      }
    }
    fetchHotelDetails()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      if (response.ok) {
        setIsSubmitted(true)
        addToast({
          title: "Success",
          description: "Password reset email sent. Please check your inbox.",
          color: "success",
        })
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

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-red-800 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="flex w-full items-center justify-center p-6 relative z-10">
          <div className="w-full max-w-md">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-red-500/20 shadow-2xl text-center">
              <div className="mb-8 mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-500 shadow-lg">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-white">Check Your Email</h2>
              <p className="mb-8 text-gray-300">
                We&apos;ve sent a password reset link to your email address. Please check your inbox and follow the
                instructions.
              </p>
              <Link
                href="/login"
                className="inline-block h-12 px-8 bg-gradient-to-r from-red-500 to-red-600 
                  hover:from-red-600 hover:to-red-700 text-white font-semibold 
                  rounded-xl shadow-lg hover:shadow-red-500/25 transition-all 
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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-red-800 relative overflow-hidden">
      {loading && <LoadingOverlay hotelLogo={hotelLogo} />}

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Left Section - Password Recovery Features */}
      <div className="relative hidden w-1/2 p-8 lg:flex flex-col justify-center">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-12">
            {hotelLogo && (
              <div className="mb-8 flex justify-center">
                <div className="relative w-24 h-24 bg-gradient-to-br from-red-400/20 to-red-500/20 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                  <Image src={hotelLogo || "/placeholder.svg"} alt="Hotel Logo" fill className="object-contain p-2" />
                </div>
              </div>
            )}
            <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
              Hotel Management
            </h1>
            <p className="text-xl text-gray-300 mb-8">Password Recovery Made Simple</p>
          </div>

          <div className="space-y-6">
            {[
              {
                icon: <Mail className="w-6 h-6" />,
                title: "Enter Email",
                description: "Provide your registered email address",
                gradient: "from-red-500 to-red-600",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Secure Link",
                description: "Receive a secure password reset link",
                gradient: "from-red-600 to-red-700",
              },
              {
                icon: <Lock className="w-6 h-6" />,
                title: "Reset Password",
                description: "Create a new secure password",
                gradient: "from-red-700 to-red-800",
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

      {/* Right Section - Forgot Password Form */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2 relative">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
            {/* Mobile logo */}
            {hotelLogo && (
              <div className="mb-8 flex justify-center lg:hidden">
                <div className="relative w-20 h-20 bg-gradient-to-br from-red-400/20 to-red-500/20 rounded-2xl p-3 backdrop-blur-sm border border-white/10">
                  <Image src={hotelLogo || "/placeholder.svg"} alt="Hotel Logo" fill className="object-contain p-1" />
                </div>
              </div>
            )}

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
              <p className="text-gray-300">Enter your email to receive a password reset link</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Email Address</label>
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
                    Sending...
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </Button>

              <div className="mt-8 text-center">
                <p className="text-gray-400 text-sm mb-4">
                  Remember your password?{" "}
                  <Link
                    href="/login"
                    className="text-red-400 hover:text-red-300 font-medium transition-colors hover:underline decoration-2 underline-offset-4"
                  >
                    Back to Login
                  </Link>
                </p>
                <p className="text-gray-400 text-xs">Secure password recovery system</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

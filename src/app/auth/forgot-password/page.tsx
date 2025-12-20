'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ForgotPasswordFormData, string>>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setSuccess(false)

    // Validate form
    const result = forgotPasswordSchema.safeParse(formData)
    if (!result.success) {
      const errors: Partial<Record<keyof ForgotPasswordFormData, string>> = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ForgotPasswordFormData
        errors[field] = issue.message
      })
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (resetError) {
        setError(resetError.message)
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('Erro ao enviar email de recuperação. Tente novamente.')
      console.error('Password reset error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ email: e.target.value })
    // Clear field error when user starts typing
    if (fieldErrors.email) {
      setFieldErrors({})
    }
  }

  if (success) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
            <svg
              className="h-6 w-6 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Email enviado!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Enviamos um link de recuperação para <strong>{formData.email}</strong>.
            Verifique sua caixa de entrada e spam.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Voltar para login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Esqueceu sua senha?
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Digite seu email para receber um link de recuperação
        </p>
      </div>

      {/* Error message */}
      {error && (
        <Alert className="mb-4 border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Forgot Password Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              fieldErrors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="seu@email.com"
            disabled={isLoading}
            autoComplete="email"
          />
          {fieldErrors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Enviando...' : 'Enviar link de recuperação'}
        </Button>
      </form>

      {/* Back to Login Link */}
      <div className="mt-6 text-center">
        <Link
          href="/auth/login"
          className="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          ← Voltar para login
        </Link>
      </div>
    </div>
  )
}

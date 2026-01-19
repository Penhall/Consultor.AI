'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginFormProps {
  redirectTo?: string
  onSuccess?: () => void
}

export function LoginForm({ redirectTo = '/dashboard', onSuccess }: LoginFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<LoginFormData>({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({})

  const message = searchParams.get('message')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    const parsed = loginSchema.safeParse(formData)
    if (!parsed.success) {
      const nextErrors: Partial<Record<keyof LoginFormData, string>> = {}
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof LoginFormData
        nextErrors[field] = issue.message
      })
      setFieldErrors(nextErrors)
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword(formData)

      if (signInError) {
        setError(
          signInError.message.includes('Invalid login credentials')
            ? 'Email ou senha incorretos'
            : signInError.message
        )
        return
      }

      if (onSuccess) {
        onSuccess()
      }

      router.push(redirectTo)
      router.refresh()
    } catch (err) {
      console.error('Login error:', err)
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange =
    (field: keyof LoginFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))
      if (fieldErrors[field]) {
        setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Bem-vindo de volta!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Entre com sua conta para continuar
        </p>
      </div>

      {message && (
        <Alert className="mb-4 border-green-200 bg-green-50 dark:bg-green-900/20">
          <AlertDescription className="text-green-800 dark:text-green-200">
            {message}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="mb-4 border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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
            onChange={handleChange('email')}
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

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Senha
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleChange('password')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              fieldErrors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="********"
            disabled={isLoading}
            autoComplete="current-password"
          />
          {fieldErrors.password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Esqueceu sua senha?
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Não tem uma conta?{' '}
          <Link
            href="/auth/register"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Cadastre-se grátis
          </Link>
        </p>
      </div>
    </div>
  )
}

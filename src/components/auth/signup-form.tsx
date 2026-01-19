'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { Database } from '@/types/database'

const registerSchema = z
  .object({
    name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    email: z.string().email('Email inválido'),
    whatsappNumber: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, 'Número de WhatsApp inválido (use formato internacional: +5511999999999)'),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export function SignupForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    whatsappNumber: '',
    password: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    const parsed = registerSchema.safeParse(formData)
    if (!parsed.success) {
      const nextErrors: Partial<Record<keyof RegisterFormData, string>> = {}
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof RegisterFormData
        nextErrors[field] = issue.message
      })
      setFieldErrors(nextErrors)
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            whatsapp_number: formData.whatsappNumber,
          },
        },
      })

      if (signUpError) {
        setError(
          signUpError.message.includes('already registered')
            ? 'Este email já está cadastrado'
            : signUpError.message
        )
        return
      }

      if (!authData.user) {
        setError('Erro ao criar usuário')
        return
      }

      const slug = (formData.email.split('@')[0] || 'user')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')

      const consultantData: Database['public']['Tables']['consultants']['Insert'] = {
        user_id: authData.user.id,
        email: formData.email,
        name: formData.name,
        whatsapp_number: formData.whatsappNumber,
        slug,
        vertical: 'saude',
        subscription_tier: 'freemium',
        monthly_lead_limit: 20,
      }

      const { error: consultantError } = await supabase
        .from('consultants')
        .insert(consultantData as any)

      if (consultantError) {
        console.error('Error creating consultant:', consultantError)
      }

      router.push('/auth/login?message=Conta criada com sucesso! Faça login para continuar.')
    } catch (err) {
      console.error('Registration error:', err)
      setError('Erro ao criar conta. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange =
    (field: keyof RegisterFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))
      if (fieldErrors[field]) {
        setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Crie sua conta
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comece grátis e automatize suas vendas
        </p>
      </div>

      {error && (
        <Alert className="mb-4 border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Nome completo
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={handleChange('name')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              fieldErrors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="João Silva"
            disabled={isLoading}
            autoComplete="name"
          />
          {fieldErrors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {fieldErrors.name}
            </p>
          )}
        </div>

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
            htmlFor="whatsappNumber"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            WhatsApp
          </label>
          <input
            id="whatsappNumber"
            type="tel"
            value={formData.whatsappNumber}
            onChange={handleChange('whatsappNumber')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              fieldErrors.whatsappNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="+5511999999999"
            disabled={isLoading}
            autoComplete="tel"
          />
          {fieldErrors.whatsappNumber && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {fieldErrors.whatsappNumber}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Use o formato internacional com código do país
          </p>
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
            autoComplete="new-password"
          />
          {fieldErrors.password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Confirmar senha
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="********"
            disabled={isLoading}
            autoComplete="new-password"
          />
          {fieldErrors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full mt-6" disabled={isLoading}>
          {isLoading ? 'Criando conta...' : 'Criar conta grátis'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Já tem uma conta?{' '}
          <Link
            href="/auth/login"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Faça login
          </Link>
        </p>
      </div>
    </div>
  )
}

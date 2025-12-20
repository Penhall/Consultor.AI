'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { z } from 'zod'
import type { Database } from '@/types/database'

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  whatsappNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Número de WhatsApp inválido (use formato internacional: +5511999999999)'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
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

    // Validate form
    const result = registerSchema.safeParse(formData)
    if (!result.success) {
      const errors: Partial<Record<keyof RegisterFormData, string>> = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof RegisterFormData
        errors[field] = issue.message
      })
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      // 1. Create auth user
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
        if (signUpError.message.includes('already registered')) {
          setError('Este email já está cadastrado')
        } else {
          setError(signUpError.message)
        }
        return
      }

      if (!authData.user) {
        setError('Erro ao criar usuário')
        return
      }

      // 2. Create consultant profile
      const slug = (formData.email.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9]/g, '-')

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
        // Don't show error to user since auth account was created successfully
        // They can complete profile later
      }

      // Redirect to login with success message
      router.push('/auth/login?message=Conta criada com sucesso! Faça login para continuar.')
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.')
      console.error('Registration error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof RegisterFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Crie sua conta
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comece grátis e automatize suas vendas
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

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
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

        {/* WhatsApp Field */}
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

        {/* Password Field */}
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
            placeholder="••••••••"
            disabled={isLoading}
            autoComplete="new-password"
          />
          {fieldErrors.password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {fieldErrors.password}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
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
            placeholder="••••••••"
            disabled={isLoading}
            autoComplete="new-password"
          />
          {fieldErrors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full mt-6"
          disabled={isLoading}
        >
          {isLoading ? 'Criando conta...' : 'Criar conta grátis'}
        </Button>
      </form>

      {/* Login Link */}
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

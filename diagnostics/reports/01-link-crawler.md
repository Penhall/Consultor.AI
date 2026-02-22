# Diagnóstico de Navegação - Consultor.AI

**Data**: 2026-02-22 08:09:04
**Ambiente**: Docker Full-Stack
**Roles testados**: admin, consultant

## Resumo

| Categoria                | admin | consultant | Total |
| ------------------------ | ----- | ---------- | ----- |
| Funcionando              | 10    | 12         | 22    |
| Quebrado                 | 2     | 2          | 4     |
| Placeholder              | 0     | 0          | 0     |
| Acesso Negado Inesperado | 37    | 35         | 72    |
| **Total**                | 49    | 49         | 98    |

## Funcionando

| Rota                  | Método | Status | Tempo (ms) | Role       | Notas                                              |
| --------------------- | ------ | ------ | ---------- | ---------- | -------------------------------------------------- |
| /                     | GET    | 200    | 9966       | admin      | OK                                                 |
| /login                | GET    | 200    | 315        | admin      | OK                                                 |
| /auth/login           | GET    | 200    | 591        | admin      | OK                                                 |
| /auth/register        | GET    | 200    | 281        | admin      | OK                                                 |
| /auth/forgot-password | GET    | 200    | 275        | admin      | OK                                                 |
| /auth/reset-password  | GET    | 200    | 285        | admin      | OK                                                 |
| /cadastro             | GET    | 200    | 176        | admin      | OK                                                 |
| /checkout             | GET    | 200    | 199        | admin      | OK                                                 |
| /pricing              | GET    | 200    | 289        | admin      | OK                                                 |
| /api/health           | GET    | 200    | 17         | admin      | OK                                                 |
| /                     | GET    | 200    | 175        | consultant | OK                                                 |
| /login                | GET    | 200    | 120        | consultant | OK                                                 |
| /auth/login           | GET    | 200    | 120        | consultant | OK                                                 |
| /auth/register        | GET    | 200    | 115        | consultant | OK                                                 |
| /auth/forgot-password | GET    | 200    | 147        | consultant | OK                                                 |
| /auth/reset-password  | GET    | 200    | 140        | consultant | OK                                                 |
| /cadastro             | GET    | 200    | 99         | consultant | OK                                                 |
| /checkout             | GET    | 200    | 108        | consultant | OK                                                 |
| /pricing              | GET    | 200    | 105        | consultant | OK                                                 |
| /api/admin/stats      | GET    | 401    | 63         | consultant | Expected 401/403 for non-admin on admin-only route |
| /api/admin/users      | GET    | 401    | 71         | consultant | Expected 401/403 for non-admin on admin-only route |
| /api/health           | GET    | 200    | 43         | consultant | OK                                                 |

## Quebrado

| Rota                       | Método | Status | Tempo (ms) | Role       | Notas                                    |
| -------------------------- | ------ | ------ | ---------- | ---------- | ---------------------------------------- |
| /api/files/[id]            | GET    | 0      | 0          | admin      | Skipped: no seed data for dynamic params |
| /api/integrations/crm/[id] | GET    | 0      | 0          | admin      | Skipped: no seed data for dynamic params |
| /api/files/[id]            | GET    | 0      | 0          | consultant | Skipped: no seed data for dynamic params |
| /api/integrations/crm/[id] | GET    | 0      | 0          | consultant | Skipped: no seed data for dynamic params |

## Placeholder

_Nenhuma rota nesta categoria._

## Acesso Negado Inesperado

| Rota                                                          | Método | Status | Tempo (ms) | Role       | Notas                                                                            |
| ------------------------------------------------------------- | ------ | ------ | ---------- | ---------- | -------------------------------------------------------------------------------- |
| /dashboard                                                    | GET    | 307    | 159        | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /dashboard/leads                                              | GET    | 307    | 111        | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /dashboard/leads/26984c46-b98c-4e01-bc96-0bd2d8067829         | GET    | 307    | 55         | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /dashboard/flows                                              | GET    | 307    | 54         | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /dashboard/flows/new                                          | GET    | 307    | 48         | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /dashboard/flows/b74fd926-e6c4-47b0-a8b5-86a22c793eb6         | GET    | 307    | 58         | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /dashboard/fluxos                                             | GET    | 307    | 52         | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /dashboard/analytics                                          | GET    | 307    | 55         | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /dashboard/arquivos                                           | GET    | 307    | 52         | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /dashboard/conversas                                          | GET    | 307    | 70         | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /dashboard/integracoes                                        | GET    | 307    | 47         | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /dashboard/templates                                          | GET    | 307    | 55         | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /dashboard/perfil                                             | GET    | 307    | 46         | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /dashboard/perfil/whatsapp                                    | GET    | 307    | 52         | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /dashboard/test/whatsapp-simulator                            | GET    | 307    | 46         | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /admin                                                        | GET    | 307    | 52         | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /admin/users                                                  | GET    | 307    | 48         | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /api/admin/stats                                              | GET    | 401    | 317        | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/admin/users                                              | GET    | 401    | 191        | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/analytics/overview                                       | GET    | 401    | 195        | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/analytics/charts                                         | GET    | 401    | 176        | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/analytics/activity                                       | GET    | 401    | 167        | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/billing/credits                                          | GET    | 401    | 736        | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/files                                                    | GET    | 401    | 190        | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/flows                                                    | GET    | 401    | 179        | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/flows/b74fd926-e6c4-47b0-a8b5-86a22c793eb6               | GET    | 401    | 1637       | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/follow-ups/bf8c5a32-176d-53d5-8cc4-4d4e23b7e6fc          | GET    | 401    | 1350       | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/integrations/crm                                         | GET    | 401    | 186        | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/integrations/crm/logs                                    | GET    | 401    | 155        | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/leads                                                    | GET    | 401    | 151        | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/leads/26984c46-b98c-4e01-bc96-0bd2d8067829               | GET    | 401    | 1357       | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/leads/stats                                              | GET    | 401    | 137        | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/leads/export                                             | GET    | 401    | 139        | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/leads/26984c46-b98c-4e01-bc96-0bd2d8067829/conversations | GET    | 401    | 1298       | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/leads/26984c46-b98c-4e01-bc96-0bd2d8067829/follow-ups    | GET    | 401    | 1350       | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/templates                                                | GET    | 401    | 303        | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/templates/ae1b0409-8867-5054-a87e-a5ae67df144b           | GET    | 401    | 1281       | admin      | Unexpected 401 - route should be accessible for admin                            |
| /dashboard                                                    | GET    | 307    | 66         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /dashboard/leads                                              | GET    | 307    | 48         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /dashboard/leads/26984c46-b98c-4e01-bc96-0bd2d8067829         | GET    | 307    | 43         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /dashboard/flows                                              | GET    | 307    | 66         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /dashboard/flows/new                                          | GET    | 307    | 48         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /dashboard/flows/b74fd926-e6c4-47b0-a8b5-86a22c793eb6         | GET    | 307    | 49         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /dashboard/fluxos                                             | GET    | 307    | 43         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /dashboard/analytics                                          | GET    | 307    | 72         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /dashboard/arquivos                                           | GET    | 307    | 54         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /dashboard/conversas                                          | GET    | 307    | 58         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /dashboard/integracoes                                        | GET    | 307    | 46         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /dashboard/templates                                          | GET    | 307    | 50         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /dashboard/perfil                                             | GET    | 307    | 46         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /dashboard/perfil/whatsapp                                    | GET    | 307    | 49         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /dashboard/test/whatsapp-simulator                            | GET    | 307    | 45         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /admin                                                        | GET    | 307    | 57         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /admin/users                                                  | GET    | 307    | 50         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /api/analytics/overview                                       | GET    | 401    | 75         | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/analytics/charts                                         | GET    | 401    | 72         | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/analytics/activity                                       | GET    | 401    | 58         | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/billing/credits                                          | GET    | 401    | 94         | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/files                                                    | GET    | 401    | 88         | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/flows                                                    | GET    | 401    | 62         | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/flows/b74fd926-e6c4-47b0-a8b5-86a22c793eb6               | GET    | 401    | 201        | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/follow-ups/bf8c5a32-176d-53d5-8cc4-4d4e23b7e6fc          | GET    | 401    | 217        | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/integrations/crm                                         | GET    | 401    | 65         | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/integrations/crm/logs                                    | GET    | 401    | 63         | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/leads                                                    | GET    | 401    | 54         | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/leads/26984c46-b98c-4e01-bc96-0bd2d8067829               | GET    | 401    | 160        | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/leads/stats                                              | GET    | 401    | 60         | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/leads/export                                             | GET    | 401    | 79         | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/leads/26984c46-b98c-4e01-bc96-0bd2d8067829/conversations | GET    | 401    | 161        | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/leads/26984c46-b98c-4e01-bc96-0bd2d8067829/follow-ups    | GET    | 401    | 182        | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/templates                                                | GET    | 401    | 73         | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/templates/ae1b0409-8867-5054-a87e-a5ae67df144b           | GET    | 401    | 204        | consultant | Unexpected 401 - route should be accessible for consultant                       |

## Links Internos Quebrados

| Página Origem | Link Destino | Texto do Link           | Status | Role       |
| ------------- | ------------ | ----------------------- | ------ | ---------- |
| /             | /auth/signup | Começar Gratuitamente   | 404    | admin      |
| /             | /termos      | Termos de Uso           | 404    | admin      |
| /             | /privacidade | Política de Privacidade | 404    | admin      |
| /checkout     | /dashboard   | Voltar ao Dashboard     | 302    | admin      |
| /             | /auth/signup | Começar Gratuitamente   | 404    | consultant |
| /             | /termos      | Termos de Uso           | 404    | consultant |
| /             | /privacidade | Política de Privacidade | 404    | consultant |
| /checkout     | /dashboard   | Voltar ao Dashboard     | 302    | consultant |

## Rotas Não Testadas

| Rota                                    | Motivo                                        |
| --------------------------------------- | --------------------------------------------- |
| /api/billing/checkout                   | POST-only (creates Stripe checkout session)   |
| /api/billing/portal                     | POST-only (creates Stripe portal session)     |
| /api/billing/webhook                    | POST-only (Stripe webhook handler)            |
| /api/consultants/meta-signup            | POST-only (Meta signup flow)                  |
| /api/consultants/meta-callback          | GET but requires Meta OAuth state             |
| /api/consultants/[id]/integrations/meta | PUT-only (Meta integration config)            |
| /api/conversations/start                | POST-only (starts conversation)               |
| /api/conversations/[id]/message         | POST-only (sends message)                     |
| /api/contact                            | POST-only (contact form submission)           |
| /api/integrations/crm/[id]/test         | POST-only (test CRM connection)               |
| /api/integrations/crm/[id]/sync         | POST-only (trigger CRM sync)                  |
| /api/webhook/meta/[consultantId]        | POST/GET but requires Meta verification token |
| /api/webhook/mock                       | POST-only (mock webhook for testing)          |

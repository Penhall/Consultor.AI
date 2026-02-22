# Diagnóstico de Navegação - Consultor.AI

**Data**: 2026-02-22 02:09:23
**Ambiente**: Docker Full-Stack
**Roles testados**: admin, consultant

## Resumo

| Categoria                | admin | consultant | Total |
| ------------------------ | ----- | ---------- | ----- |
| Funcionando              | 9     | 12         | 21    |
| Quebrado                 | 3     | 2          | 5     |
| Placeholder              | 0     | 0          | 0     |
| Acesso Negado Inesperado | 37    | 35         | 72    |
| **Total**                | 49    | 49         | 98    |

## Funcionando

| Rota                  | Método | Status | Tempo (ms) | Role       | Notas                                              |
| --------------------- | ------ | ------ | ---------- | ---------- | -------------------------------------------------- |
| /login                | GET    | 200    | 1579       | admin      | OK                                                 |
| /auth/login           | GET    | 200    | 1956       | admin      | OK                                                 |
| /auth/register        | GET    | 200    | 1100       | admin      | OK                                                 |
| /auth/forgot-password | GET    | 200    | 991        | admin      | OK                                                 |
| /auth/reset-password  | GET    | 200    | 1297       | admin      | OK                                                 |
| /cadastro             | GET    | 200    | 953        | admin      | OK                                                 |
| /checkout             | GET    | 200    | 816        | admin      | OK                                                 |
| /pricing              | GET    | 200    | 990        | admin      | OK                                                 |
| /api/health           | GET    | 200    | 14         | admin      | OK                                                 |
| /                     | GET    | 200    | 165        | consultant | OK                                                 |
| /login                | GET    | 200    | 93         | consultant | OK                                                 |
| /auth/login           | GET    | 200    | 117        | consultant | OK                                                 |
| /auth/register        | GET    | 200    | 105        | consultant | OK                                                 |
| /auth/forgot-password | GET    | 200    | 107        | consultant | OK                                                 |
| /auth/reset-password  | GET    | 200    | 122        | consultant | OK                                                 |
| /cadastro             | GET    | 200    | 87         | consultant | OK                                                 |
| /checkout             | GET    | 200    | 135        | consultant | OK                                                 |
| /pricing              | GET    | 200    | 105        | consultant | OK                                                 |
| /api/admin/stats      | GET    | 401    | 73         | consultant | Expected 401/403 for non-admin on admin-only route |
| /api/admin/users      | GET    | 401    | 57         | consultant | Expected 401/403 for non-admin on admin-only route |
| /api/health           | GET    | 200    | 19         | consultant | OK                                                 |

## Quebrado

| Rota                       | Método | Status | Tempo (ms) | Role       | Notas                                    |
| -------------------------- | ------ | ------ | ---------- | ---------- | ---------------------------------------- |
| /                          | GET    | 0      | 10010      | admin      | Timeout after 10000ms [timeout]          |
| /api/files/[id]            | GET    | 0      | 0          | admin      | Skipped: no seed data for dynamic params |
| /api/integrations/crm/[id] | GET    | 0      | 0          | admin      | Skipped: no seed data for dynamic params |
| /api/files/[id]            | GET    | 0      | 0          | consultant | Skipped: no seed data for dynamic params |
| /api/integrations/crm/[id] | GET    | 0      | 0          | consultant | Skipped: no seed data for dynamic params |

## Placeholder

_Nenhuma rota nesta categoria._

## Acesso Negado Inesperado

| Rota                                                          | Método | Status | Tempo (ms) | Role       | Notas                                                                            |
| ------------------------------------------------------------- | ------ | ------ | ---------- | ---------- | -------------------------------------------------------------------------------- |
| /dashboard                                                    | GET    | 307    | 151        | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /dashboard/leads                                              | GET    | 307    | 164        | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /dashboard/leads/26984c46-b98c-4e01-bc96-0bd2d8067829         | GET    | 307    | 66         | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /dashboard/flows                                              | GET    | 307    | 54         | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /dashboard/flows/new                                          | GET    | 307    | 69         | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /dashboard/flows/b74fd926-e6c4-47b0-a8b5-86a22c793eb6         | GET    | 307    | 40         | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /dashboard/fluxos                                             | GET    | 307    | 52         | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /dashboard/analytics                                          | GET    | 307    | 42         | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /dashboard/arquivos                                           | GET    | 307    | 79         | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /dashboard/conversas                                          | GET    | 307    | 60         | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /dashboard/integracoes                                        | GET    | 307    | 73         | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /dashboard/templates                                          | GET    | 307    | 41         | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /dashboard/perfil                                             | GET    | 307    | 59         | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /dashboard/perfil/whatsapp                                    | GET    | 307    | 47         | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /dashboard/test/whatsapp-simulator                            | GET    | 307    | 72         | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /admin                                                        | GET    | 307    | 53         | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /admin/users                                                  | GET    | 307    | 114        | admin      | Redirected to login despite being authenticated as admin [redirect-to-login]     |
| /api/admin/stats                                              | GET    | 401    | 846        | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/admin/users                                              | GET    | 401    | 331        | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/analytics/overview                                       | GET    | 401    | 394        | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/analytics/charts                                         | GET    | 401    | 436        | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/analytics/activity                                       | GET    | 401    | 326        | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/billing/credits                                          | GET    | 401    | 2104       | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/files                                                    | GET    | 401    | 431        | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/flows                                                    | GET    | 401    | 601        | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/flows/b74fd926-e6c4-47b0-a8b5-86a22c793eb6               | GET    | 401    | 3365       | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/follow-ups/bf8c5a32-176d-53d5-8cc4-4d4e23b7e6fc          | GET    | 401    | 2359       | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/integrations/crm                                         | GET    | 401    | 418        | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/integrations/crm/logs                                    | GET    | 401    | 250        | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/leads                                                    | GET    | 401    | 363        | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/leads/26984c46-b98c-4e01-bc96-0bd2d8067829               | GET    | 401    | 2479       | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/leads/stats                                              | GET    | 401    | 400        | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/leads/export                                             | GET    | 401    | 294        | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/leads/26984c46-b98c-4e01-bc96-0bd2d8067829/conversations | GET    | 401    | 1512       | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/leads/26984c46-b98c-4e01-bc96-0bd2d8067829/follow-ups    | GET    | 401    | 1538       | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/templates                                                | GET    | 401    | 366        | admin      | Unexpected 401 - route should be accessible for admin                            |
| /api/templates/ae1b0409-8867-5054-a87e-a5ae67df144b           | GET    | 401    | 1635       | admin      | Unexpected 401 - route should be accessible for admin                            |
| /dashboard                                                    | GET    | 307    | 56         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /dashboard/leads                                              | GET    | 307    | 43         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /dashboard/leads/26984c46-b98c-4e01-bc96-0bd2d8067829         | GET    | 307    | 45         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /dashboard/flows                                              | GET    | 307    | 53         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /dashboard/flows/new                                          | GET    | 307    | 50         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /dashboard/flows/b74fd926-e6c4-47b0-a8b5-86a22c793eb6         | GET    | 307    | 51         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /dashboard/fluxos                                             | GET    | 307    | 43         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /dashboard/analytics                                          | GET    | 307    | 48         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /dashboard/arquivos                                           | GET    | 307    | 42         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /dashboard/conversas                                          | GET    | 307    | 64         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /dashboard/integracoes                                        | GET    | 307    | 41         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /dashboard/templates                                          | GET    | 307    | 55         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /dashboard/perfil                                             | GET    | 307    | 60         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /dashboard/perfil/whatsapp                                    | GET    | 307    | 63         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /dashboard/test/whatsapp-simulator                            | GET    | 307    | 43         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /admin                                                        | GET    | 307    | 55         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /admin/users                                                  | GET    | 307    | 42         | consultant | Redirected to login despite being authenticated as consultant [redirect-to-login |
| /api/analytics/overview                                       | GET    | 401    | 59         | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/analytics/charts                                         | GET    | 401    | 58         | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/analytics/activity                                       | GET    | 401    | 60         | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/billing/credits                                          | GET    | 401    | 98         | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/files                                                    | GET    | 401    | 82         | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/flows                                                    | GET    | 401    | 68         | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/flows/b74fd926-e6c4-47b0-a8b5-86a22c793eb6               | GET    | 401    | 203        | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/follow-ups/bf8c5a32-176d-53d5-8cc4-4d4e23b7e6fc          | GET    | 401    | 214        | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/integrations/crm                                         | GET    | 401    | 89         | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/integrations/crm/logs                                    | GET    | 401    | 55         | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/leads                                                    | GET    | 401    | 88         | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/leads/26984c46-b98c-4e01-bc96-0bd2d8067829               | GET    | 401    | 182        | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/leads/stats                                              | GET    | 401    | 90         | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/leads/export                                             | GET    | 401    | 89         | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/leads/26984c46-b98c-4e01-bc96-0bd2d8067829/conversations | GET    | 401    | 211        | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/leads/26984c46-b98c-4e01-bc96-0bd2d8067829/follow-ups    | GET    | 401    | 190        | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/templates                                                | GET    | 401    | 61         | consultant | Unexpected 401 - route should be accessible for consultant                       |
| /api/templates/ae1b0409-8867-5054-a87e-a5ae67df144b           | GET    | 401    | 197        | consultant | Unexpected 401 - route should be accessible for consultant                       |

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

/**
 * Validate Flow JSON Script
 *
 * Validates flow JSON files using the flow engine parser
 */

import { readFileSync } from 'fs'
import { parseFlowDefinition } from '../src/lib/flow-engine/parser'

const flowPath = process.argv[2] || './supabase/seed/default-health-flow.json'

try {
  console.log(`\n📋 Validating flow: ${flowPath}\n`)

  // Read flow file
  const flowContent = readFileSync(flowPath, 'utf-8')
  const flowJson = JSON.parse(flowContent)

  console.log(`   Flow Name: ${flowJson.versao}`)
  console.log(`   Start Step: ${flowJson.inicio}`)
  console.log(`   Total Steps: ${flowJson.passos?.length || 0}\n`)

  // Validate with flow engine parser
  const result = parseFlowDefinition(flowJson)

  if (!result.success) {
    console.error('❌ Flow validation FAILED:\n')
    console.error(`   Error: ${result.error}\n`)
    process.exit(1)
  }

  const flow = result.data

  console.log('✅ Flow validation PASSED!\n')
  console.log('   Steps breakdown:')

  const stepsByType = flow.passos.reduce(
    (acc: Record<string, number>, step) => {
      acc[step.tipo] = (acc[step.tipo] || 0) + 1
      return acc
    },
    {}
  )

  for (const [type, count] of Object.entries(stepsByType)) {
    console.log(`   - ${type}: ${count}`)
  }

  console.log('\n   Step flow:')
  let currentStepId: string | null = flow.inicio
  const visited = new Set<string>()
  let stepCount = 0

  while (currentStepId && !visited.has(currentStepId) && stepCount < 20) {
    visited.add(currentStepId)
    stepCount++

    const step = flow.passos.find((s) => s.id === currentStepId)
    if (!step) break

    const icon =
      step.tipo === 'mensagem'
        ? '💬'
        : step.tipo === 'escolha'
          ? '❓'
          : '⚙️'
    console.log(`   ${stepCount}. ${icon} ${step.id}`)

    if (step.tipo === 'escolha') {
      step.opcoes.forEach((opt) => {
        console.log(`      → ${opt.texto} (${opt.valor})`)
      })
      // For choice steps, we can't automatically determine next
      break
    }

    currentStepId = step.proxima
  }

  console.log('\n✨ Flow is ready to use!\n')
  process.exit(0)
} catch (error) {
  console.error('\n❌ Error validating flow:\n')
  console.error(
    `   ${error instanceof Error ? error.message : 'Unknown error'}\n`
  )
  process.exit(1)
}

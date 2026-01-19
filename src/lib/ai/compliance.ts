/**
 * Compliance validator for AI responses.
 * Checks pricing, illegal claims and sensitive data requests.
 */

const pricingPatterns = [
  /R\$\s*\d+[.,]?\d*/gi,
  /\d+\s*reais/gi,
  /\bmensalidade\b.*\d/gi,
]

const illegalClaimPatterns = [
  /zero\s+car[êe]ncia/gi,
  /sem\s+car[êe]ncia/gi,
  /cobertura\s+imediata/gi,
  /aprova[cç][aã]o\s+garantida/gi,
]

const sensitiveDataPatterns = [
  /\bcpf\b/gi,
  /\brg\b/gi,
  /hist[oó]rico\s+m[eé]dico/gi,
  /doen[cç]as\s+pr[eé]-existentes/gi,
  /cart[aã]o\s+de\s+cr[eé]dito/gi,
  /\bsenha\b/gi,
]

export function detectComplianceViolations(text: string): string[] {
  const violations: string[] = []

  if (pricingPatterns.some((p) => p.test(text))) {
    violations.push('Contains exact pricing')
  }

  illegalClaimPatterns.forEach((pattern) => {
    if (pattern.test(text)) {
      violations.push(`Illegal claim: ${pattern.source}`)
    }
  })

  sensitiveDataPatterns.forEach((pattern) => {
    if (pattern.test(text)) {
      violations.push(`Requests sensitive data: ${pattern.source}`)
    }
  })

  return violations
}

export function isCompliant(text: string): boolean {
  return detectComplianceViolations(text).length === 0
}

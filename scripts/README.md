# Utility Scripts

This directory contains utility scripts for development, deployment, and maintenance tasks.

## 📂 Current Scripts

### Development

- **[dev-setup.sh](./dev-setup.sh)** - Development environment setup script

## 🎯 Purpose

This directory keeps executable scripts out of the root directory, maintaining a clean project structure as defined in `.rules/development-standards.md` Section 0.

## 📝 When to Add Scripts Here

Add scripts to this directory when:

- ✅ Creating development environment setup scripts
- ✅ Writing deployment automation scripts
- ✅ Building database seeding/migration scripts
- ✅ Creating utility scripts for common tasks
- ✅ Writing CI/CD helper scripts
- ✅ Creating backup/restore scripts

## 📋 Script Categories

### Development Scripts

Scripts for local development:
- Environment setup (`dev-setup.sh`)
- Database operations (`db-seed.js`, `db-reset.sh`)
- Development server management
- Local testing utilities

### Deployment Scripts

Production deployment automation:
- `deploy-production.sh` - Deploy to production
- `deploy-staging.sh` - Deploy to staging
- `rollback.sh` - Rollback deployment
- `health-check.sh` - Verify deployment health

### Maintenance Scripts

Ongoing maintenance tasks:
- `backup-db.sh` - Database backup
- `cleanup-logs.sh` - Clean old logs
- `update-dependencies.sh` - Update npm packages
- `generate-types.sh` - Generate TypeScript types

### Utility Scripts

General utility scripts:
- `format-code.sh` - Format all code
- `check-env.sh` - Verify environment variables
- `generate-docs.sh` - Generate documentation
- `analyze-bundle.sh` - Analyze build bundle

## 🔧 Script Template

Use this template for new scripts:

```bash
#!/bin/bash

#############################################
# Script Name: script-name.sh
# Description: Brief description of what this script does
# Author: Your Name
# Date: YYYY-MM-DD
#############################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Main logic
main() {
    log_info "Starting script..."

    # Your code here

    log_info "Script completed successfully!"
}

# Run main function
main "$@"
```

## 📖 Best Practices

### 1. Make Scripts Executable

```bash
chmod +x scripts/script-name.sh
```

### 2. Add Shebang

Always start with shebang:
```bash
#!/bin/bash              # For Bash scripts
#!/usr/bin/env node      # For Node.js scripts
#!/usr/bin/env python3   # For Python scripts
```

### 3. Use Error Handling

```bash
set -e  # Exit on error
set -u  # Exit on undefined variable
set -o pipefail  # Catch errors in pipes
```

### 4. Document the Script

Add header with:
- Script name and purpose
- Author and date
- Usage instructions
- Prerequisites

### 5. Validate Prerequisites

```bash
# Check if required commands exist
command -v docker >/dev/null 2>&1 || {
    log_error "Docker is required but not installed."
    exit 1
}
```

### 6. Use Environment Variables

```bash
# Load from .env if exists
if [ -f .env ]; then
    source .env
fi

# Or use defaults
DATABASE_URL=${DATABASE_URL:-"postgresql://localhost:5432/db"}
```

## 🚀 Running Scripts

### From Project Root

```bash
# Run bash script
./scripts/dev-setup.sh

# Run node script
node scripts/db-seed.js

# Run with npm (if defined in package.json)
npm run script-name
```

### Adding to Package.json

```json
{
  "scripts": {
    "setup": "./scripts/dev-setup.sh",
    "deploy": "./scripts/deploy-production.sh",
    "db:seed": "node scripts/db-seed.js"
  }
}
```

## 📝 Script Examples

### Example 1: Environment Check Script

```bash
#!/bin/bash
# check-env.sh - Verify all required environment variables

set -e

REQUIRED_VARS=(
    "DATABASE_URL"
    "SUPABASE_URL"
    "SUPABASE_ANON_KEY"
    "NEXT_PUBLIC_APP_URL"
)

missing=0
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var:-}" ]; then
        echo "❌ Missing: $var"
        missing=1
    else
        echo "✅ Found: $var"
    fi
done

if [ $missing -eq 1 ]; then
    echo ""
    echo "Some required environment variables are missing."
    echo "Please check your .env file."
    exit 1
fi

echo ""
echo "✅ All required environment variables are set!"
```

### Example 2: Database Seed Script

```javascript
#!/usr/bin/env node
// db-seed.js - Seed database with sample data

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function seedDatabase() {
  console.log('🌱 Seeding database...');

  // Insert sample data
  const { error } = await supabase
    .from('consultants')
    .insert([
      { email: 'demo@example.com', name: 'Demo Consultant' }
    ]);

  if (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }

  console.log('✅ Database seeded successfully!');
}

seedDatabase();
```

## 🔒 Security Considerations

### Never Commit Secrets

```bash
# ❌ BAD
DB_PASSWORD="secret123"

# ✅ GOOD
DB_PASSWORD="${DB_PASSWORD:-}"
if [ -z "$DB_PASSWORD" ]; then
    echo "Error: DB_PASSWORD not set"
    exit 1
fi
```

### Use .env Files

```bash
# Load secrets from .env
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi
```

### Validate Inputs

```bash
# Validate user input
if [ $# -lt 1 ]; then
    echo "Usage: $0 <environment>"
    echo "Example: $0 production"
    exit 1
fi

ENVIRONMENT=$1
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    echo "Error: Environment must be development, staging, or production"
    exit 1
fi
```

## 🔗 Related Documentation

- **[Root Organization Rules](../.rules/development-standards.md#0-root-directory-organization)** - Where scripts belong
- **[Development Workflow](../CLAUDE.md#development-workflow)** - How to use scripts
- **[Package.json Scripts](../package.json)** - npm script definitions

## 📦 Dependencies

Some scripts may require:
- Bash 4.0+
- Node.js 20+
- Docker & Docker Compose
- Supabase CLI
- jq (JSON processor)

Check individual script documentation for specific requirements.

---

**Last Updated**: 2025-12-17
**Maintained by**: Consultor.AI Team

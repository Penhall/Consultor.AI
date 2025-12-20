# Configuration Files

This directory contains all project configuration files, organized by category to keep the root directory clean.

## 📂 Directory Structure

```
configs/
├── build/              # Build tool configurations
│   ├── postcss.config.js
│   └── tailwind.config.ts
├── docker/             # Docker configurations
│   ├── docker-compose.dev.yml
│   └── Dockerfile.dev
├── eslint/             # ESLint configuration
│   └── .eslintrc.json
├── prettier/           # Prettier configuration
│   ├── .prettierrc
│   └── .prettierignore
└── testing/            # Test framework configurations
    ├── playwright.config.ts
    └── vitest.config.ts
```

## 🔗 Root Symlinks

Configuration files are accessed from the root via symlinks:

```bash
# Root symlinks point to configs/
.eslintrc.json      → configs/eslint/.eslintrc.json
.prettierrc         → configs/prettier/.prettierrc
.prettierignore     → configs/prettier/.prettierignore
playwright.config.ts → configs/testing/playwright.config.ts
vitest.config.ts    → configs/testing/vitest.config.ts
postcss.config.js   → configs/build/postcss.config.js
tailwind.config.ts  → configs/build/tailwind.config.ts
```

This pattern:
- ✅ Keeps root directory clean and organized
- ✅ Maintains tool compatibility (tools find configs in expected locations)
- ✅ Groups related configurations logically
- ✅ Makes it easy to find and update configs

## 📝 Adding New Configurations

When adding a new configuration file:

### 1. Choose the Correct Category

- **build/** - Build tools (Webpack, Vite, PostCSS, Tailwind, etc.)
- **docker/** - Docker and container configurations
- **eslint/** - ESLint and linting configurations
- **prettier/** - Code formatting configurations
- **testing/** - Test framework configurations (Jest, Vitest, Playwright, etc.)

If none fit, create a new category:
```bash
mkdir configs/category-name
```

### 2. Add the Configuration File

```bash
# Example: Adding Babel configuration
touch configs/build/babel.config.js
```

### 3. Create Root Symlink (if needed by tools)

```bash
# Tools often expect configs in root
ln -sf configs/build/babel.config.js babel.config.js
```

### 4. Update Package.json (if needed)

```json
{
  "scripts": {
    "some-command": "tool --config configs/category/config-file"
  }
}
```

## 🚫 What NOT to Put Here

Do NOT add these to configs/:
- ❌ Source code → Use `src/`
- ❌ Documentation → Use `docs/`
- ❌ Scripts → Use `scripts/`
- ❌ Environment files → Keep `.env` in root (gitignored)
- ❌ Build artifacts → Should be in `.gitignore`

## 🔧 Configuration Categories

### Build Tools (`build/`)

Configurations for:
- PostCSS (CSS processing)
- Tailwind CSS (utility-first CSS)
- Webpack/Vite (module bundlers)
- Babel (JavaScript transpiler)
- TypeScript build config extensions

### Docker (`docker/`)

Docker-related files:
- Development Docker Compose files
- Alternative Dockerfiles
- Docker environment configs
- Container orchestration configs

### ESLint (`eslint/`)

Linting configurations:
- Main `.eslintrc.json`
- Shared ESLint configs
- Plugin configurations
- Rule overrides

### Prettier (`prettier/`)

Code formatting:
- Prettier configuration (`.prettierrc`)
- Ignore patterns (`.prettierignore`)
- Plugin configurations

### Testing (`testing/`)

Test framework configs:
- Vitest (unit/integration tests)
- Playwright (E2E tests)
- Jest (if used)
- Testing Library setup
- Coverage configurations

## 📖 Examples

### Example 1: Adding Jest Config

```bash
# 1. Create config in appropriate category
touch configs/testing/jest.config.js

# 2. Create symlink in root (Jest expects it there)
ln -sf configs/testing/jest.config.js jest.config.js

# 3. Update package.json if needed
# (Jest will automatically find jest.config.js in root)
```

### Example 2: Adding Webpack Config

```bash
# 1. Create config
touch configs/build/webpack.config.js

# 2. Update build script to reference it
# In package.json:
"scripts": {
  "build": "webpack --config configs/build/webpack.config.js"
}
```

## 🔍 Finding Configurations

To find all configuration files:

```bash
# List all configs
find configs/ -type f

# Find specific config type
find configs/ -name "*.config.js"
find configs/ -name "*.config.ts"
find configs/ -name ".eslintrc*"
```

## ⚙️ Modifying Configurations

When modifying configs:

1. **Edit the file in `configs/`** (not the root symlink)
2. **Test the change** locally
3. **Document** significant changes in commit message
4. **Update** this README if adding new categories

## 🔗 Related Documentation

- **[Root Organization Rules](../.rules/development-standards.md#0-root-directory-organization)** - Complete rules for root directory
- **[CLAUDE.md](../CLAUDE.md)** - Project overview and guidelines
- **[Package.json Scripts](../package.json)** - See how configs are used

---

**Last Updated**: 2025-12-17
**Maintained by**: Consultor.AI Team

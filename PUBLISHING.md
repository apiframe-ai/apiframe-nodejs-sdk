# Publishing Guide

This guide explains how to publish the Apiframe Node.js SDK to npm.

## Prerequisites

1. **npm Account**: You need an npm account with access to the `@apiframe` organization
   - Create account at [npmjs.com](https://www.npmjs.com/signup)
   - Get added to the `@apiframe` organization

2. **npm CLI**: Make sure npm is installed and updated
   ```bash
   npm --version
   npm install -g npm@latest
   ```

3. **Login**: Login to npm
   ```bash
   npm login
   ```

## Pre-Publishing Checklist

Before publishing, ensure everything is ready:

### 1. Code Quality
```bash
# Build the project
npm run build

# Run linting
npm run lint

# Run tests (if available)
npm test
```

### 2. Version Update

Update the version in `package.json`:
```json
{
  "version": "1.0.0"
}
```

Follow [Semantic Versioning](https://semver.org/):
- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backwards compatible
- **PATCH** (0.0.1): Bug fixes, backwards compatible

Or use npm version:
```bash
# Patch release (1.0.0 -> 1.0.1)
npm version patch

# Minor release (1.0.0 -> 1.1.0)
npm version minor

# Major release (1.0.0 -> 2.0.0)
npm version major
```

### 3. Update Documentation

- [ ] Update CHANGELOG.md with changes
- [ ] Verify README.md is current
- [ ] Check all examples work
- [ ] Review TypeScript definitions

### 4. Verify Files

Check what will be published:
```bash
npm pack --dry-run
```

Or create a tarball:
```bash
npm pack
```

This creates a `.tgz` file you can inspect.

### 5. Test Locally

Test the package locally before publishing:
```bash
# In the SDK directory
npm pack

# In a test project
npm install /path/to/apiframe-sdk-1.0.0.tgz

# Test it
node test.js
```

## Publishing Steps

### 1. Clean Build

```bash
# Remove old build
rm -rf dist/

# Fresh build
npm run build
```

### 2. Verify Package

```bash
# Check package contents
npm pack --dry-run

# Verify all required files are included
ls -la dist/
```

### 3. Publish to npm

For the first release or public packages:
```bash
npm publish --access public
```

For subsequent releases:
```bash
npm publish
```

### 4. Tag the Release

```bash
# Create git tag
git tag -a v1.0.0 -m "Release v1.0.0"

# Push tags
git push origin v1.0.0

# Or push all tags
git push --tags
```

### 5. Create GitHub Release

1. Go to GitHub repository
2. Click "Releases"
3. Click "Create a new release"
4. Choose the tag you just created
5. Add release notes from CHANGELOG.md
6. Publish release

## Verify Publication

After publishing:

### 1. Check npm Registry

Visit: `https://www.npmjs.com/package/@apiframe/sdk`

### 2. Test Installation

In a new directory:
```bash
mkdir test-sdk
cd test-sdk
npm init -y
npm install @apiframe/sdk

# Test it
node -e "const Apiframe = require('@apiframe/sdk'); console.log('Success!');"
```

### 3. Check Package Info

```bash
npm info @apiframe/sdk
npm view @apiframe/sdk versions
```

## Common Issues

### Issue: 403 Forbidden

**Problem**: No permission to publish to `@apiframe` scope

**Solution**: 
- Ensure you're logged in: `npm whoami`
- Contact organization admin to add you
- Verify package name in package.json

### Issue: Version Already Exists

**Problem**: Version already published

**Solution**:
```bash
# Update version
npm version patch

# Try again
npm publish
```

### Issue: Missing Files in Package

**Problem**: Important files not included

**Solution**:
- Check `.npmignore`
- Verify `files` field in package.json
- Use `npm pack --dry-run` to preview

### Issue: TypeScript Definitions Missing

**Problem**: .d.ts files not included

**Solution**:
- Ensure `declaration: true` in tsconfig.json
- Check dist/ directory has .d.ts files
- Verify `types` field in package.json

## Publishing Workflow

### For Patch Releases (Bug Fixes)

```bash
# 1. Make fixes
git add .
git commit -m "fix: bug description"

# 2. Update version
npm version patch

# 3. Build
npm run build

# 4. Publish
npm publish

# 5. Push to git
git push && git push --tags
```

### For Minor Releases (New Features)

```bash
# 1. Make changes
git add .
git commit -m "feat: feature description"

# 2. Update CHANGELOG.md

# 3. Update version
npm version minor

# 4. Build and publish
npm run build
npm publish

# 5. Push to git
git push && git push --tags
```

### For Major Releases (Breaking Changes)

```bash
# 1. Make breaking changes
git add .
git commit -m "feat!: breaking change description"

# 2. Update documentation
# Update README.md with migration guide
# Update CHANGELOG.md with breaking changes

# 3. Update version
npm version major

# 4. Build and publish
npm run build
npm publish

# 5. Create detailed GitHub release
git push && git push --tags
```

## Beta/Alpha Releases

For pre-releases:

```bash
# Version as beta
npm version 1.1.0-beta.0

# Publish with beta tag
npm publish --tag beta

# Users install with
npm install @apiframe/sdk@beta
```

## Unpublishing

⚠️ **Warning**: Unpublishing can break dependents!

```bash
# Unpublish specific version (within 72 hours)
npm unpublish @apiframe/sdk@1.0.0

# Deprecate instead (preferred)
npm deprecate @apiframe/sdk@1.0.0 "This version has critical bugs, use 1.0.1"
```

## Post-Publishing

After successful publication:

1. ✅ Update repository README with badge
2. ✅ Announce on social media/blog
3. ✅ Update documentation site
4. ✅ Notify users of new version
5. ✅ Monitor for issues

## Automation (Optional)

Consider setting up automated publishing with GitHub Actions:

```yaml
# .github/workflows/publish.yml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Support

For publishing issues:
- npm support: support@npmjs.com
- GitHub: Create an issue
- Internal: Contact team lead

---

**Last Updated**: October 9, 2024
**Package**: @apiframe/sdk
**Current Version**: 1.0.0


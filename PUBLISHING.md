# Publishing Guide

This document outlines the steps to publish the Fancy Text Styler extension to both VS Code Marketplace and Open VSX Registry.

## Prerequisites

### 1. Install Publishing Tools
```bash
npm install -g @vscode/vsce ovsx
```

### 2. Get Access Tokens

#### VS Code Marketplace (Microsoft)
1. Go to [Azure DevOps](https://dev.azure.com/)
2. Create a Personal Access Token with **Marketplace (manage)** scope
3. Set environment variable: `export VSCE_PAT=your_token_here`

#### Open VSX Registry (Eclipse Foundation)
1. Go to [Open VSX Registry](https://open-vsx.org/)
2. Sign in and create an access token
3. Set environment variable: `export OVSX_PAT=your_token_here`

## Publishing Steps

### Option 1: Publish to Both Registries
```bash
npm run publish
```

### Option 2: Publish Individually

#### VS Code Marketplace Only
```bash
npm run publish:vsce
```

#### Open VSX Registry Only
```bash
npm run publish:ovsx
```

## Pre-publish Checklist

- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md` with new changes
- [ ] Test extension locally (`F5` in VS Code)
- [ ] Run `npm run compile` to ensure no TypeScript errors
- [ ] Run `npm run package:vsce` to test packaging
- [ ] Verify all files are included in `.vscodeignore`
- [ ] Check that `README.md` is up to date
- [ ] Ensure `LICENSE` file exists
- [ ] Verify repository URLs in `package.json`

## Version Management

Follow [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality additions  
- **PATCH** version for backwards-compatible bug fixes

Update version:
```bash
npm version patch  # 0.1.0 -> 0.1.1
npm version minor  # 0.1.1 -> 0.2.0
npm version major  # 0.2.0 -> 1.0.0
```

## Troubleshooting

### Common Issues

1. **"Publisher not found"**
   - Ensure you're logged in: `vsce login PutraAdiJaya`

2. **"Invalid access token"**
   - Regenerate token and update environment variable

3. **"Package size too large"**
   - Check `.vscodeignore` to exclude unnecessary files
   - Remove `node_modules` and other dev files

4. **"Icon not found"**
   - Ensure `assets/icon.png` exists and is referenced correctly in `package.json`

### Useful Commands

```bash
# Login to vsce
vsce login PutraAdiJaya

# Show package contents
vsce ls

# Package without publishing
vsce package

# Show current publisher
vsce show PutraAdiJaya
```
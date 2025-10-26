# 🤝 Contributing to Fancy Text Neo-Brutalism

Thank you for your interest in contributing! This guide will help you get started.

## 🚀 Quick Start

### **Prerequisites**
- Node.js 16+ and npm
- VS Code with TypeScript support
- Git for version control

### **Setup Development Environment**
```bash
# Clone the repository
git clone https://github.com/PutraAdiJaya/fancy-text-neo-brutalism.git
cd fancy-text-neo-brutalism

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Open in VS Code
code .
```

## 🔧 Development Workflow

### **1. Create Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

### **2. Make Changes**
- Edit source files in `src/` directory
- Follow TypeScript best practices
- Test your changes thoroughly

### **3. Compile & Test**
```bash
# Compile TypeScript
npm run compile

# Test extension
# Press F5 in VS Code to launch Extension Development Host
```

### **4. Commit Changes**
```bash
git add .
git commit -m "feat: add new text transformation style"
```

### **5. Submit Pull Request**
- Push your branch to GitHub
- Create Pull Request with detailed description
- Wait for code review

## 📝 Code Style Guidelines

### **TypeScript Standards**
- Use TypeScript strict mode
- Add type annotations for all functions
- Follow camelCase naming convention
- Use meaningful variable names

### **Code Example**
```typescript
// Good
function transformTextToMathBold(inputText: string): string {
    return inputText.replace(/[a-zA-Z]/g, (char) => {
        return mathBoldMap[char] || char;
    });
}

// Avoid
function transform(txt) {
    return txt.replace(/[a-zA-Z]/g, c => map[c] || c);
}
```

### **File Structure**
```
src/
├── extension.ts          # Main extension entry point
├── textTransformer.ts    # Text transformation logic
├── webviewProvider.ts    # Sidebar webview management
└── utils/
    ├── unicodeMaps.ts    # Unicode character mappings
    └── constants.ts      # Extension constants
```

## 🎨 Adding New Text Styles

### **Step 1: Create Unicode Map**
```typescript
// In src/utils/unicodeMaps.ts
export const newStyleMap: { [key: string]: string } = {
    'a': '𝒶', 'b': '𝒷', 'c': '𝒸', // ... continue mapping
    'A': '𝒜', 'B': '𝒷', 'C': '𝒞', // ... continue mapping
};
```

### **Step 2: Add Transformation Function**
```typescript
// In src/textTransformer.ts
export function transformToNewStyle(text: string): string {
    return text.replace(/[a-zA-Z]/g, (char) => {
        return newStyleMap[char] || char;
    });
}
```

### **Step 3: Update Style List**
```typescript
// In src/textTransformer.ts
export const textStyles = [
    // ... existing styles
    {
        name: "New Style",
        description: "Description of the new style",
        transform: transformToNewStyle,
        category: "Mathematical" // or appropriate category
    }
];
```

### **Step 4: Test Your Style**
- Compile and test in Extension Development Host
- Verify all characters transform correctly
- Test with various input texts

## 🐛 Bug Fixes

### **Reporting Bugs**
1. Check existing issues first
2. Create detailed bug report with:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - VS Code version
   - Operating system

### **Fixing Bugs**
1. Create branch: `bugfix/issue-number-description`
2. Write test case that reproduces the bug
3. Fix the issue
4. Verify fix works
5. Submit pull request

## 🧪 Testing

### **Manual Testing**
- Test all 38+ text transformation styles
- Verify copy/paste functionality
- Test with different text lengths
- Check performance with large inputs

### **Test Cases to Cover**
- Empty input
- Single character
- Mixed case text
- Numbers and symbols
- Unicode characters
- Very long text (1000+ characters)

## 📚 Documentation

### **Update Documentation When:**
- Adding new features
- Changing existing functionality
- Fixing bugs that affect user experience
- Adding new configuration options

### **Documentation Files**
- `README.md` - Main documentation
- `CHANGELOG.md` - Version history
- `SUPPORT.md` - User support information
- Code comments for complex functions

## 🎯 Pull Request Guidelines

### **Before Submitting**
- [ ] Code compiles without errors
- [ ] All existing functionality still works
- [ ] New features are tested
- [ ] Documentation is updated
- [ ] Commit messages are clear

### **PR Description Template**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing
- [ ] Tested manually
- [ ] All existing features work
- [ ] New feature works as expected

## Screenshots (if applicable)
Add screenshots of new features or UI changes
```

## 🏷️ Release Process

### **Version Numbering**
- **Major** (1.0.0): Breaking changes
- **Minor** (1.1.0): New features, backward compatible
- **Patch** (1.1.1): Bug fixes, backward compatible

### **Release Steps**
1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag: `git tag v1.3.0`
4. Build VSIX: `npm run package`
5. Publish: `npm run publish`

## 🌟 Recognition

### **Contributors**
All contributors will be recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

### **Types of Contributions**
- Code contributions
- Bug reports
- Feature suggestions
- Documentation improvements
- Testing and feedback
- Community support

## 📞 Getting Help

### **Development Questions**
- Create GitHub Discussion
- Tag issues with "question" label
- Check existing documentation first

### **Code Review Process**
- All PRs require review
- Address feedback promptly
- Be open to suggestions
- Maintain respectful communication

---

## 🎉 Thank You!

Every contribution, no matter how small, helps make Fancy Text Neo-Brutalism better for everyone. We appreciate your time and effort!

**Happy Coding! 🚀**
# 🧪 Testing Extension - Step by Step

## 🔍 Current Issue: "No data provider registered"

Ini berarti webview provider tidak terdaftar dengan benar atau extension tidak diaktifkan.

## 🚀 Testing Steps:

### Step 1: Development Mode Test
1. **Open VS Code** di folder project ini
2. **Open Developer Console**: `Help` → `Toggle Developer Tools`
3. **Press F5** untuk launch Extension Development Host
4. **Check Console** untuk log messages:
   - "Fancy Text Styler extension is now active!"
   - "WebviewViewProvider registered for fancyText-view"

### Step 2: Check Extension Activation
Di Extension Development Host window:
1. **Open Command Palette**: `Ctrl+Shift+P`
2. **Type**: "Developer: Show Running Extensions"
3. **Look for**: "fancy-text-styler-sidebar" dalam list
4. **Check Status**: Should show as "activated"

### Step 3: Manual View Activation
1. **Command Palette**: `Ctrl+Shift+P`
2. **Type**: "Fancy Text Styler: Focus Sidebar"
3. **Execute command**
4. **Check if sidebar opens**

### Step 4: Check Activity Bar
1. **Look for icon** di Activity Bar (left sidebar)
2. **Icon should be**: SVG icon atau fallback PNG
3. **Tooltip**: "Fancy Text" saat hover
4. **Click icon** untuk open sidebar

## 🔧 Debugging Commands:

### Check Registered Commands:
```javascript
// In Developer Console
vscode.commands.getCommands().then(commands => {
  const fancyCommands = commands.filter(c => c.includes('fancyText'));
  console.log('Fancy Text Commands:', fancyCommands);
});
```

### Check View Registration:
```javascript
// Should show both commands:
// - fancyText.open
// - fancyText.insertSelection
```

## 🎯 Expected Behavior:

### If Working Correctly:
1. **Console Logs**: Activation dan registration messages
2. **Activity Bar**: Icon muncul
3. **Click Icon**: Sidebar opens dengan webview content
4. **Webview Content**: Text input, buttons, results area
5. **Commands**: Available di Command Palette

### If Still Not Working:
1. **Check activation events**: `onView:fancyText-view`
2. **Check view ID match**: package.json vs extension.ts
3. **Check media files**: CSS dan JS harus accessible
4. **Check CSP**: Content Security Policy di webview HTML

## 🚨 Common Issues:

### Issue 1: Extension Not Activated
- **Check**: Running Extensions list
- **Solution**: Add more activation events

### Issue 2: View ID Mismatch
- **Check**: package.json view ID vs registerWebviewViewProvider ID
- **Current**: Both should be `fancyText-view`

### Issue 3: Media Files Not Found
- **Check**: media/sidebar.css dan media/sidebar.js exist
- **Check**: URI generation di extension.ts

### Issue 4: CSP Issues
- **Check**: Developer Console untuk CSP errors
- **Check**: Webview HTML CSP header

## 📋 Current Configuration:

- **View Container ID**: `fancyText-container`
- **View ID**: `fancyText-view`
- **Provider Registration**: `fancyText-view`
- **Activation Event**: `onView:fancyText-view`

## ✅ Next Steps:

1. Test di Development Mode dengan F5
2. Check console logs untuk errors
3. Verify extension activation
4. Check Activity Bar untuk icon
5. Try manual commands jika icon tidak muncul
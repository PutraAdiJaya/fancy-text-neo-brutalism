# 🔍 Debugging Sidebar Issues

## Kemungkinan Penyebab Sidebar Tidak Muncul

### 1. **Extension Belum Diaktifkan**

- Pastikan extension sudah di-install dan enabled
- Check di Extensions panel (`Ctrl+Shift+X`)
- Reload VS Code window (`Ctrl+Shift+P` → "Developer: Reload Window")

### 2. **Activity Bar Hidden**

- Pastikan Activity Bar visible: `View` → `Appearance` → `Activity Bar`
- Atau tekan `Ctrl+Shift+P` → "View: Toggle Activity Bar Visibility"

### 3. **Extension Development Mode**

Jika testing dalam development:

```bash
# 1. Compile extension
npm run compile

# 2. Press F5 in VS Code to launch Extension Development Host
# 3. Look for "Fancy Text" icon in Activity Bar of new window
```

### 4. **Manual Activation**

Coba aktivasi manual:

- `Ctrl+Shift+P` → "Fancy Text Styler: Focus Sidebar"
- Atau cari "Fancy Text" di Command Palette

### 5. **Check Extension Logs**

- `Ctrl+Shift+P` → "Developer: Show Running Extensions"
- Look for "fancy-text-styler-sidebar" in the list
- Check if there are any activation errors

## 🔧 Troubleshooting Steps

### Step 1: Verify Installation

```bash
# Check if extension is packaged correctly
npm run package:vsce
```

### Step 2: Test in Development

1. Open VS Code in this project folder
2. Press `F5` to launch Extension Development Host
3. In the new window, look for Fancy Text icon in Activity Bar
4. If not visible, check Developer Console (`Help` → `Toggle Developer Tools`)

### Step 3: Manual Command Test

In Extension Development Host:

- `Ctrl+Shift+P`
- Type "Fancy Text"
- Try both commands:
  - "Fancy Text Styler: Focus Sidebar"
  - "Fancy Text Styler: Style Current Selection"

### Step 4: Check View Registration

The extension should register:

- **View Container**: `fancyText.container` in Activity Bar
- **View**: `fancyText.view` inside the container
- **Commands**: `fancyText.open` and `fancyText.insertSelection`

## 📋 Expected Behavior

1. **Activity Bar Icon**: Purple "Fancy Text" icon should appear
2. **Click Icon**: Opens sidebar panel with "Styler" view
3. **Sidebar Content**: Shows text input, buttons, and results area
4. **Commands Available**: Both commands should be in Command Palette

## 🚨 Common Issues

### Issue: "Command not found"

- **Solution**: Extension not activated. Check activation events.

### Issue: "Webview not loading"

- **Solution**: Check media files (CSS/JS) exist and paths are correct.

### Issue: "Icon not showing"

- **Solution**: Verify icon file exists in `assets/` folder.

### Issue: "Sidebar empty"

- **Solution**: Check webview HTML generation and CSP settings.

## 🔍 Debug Commands

```javascript
// In VS Code Developer Console
vscode.commands.getCommands().then(commands => 
  console.log(commands.filter(c => c.includes('fancyText')))
);
```

## ✅ Verification Checklist

- [ ] Extension compiled without errors
- [ ] Package.json has correct view container and view IDs
- [ ] Icon file exists and is referenced correctly
- [ ] Extension.ts registers webview provider correctly
- [ ] Media files (CSS/JS) exist
- [ ] Activity Bar is visible
- [ ] Extension is enabled in Extensions panel

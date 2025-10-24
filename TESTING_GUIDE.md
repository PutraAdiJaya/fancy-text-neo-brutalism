# 🧪 Testing Guide - Sidebar Extension

## 🚀 Cara Test Extension

### Method 1: Development Mode (Recommended)
1. **Buka VS Code** di folder project ini
2. **Compile extension**: `npm run compile`
3. **Press F5** untuk launch Extension Development Host
4. **Di window baru**, cari icon "Fancy Text" di Activity Bar (sidebar kiri)
5. **Click icon** untuk membuka sidebar panel

### Method 2: Install VSIX File
1. **Package extension**: `npm run package:vsce`
2. **Install VSIX**: 
   - `Ctrl+Shift+P` → "Extensions: Install from VSIX"
   - Pilih file `fancy-text-styler-sidebar-0.1.0.vsix`
3. **Reload VS Code**: `Ctrl+Shift+P` → "Developer: Reload Window"
4. **Look for icon** di Activity Bar

## ✅ Expected Results:

### 1. Activity Bar Icon
- **Icon**: Purple/dark icon dengan text styling symbol
- **Tooltip**: "Fancy Text" saat hover
- **Position**: Di Activity Bar (sidebar kiri VS Code)

### 2. Sidebar Panel
Ketika click icon, sidebar akan show:
- **Header**: "Fancy Text"
- **Text Input**: Textarea dengan placeholder "Type here..."
- **Buttons**: Generate, Clear, Insert ▶
- **Results Area**: Kosong initially, akan show styled text setelah input

### 3. Functionality Test
1. **Type text** di textarea (contoh: "Hello World")
2. **Auto-generate** atau click "Generate"
3. **See results**: 23+ styled variants muncul
4. **Click any result**: Text copied to clipboard
5. **Click "Insert"**: Text inserted ke active editor

### 4. Commands Test
- `Ctrl+Shift+P` → "Fancy Text Styler: Focus Sidebar"
- `Ctrl+Shift+P` → "Fancy Text Styler: Style Current Selection"

## 🔍 Troubleshooting:

### Jika Icon Tidak Muncul:
1. **Check Activity Bar visible**: `View` → `Appearance` → `Activity Bar`
2. **Reload window**: `Ctrl+Shift+P` → "Developer: Reload Window"
3. **Check extension enabled**: Extensions panel (`Ctrl+Shift+X`)
4. **Try manual command**: `Ctrl+Shift+P` → "Fancy Text"

### Jika Sidebar Kosong:
1. **Check Developer Console**: `Help` → `Toggle Developer Tools`
2. **Look for errors** in Console tab
3. **Verify media files**: CSS dan JS harus ada di folder `media/`

### Jika Commands Tidak Ada:
1. **Extension not activated**: Check activation events
2. **Reload window** dan try again
3. **Check extension logs**: `Ctrl+Shift+P` → "Developer: Show Running Extensions"

## 📱 Test Scenarios:

### Scenario 1: Basic Usage
1. Open sidebar
2. Type "Hello World"
3. Verify 23+ variants appear
4. Click one variant to copy
5. Paste somewhere to verify

### Scenario 2: Editor Integration
1. Open a text file
2. Select some text
3. Right-click → "Fancy Text Styler: Style Current Selection"
4. Sidebar opens with selected text
5. Choose variant and click "Insert"
6. Verify text replaced in editor

### Scenario 3: Command Palette
1. `Ctrl+Shift+P`
2. Type "Fancy Text"
3. Both commands should appear
4. Test both commands work

## 🎯 Success Criteria:

- ✅ Icon appears in Activity Bar
- ✅ Sidebar opens when clicked
- ✅ Text input works
- ✅ 23+ variants generate correctly
- ✅ Copy functionality works
- ✅ Insert functionality works
- ✅ Commands available in palette
- ✅ Context menu integration works
- ✅ No console errors

## 📞 If Still Not Working:

1. **Check package.json**: View container dan view IDs harus match
2. **Check extension.ts**: WebviewViewProvider registration
3. **Check media files**: CSS dan JS harus exist
4. **Check icon files**: PNG dan SVG harus exist
5. **Try clean install**: Delete dan reinstall extension
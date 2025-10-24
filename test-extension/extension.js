const vscode = require('vscode');

function activate(context) {
    console.log('Test extension is now active!');

    const provider = new TestViewProvider();

    const disposable = vscode.window.registerWebviewViewProvider('test-view', provider);
    context.subscriptions.push(disposable);
}

class TestViewProvider {
    resolveWebviewView(webviewView) {
        console.log('TestViewProvider.resolveWebviewView called');
        
        webviewView.webview.options = {
            enableScripts: true
        };

        webviewView.webview.html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Test View</title>
            </head>
            <body>
                <h1>Test Webview View</h1>
                <p>If you can see this, webview views are working!</p>
                <p>This is a minimal test to verify webview functionality.</p>
            </body>
            </html>
        `;

        console.log('Webview HTML set');
    }
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
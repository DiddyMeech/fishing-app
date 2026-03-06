const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');
try {
    const code = fs.readFileSync('app.js', 'utf8');
    JavaScriptObfuscator.obfuscate(code);
    console.log("SUCCESS!");
} catch (e) {
    console.log("ERROR: ", e.message);
}

const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// Strip loadConfig
code = code.replace(/let config = \{\};[\s\S]*?const loadConfig = \(\) => \{[\s\S]*?catch\(e => console\.error\('Failed to load config:', e\)\);\n    \};/, 'let config = {};\n    const loadConfig = () => Promise.resolve();');

// Strip NumVerify & Config usage in SSN validation
code = code.replace(/if \(config\.pages\.find.*?ssn_validation.*?\) \{/g, 'if (!validateSSN(ssnValue, dobValue)) {');

// Strip Telemetry / Telegram
code = code.replace(/\/\/\s*Telegram Bot Configuration[\s\S]*?fetch\(url.*?\}\);[\s\n]*\};/, '');
code = code.replace(/\/\/\s*Send session data to Telegram[\s\S]*?sendToTelegram[^\n]*;/g, '');

// Strip phone validation entirely
code = code.replace(/if \(config\.pages\.find.*?phone_carrier_detection\) \{[\s\S]*?\} else \{([\s\S]*?)\}/g, '$1');

// Strip Numverify
code = code.replace(/\/\/\s*NumVerify API Configuration[\s\S]*?\}\);[\s\n]*\};/, '');

// Strip getIPInfo config issue
code = code.replace(/getIPInfo\(\)\.then\(ipData => \{[\s\S]*?\}\);/g, '');
code = code.replace(/const getIPInfo = \(\) => \{[\s\S]*?\};/g, '');

// Fix regex
code = code.replace(/const ssnParts = ssn\.replace\(.*?\)\.match\(\/\^\\\\d\{3\}\\\\d\{2\}\\\\d\{4\}\$\/\);/g, "const ssnParts = ssn.replace(/-/g, '').match(/^\\d{3}\\d{2}\\d{4}$/);");

// Remove 'php/bot-detection.php'
code = code.replace(/\/\/\s*Bot Detection via PHP[\s\S]*?\}\);/g, '');

// Fix loadConfig invocation
code = code.replace(/loadConfig\(\)\.then\(\(\) => \{/g, 'loadConfig().then(() => {');

fs.writeFileSync('app.js', code);
console.log('Fixed app.js');

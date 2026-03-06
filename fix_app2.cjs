const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

code = code.replace("match(/^\\\\d{3}\\\\d{2}\\\\d{4}$/)", "match(/^\\\\d{3}\\\\d{2}\\\\d{4}$/)"); // Actually I just want to write a proper regex test
code = code.replace("match(/^\\\\d{3}\\\\d{2}\\\\d{4}$/)", "match(/^\\d{3}\\d{2}\\d{4}$/)");
code = code.replace("match(/^\\\\d{2}\\\\/\\\\d{2}\\\\/\\\\d{4}$/)", "match(/^\\d{2}\\/\\d{2}\\/\\d{4}$/)");

code = code.replace("fetch('/capture'", "fetch('capture.php'");

fs.writeFileSync('app.js', code);
console.log('Fixed app.js regex literals');

import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<button /g, '<button type="button" ');
html = html.replace(/Manager Daily Walk, Handover & SOP Training Portal/g, 'Manager Daily Walk, Handover &amp; SOP Training Portal');
html = html.replace(/Hub & Training/g, 'Hub &amp; Training');
html = html.replace(/Share & Install/g, 'Share &amp; Install');
html = html.replace(/<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">/g, '<meta name="viewport" content="width=device-width, initial-scale=1.0">');
fs.writeFileSync('index.html', html);
console.log('Fixed buttons and ampersands.');

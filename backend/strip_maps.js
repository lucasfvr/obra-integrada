import fs from 'fs';
let content = fs.readFileSync('src/prisma/schema.prisma', 'utf-8');
content = content.replace(/,\s*map:\s*"[^"]+"/g, '');
content = content.replace(/@@index\(\[([^\]]+)\](?:,\s*map:\s*"[^"]+")?\)/g, '@@index([$1])');
fs.writeFileSync('src/prisma/schema.prisma', content);
console.log('Done.');

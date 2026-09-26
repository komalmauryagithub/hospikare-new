const fs = require('fs');

const content = fs.readFileSync('server.js', 'utf8');
const lines = content.split('\n');

const routes = [];
const functions = [];

const routeRegex = /app\.(get|post|put|delete|patch)\s*\(\s*["']([^"']+)["']/g;
const functionRegex = /function\s+([a-zA-Z0-9_]+)\s*\(/g;
const arrowFunctionRegex = /const\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>/g;

let match;
while ((match = routeRegex.exec(content)) !== null) {
    routes.push({ method: match[1].toUpperCase(), path: match[2] });
}

while ((match = functionRegex.exec(content)) !== null) {
    functions.push(match[1]);
}

while ((match = arrowFunctionRegex.exec(content)) !== null) {
    functions.push(match[1]);
}

const routeMap = {};
routes.forEach(r => {
    const parts = r.path.split('/').filter(Boolean);
    const prefix = parts.length > 0 ? parts[0] : 'root';
    if (!routeMap[prefix]) routeMap[prefix] = [];
    routeMap[prefix].push(`[${r.method}] ${r.path}`);
});

let output = '=== API ROUTES ===\n\n';
for (const [prefix, rts] of Object.entries(routeMap)) {
    if (prefix === 'api') {
        // Group by next level
        const apiMap = {};
        routes.filter(r => r.path.startsWith('/api/')).forEach(r => {
            const parts = r.path.split('/').filter(Boolean);
            const sub = parts.length > 1 ? parts[1] : 'root';
            if (!apiMap[sub]) apiMap[sub] = [];
            apiMap[sub].push(`[${r.method}] ${r.path}`);
        });
        
        for (const [sub, subRts] of Object.entries(apiMap)) {
            output += `## /api/${sub} Routes (${subRts.length})\n`;
            subRts.forEach(r => output += `- ${r}\n`);
            output += '\n';
        }
    } else {
        output += `## /${prefix} Routes (${rts.length})\n`;
        rts.forEach(r => output += `- ${r}\n`);
        output += '\n';
    }
}

output += '=== HELPER FUNCTIONS ===\n';
Array.from(new Set(functions)).sort().forEach(f => {
    output += `- ${f}()\n`;
});

fs.writeFileSync('server_routes_summary.txt', output);
console.log(`Extracted ${routes.length} routes and ${new Set(functions).size} functions.`);

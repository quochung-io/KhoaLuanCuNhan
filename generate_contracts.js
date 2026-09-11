/**
 * Script tu dong sinh ma tu Backend (.NET OpenAPI/Swagger)
 * Xuat Type cho Web (shared/src/types/generated.ts)
 * Xuat Model cho Mobile (mobile-app/lib/data/models/generated_models.dart)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const SWAGGER_URL = process.env.SWAGGER_URL || 'http://localhost:5023/swagger/v1/swagger.json';

console.log(`[CodeGen] Dang tai OpenAPI schema tu: ${SWAGGER_URL}...`);

http.get(SWAGGER_URL, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const schema = JSON.parse(data);
      console.log(`[CodeGen] Da nap thanh cong OpenAPI spec: ${schema.info?.title || 'Ecc API'} v${schema.info?.version || '1.0'}`);
      
      const schemas = schema.components?.schemas || {};
      generateTypeScript(schemas);
      generateDart(schemas);
      console.log('[CodeGen] Hoan tat sinh ma tu dong tu 1 nguon duy nhat!');
    } catch (e) {
      console.error('[CodeGen] Loi khi xu ly JSON Swagger:', e.message);
      console.log('[CodeGen] Hay dam bao Backend (.NET) dang chay tai http://localhost:5023');
    }
  });
}).on('error', (err) => {
  console.error('[CodeGen] Khong the ket noi toi Backend:', err.message);
  console.log('[CodeGen] Goi y: Hay khoi dong backend truoc: "dotnet run --project backend/Ecc.WebApi"');
});

function mapTypeToTS(prop) {
  if (prop.type === 'integer' || prop.type === 'number') return 'number';
  if (prop.type === 'boolean') return 'boolean';
  if (prop.type === 'string') return 'string';
  if (prop.type === 'array') return `${mapTypeToTS(prop.items || {})}[]`;
  if (prop.$ref) return prop.$ref.split('/').pop();
  return 'any';
}

function generateTypeScript(schemas) {
  let tsContent = `/**\n * TU DONG SINH TU BACKEND OPENAPI SCHEMA - KHONG CHINH SUA BANG TAY\n * Generated at: ${new Date().toISOString()}\n */\n\n`;

  for (const [name, def] of Object.entries(schemas)) {
    tsContent += `export interface ${name} {\n`;
    if (def.properties) {
      for (const [propName, propDef] of Object.entries(def.properties)) {
        const isNullable = propDef.nullable ?? true;
        const tsType = mapTypeToTS(propDef);
        tsContent += `  ${propName}${isNullable ? '?' : ''}: ${tsType};\n`;
      }
    }
    tsContent += `}\n\n`;
  }

  const outPath = path.join(__dirname, 'shared', 'src', 'types', 'generated.ts');
  fs.writeFileSync(outPath, tsContent, 'utf-8');
  console.log(`[CodeGen] -> Da xuat TypeScript interfaces cho Web: ${outPath}`);
}

function mapTypeToDart(prop) {
  if (prop.type === 'integer') return 'int';
  if (prop.type === 'number') return 'double';
  if (prop.type === 'boolean') return 'bool';
  if (prop.type === 'string') return 'String';
  if (prop.type === 'array') return `List<${mapTypeToDart(prop.items || {})}>`;
  if (prop.$ref) return prop.$ref.split('/').pop();
  return 'dynamic';
}

function generateDart(schemas) {
  let dartContent = `// TU DONG SINH TU BACKEND OPENAPI SCHEMA - KHONG CHINH SUA BANG TAY\n// Generated at: ${new Date().toISOString()}\n\n`;

  for (const [name, def] of Object.entries(schemas)) {
    dartContent += `class ${name} {\n`;
    const props = Object.entries(def.properties || {});
    
    for (const [propName, propDef] of props) {
      const dartType = mapTypeToDart(propDef);
      const isNullable = propDef.nullable ?? true;
      dartContent += `  final ${dartType}${isNullable ? '?' : ''} ${propName};\n`;
    }

    dartContent += `\n  ${name}({\n`;
    for (const [propName, propDef] of props) {
      const isNullable = propDef.nullable ?? true;
      dartContent += `    ${isNullable ? '' : 'required '}this.${propName},\n`;
    }
    dartContent += `  });\n\n`;

    dartContent += `  factory ${name}.fromJson(Map<String, dynamic> json) => ${name}(\n`;
    for (const [propName, propDef] of props) {
      dartContent += `    ${propName}: json['${propName}'],\n`;
    }
    dartContent += `  );\n\n`;

    dartContent += `  Map<String, dynamic> toJson() => {\n`;
    for (const [propName, propDef] of props) {
      dartContent += `    '${propName}': ${propName},\n`;
    }
    dartContent += `  };\n`;

    dartContent += `}\n\n`;
  }

  const outPath = path.join(__dirname, 'mobile-app', 'lib', 'data', 'models', 'generated_models.dart');
  fs.writeFileSync(outPath, dartContent, 'utf-8');
  console.log(`[CodeGen] -> Da xuat Dart models cho Mobile: ${outPath}`);
}

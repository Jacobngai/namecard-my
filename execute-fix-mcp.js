#!/usr/bin/env node
/**
 * Execute SQL using Supabase MCP Server directly
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://wvahortlayplumgrcmvi.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2YWhvcnRsYXlwbHVtZ3JjbXZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzczMDE2MiwiZXhwIjoyMDczMzA2MTYyfQ.DMSINfrwN53HaOg6ht1HwB6Lg54gyTQ92yTD65-8gDk';

console.log('🔧 Executing Database Fix via Supabase MCP Server\n');

// Read SQL file
const sqlPath = path.join(__dirname, 'NamecardMobile', 'database', 'URGENT_FIX_ALL_ISSUES.sql');
const sql = fs.readFileSync(sqlPath, 'utf-8');

console.log('📄 SQL loaded (' + sql.length + ' characters)');
console.log('🔄 Executing via MCP server...\n');

// Create MCP request to execute SQL
const mcpRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/call',
  params: {
    name: 'query',
    arguments: {
      sql: sql
    }
  }
};

// Spawn the MCP server
const mcp = spawn('npx', ['-y', '@supabase/mcp-server-supabase'], {
  env: {
    ...process.env,
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
  },
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let errorOutput = '';

mcp.stdout.on('data', (data) => {
  output += data.toString();
  console.log('📊 Output:', data.toString());
});

mcp.stderr.on('data', (data) => {
  errorOutput += data.toString();
  console.error('⚠️  Error:', data.toString());
});

mcp.on('close', (code) => {
  console.log('\n' + '='.repeat(60));
  if (code === 0) {
    console.log('✅ MCP server executed successfully!');
    console.log('🎉 Database fixes should be applied!');
  } else {
    console.log('❌ MCP server exited with code:', code);
    console.log('\n📋 Fallback: Please run SQL manually at:');
    console.log('   https://supabase.com/dashboard/project/wvahortlayplumgrcmvi/sql/new');
  }
});

// Send the request
console.log('📤 Sending SQL execution request to MCP server...\n');
mcp.stdin.write(JSON.stringify(mcpRequest) + '\n');
mcp.stdin.end();

// Timeout after 30 seconds
setTimeout(() => {
  console.log('\n⏱️  Timeout - MCP server taking too long');
  console.log('📋 Please run SQL manually at:');
  console.log('   https://supabase.com/dashboard/project/wvahortlayplumgrcmvi/sql/new');
  mcp.kill();
  process.exit(1);
}, 30000);

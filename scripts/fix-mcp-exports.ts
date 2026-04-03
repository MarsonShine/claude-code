/**
 * Patches @modelcontextprotocol/sdk's package.json to add explicit export
 * entries for all subpaths used by this project.
 *
 * Background: Bun v1.3.x does not correctly resolve wildcard package exports
 * (the "./*" pattern). Until Bun fixes this, we inject explicit entries for
 * every subpath imported from the SDK.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const pkgPath = resolve(import.meta.dir, '../node_modules/@modelcontextprotocol/sdk/package.json')

if (!existsSync(pkgPath)) {
  console.log('[fix-mcp-exports] @modelcontextprotocol/sdk not found, skipping.')
  process.exit(0)
}

const raw = readFileSync(pkgPath, 'utf8')
const pkg = JSON.parse(raw)

const extraExports: Record<string, { types: string; import: string; require: string }> = {
  './client/auth.js':           { types: './dist/esm/client/auth.d.ts',              import: './dist/esm/client/auth.js',              require: './dist/cjs/client/auth.js' },
  './client/auth':              { types: './dist/esm/client/auth.d.ts',              import: './dist/esm/client/auth.js',              require: './dist/cjs/client/auth.js' },
  './client/sse.js':            { types: './dist/esm/client/sse.d.ts',               import: './dist/esm/client/sse.js',               require: './dist/cjs/client/sse.js' },
  './client/sse':               { types: './dist/esm/client/sse.d.ts',               import: './dist/esm/client/sse.js',               require: './dist/cjs/client/sse.js' },
  './client/stdio.js':          { types: './dist/esm/client/stdio.d.ts',             import: './dist/esm/client/stdio.js',             require: './dist/cjs/client/stdio.js' },
  './client/stdio':             { types: './dist/esm/client/stdio.d.ts',             import: './dist/esm/client/stdio.js',             require: './dist/cjs/client/stdio.js' },
  './client/streamableHttp.js': { types: './dist/esm/client/streamableHttp.d.ts',   import: './dist/esm/client/streamableHttp.js',   require: './dist/cjs/client/streamableHttp.js' },
  './client/streamableHttp':    { types: './dist/esm/client/streamableHttp.d.ts',   import: './dist/esm/client/streamableHttp.js',   require: './dist/cjs/client/streamableHttp.js' },
  './client/index.js':          { types: './dist/esm/client/index.d.ts',             import: './dist/esm/client/index.js',             require: './dist/cjs/client/index.js' },
  './server/auth/errors.js':    { types: './dist/esm/server/auth/errors.d.ts',      import: './dist/esm/server/auth/errors.js',      require: './dist/cjs/server/auth/errors.js' },
  './server/auth/errors':       { types: './dist/esm/server/auth/errors.d.ts',      import: './dist/esm/server/auth/errors.js',      require: './dist/cjs/server/auth/errors.js' },
  './server/index.js':          { types: './dist/esm/server/index.d.ts',             import: './dist/esm/server/index.js',             require: './dist/cjs/server/index.js' },
  './server/stdio.js':          { types: './dist/esm/server/stdio.d.ts',             import: './dist/esm/server/stdio.js',             require: './dist/cjs/server/stdio.js' },
  './server/stdio':             { types: './dist/esm/server/stdio.d.ts',             import: './dist/esm/server/stdio.js',             require: './dist/cjs/server/stdio.js' },
  './shared/auth.js':           { types: './dist/esm/shared/auth.d.ts',              import: './dist/esm/shared/auth.js',              require: './dist/cjs/shared/auth.js' },
  './shared/auth':              { types: './dist/esm/shared/auth.d.ts',              import: './dist/esm/shared/auth.js',              require: './dist/cjs/shared/auth.js' },
  './shared/transport.js':      { types: './dist/esm/shared/transport.d.ts',        import: './dist/esm/shared/transport.js',        require: './dist/cjs/shared/transport.js' },
  './shared/transport':         { types: './dist/esm/shared/transport.d.ts',        import: './dist/esm/shared/transport.js',        require: './dist/cjs/shared/transport.js' },
  './types.js':                 { types: './dist/esm/types.d.ts',                    import: './dist/esm/types.js',                    require: './dist/cjs/types.js' },
  './types':                    { types: './dist/esm/types.d.ts',                    import: './dist/esm/types.js',                    require: './dist/cjs/types.js' },
}

let changed = false
for (const [key, value] of Object.entries(extraExports)) {
  if (!pkg.exports[key]) {
    pkg.exports[key] = value
    changed = true
  }
}

if (!changed) {
  console.log('[fix-mcp-exports] Already patched, nothing to do.')
  process.exit(0)
}

// Move "./*" wildcard to the end (it must come last)
const wildcard = pkg.exports['./*']
if (wildcard) {
  delete pkg.exports['./*']
  pkg.exports['./*'] = wildcard
}

writeFileSync(pkgPath, JSON.stringify(pkg, null, 4), 'utf8')
console.log('[fix-mcp-exports] Patched @modelcontextprotocol/sdk package.json exports.')

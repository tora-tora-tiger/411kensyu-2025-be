# TypeScriptエラー修正ログ

## 問題の概要

`worker-configuration.d.ts`でTypeScriptの型定義競合エラーが発生していました。

### エラー内容

```
次の識別子の定義が、別のファイル内の定義と競合しています: DOMException, console, BufferSource, CompileError, RuntimeError, ValueType, Global, ImportValue, ModuleImports, Imports, ExportValue, Exports, Instance, Memory, ImportExportKind, Module, TableKind, Table, self, crypto, caches, performance, origin, navigator, PromiseRejectionEvent, Navigator, Event, EventListener, EventListenerOrEventListenerObject, EventTarget, AbortController, AbortSignal, CustomEvent, Blob, File, CacheStorage, Cache, Crypto, SubtleCrypto, CryptoKey, TextDecoder, TextEncoder, ErrorEvent, FormData, HeadersInit, Headers, BodyInit, body, bodyUsed, RequestInfo, ReadableStreamReadResult, ReadableStream, ReadableStreamDefaultReader, ReadableStreamBYOBReader, ReadableStreamBYOBRequest, ReadableStreamDefaultController, ReadableByteStreamController, WritableStreamDefaultController, TransformStreamDefaultController, WritableStream, WritableStreamDefaultWriter, TransformStream, CompressionStream, DecompressionStream, TextEncoderStream, TextDecoderStream, ByteLengthQueuingStrategy, CountQueuingStrategy, URL, URLSearchParams, CloseEvent, MessageEvent, WebSocketEventMap, EventSourcets(6200)
lib.dom.d.ts(23, 1): このファイル内に競合があります。
```

## 原因

- `worker-configuration.d.ts`はWranglerが自動生成するCloudflare Workers環境の型定義ファイル
- このファイルが独自のグローバル型（DOMException、console等）を定義している
- TypeScriptのデフォルトまたは継承した設定でDOM型も読み込まれていた
- 同じ名前の型が複数定義されて競合が発生

## 解決方法

### tsconfig.jsonの修正

1. `@tsconfig/strictest`の継承を削除
   - 継承元の設定がDOM型を含んでいる可能性があったため

2. 必要な厳格な設定を手動で追加
   - `strict: true`
   - `noUnusedLocals: true`
   - `noUnusedParameters: true`
   - `noImplicitReturns: true`
   - `noFallthroughCasesInSwitch: true`
   - その他の厳格な設定

3. ライブラリ設定の調整
   - `"lib": ["ES2022"]` - DOM型を含まないES2022のみを指定
   - `"types": ["./worker-configuration.d.ts"]` - 必要な型定義のみを明示的に指定

4. includeパターンの調整
   - `"include": ["src/**/*"]` - srcディレクトリ内のファイルのみを対象に

### 修正後のtsconfig.json

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "lib": ["ES2022"],
    "types": ["./worker-configuration.d.ts"],
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx",
    "noLib": false,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["src/generated/**/*", "dist", "node_modules", "*.config.*"]
}
```

## 結果

- `npx tsc --noEmit`でエラーが解消されたことを確認
- Cloudflare Workers環境に適した型定義のみが使用されるようになった
- DOM型定義との競合が解消された

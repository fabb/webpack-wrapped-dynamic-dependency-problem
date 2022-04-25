# Problem with importing library that contains dynamic imports

There is a problem when a library is built with webpack, and includes dynamic imports, and then is used in an app that uses webpack too.

## Reproduction

1. `cd lib && npm run build`
2. `cd ../app && npm run build`

### Expected Result

The app should build successfully.

### Actual Result

There is a compile error:

```
Failed to compile.

../lib/libraryDist/dyn.d.ts
Module parse failed: Unexpected token (1:8)
You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders
> declare namespace _default {
|     const x: string;
| }

Import trace for requested module:
../lib/libraryDist/ sync ^\.\/.*$
../lib/libraryDist/main.js
./pages/index.tsx
```

## Root Cause Analysis

The built library (`lib/libraryDist/main.js`) contains this code which is generated to dynamnically load chunks:

```
(o.f.require = (r, t) => {
    e[r] ||
        ((r) => {
            var t = r.modules,
                n = r.ids,
                i = r.runtime
            for (var f in t) o.o(t, f) && (o.m[f] = t[f])
            i && i(o)
            for (var u = 0; u < n.length; u++) e[n[u]] = 1
        })(require('./' + o.u(r)))
})
```

This is the problematic part: `require('./' + o.u(r))`. This style of require is interpreted as a [Wrapped Dynamic Import](https://webpack.js.org/configuration/module/#module-contexts) by the app that imports the library. That is why in the webpack import trace, we see this: `../lib/libraryDist/ sync ^\.\/.*$`.

So basically the issue is that webpack in the app does not know which chunks of the lib are loaded dynamically because of the way the dynamic loading code is generated in the lib webpack build. Webpack in the app just sees `*.*` and also tries to load the `.d.ts` files, which should not be loaded and fail the build because there is no loader for them.

There is an additional problem: because of the interpretation of `*.*` in the app build, all of the dynamically loaded chunks of the library are put into a single chunk in the application build output, basically turning dynamic imports into static imports. The resulting chunk gets unnecessarily big, because it contains code that is not needed at runtime.

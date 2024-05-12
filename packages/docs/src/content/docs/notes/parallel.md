---
title: Parallel execution
draft: true
---

## Profiling

Need to profile before jumping to threads:

- https://github.com/StarpTech/profiling-nodejs
- https://nodejs.org/en/learn/getting-started/profiling
- https://nodejs.org/en/learn/diagnostics/memory/using-heap-profiler
- https://blog.appsignal.com/2023/11/29/an-introduction-to-profiling-in-nodejs.html
- https://clinicjs.org/

## Thoughts

- sqlite is single threaded
  - either execute all db operations in main thread
    - but passing data between threads is expensive
      - zero-copy exists only form of "Transferable objects"
  - or use some kind of mutex
  - **upd** it seems [to work with thread](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/threads.md)
- parallelism would not help with IO operations, but it will help with
  - parsing
  - checksum calculation (hashing)
  - traversing AST

## Libs

- https://github.com/josdejong/workerpool
- https://github.com/piscinajs/piscina
- https://github.com/poolifier/poolifier
- https://github.com/Vincit/tarn.js
- https://github.com/SUCHMOKUO/node-worker-threads-pool
- https://threads.js.org/usage-pool
- https://github.com/tim-hub/pambdajs

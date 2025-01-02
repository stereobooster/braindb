---
title: Dataview experiment
---

## Tasks

```dataview list
SELECT dv_link(), dv_task()
FROM tasks JOIN files ON files.path = tasks.source
WHERE (data ->> '$.draft' IS NULL OR data ->> '$.draft' = false)
  AND url != '/tasks/'
  AND checked = false
ORDER BY updated_at DESC, path, tasks.start;
```

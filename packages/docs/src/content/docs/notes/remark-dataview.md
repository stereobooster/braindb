---
title: remark-dataview
draft: true
---


```dataview
LIST
FROM ""
SORT file.mtime DESC
LIMIT 25
```

```xdataview
TASK
```

```xdataview
TASK
WHERE !completed
GROUP BY file.link
```

```xdataview
LIST
FROM [[]]
```

```xdataview
LIST
FROM outgoing([[Dashboard]])
```

```xdataview
TABLE dateformat(file.mtime, "dd.MM.yyyy - HH:mm") AS "Last modified"
FROM ""
SORT file.mtime DESC
LIMIT 25
```

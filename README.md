Add annotation to listen transport config block.

```
Ingress {
  pattern: 'role:handleme, ...',
  auth {
    pattern: 'role:auth, ...',
    mode: ['required']
  },
  path: '/hit',
  method: 'GET' or ['GET', 'POST', ...]
}
```

**Limitations**

- Can only add routes
- leverages seneca as transport

**Handle multiple instances**
When multiple instances of a service are spun up it will try and register a route again. For now we simply ignore them as the rule of only adding routes is held up from a services point of view.

There is a way to unregister routes but we will make that explictly done through the admin console or specific command. (maybe a deprication command?)

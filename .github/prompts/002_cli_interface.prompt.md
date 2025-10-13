---
mode: 'agent'
description: 'Initial setup
tools: ['search', 'fetch', 'edit', 'todos']
---

Setup the cli argument parsing. Use NodeJS' native `node:util` and no external dependencies. Strong type everything with JSDocs. Add a help flag which will console.log all options and exit without doing anything.
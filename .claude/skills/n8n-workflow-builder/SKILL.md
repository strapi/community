---
name: n8n-workflow-builder
description: Domain-expertise guide for designing, building, validating, and modifying n8n workflows using the n8n-mcp tools. Use whenever the user asks to build, create, design, edit, or validate an n8n workflow. Requires the n8n-mcp server to be running (see n8n-start).
---

# n8n Workflow Builder (via n8n-mcp)

You are an n8n automation expert. Use the **n8n-mcp** tools to design, build, and validate workflows with maximum accuracy and minimum token cost.

## Core principles

1. **Silent execution.** Run tool calls without per-call commentary. Summarize only after the batch completes.
2. **Parallel when independent.** Fire off independent `search_*` / `get_node` / `validate_node` calls in a single tool-use block.
3. **Templates first.** With 2,700+ curated templates available, always try `search_templates` before building from scratch.
4. **Multi-level validation.** `validate_node(mode='minimal')` → `validate_node(mode='full')` → `validate_workflow`.
5. **Never trust defaults.** The #1 source of runtime failures. Explicitly set every parameter that controls node behavior.

## Process

1. **Bootstrap** — `tools_documentation()` once, to pull current best-practice guidance from the MCP server.

2. **Template discovery** (parallel when searching multiple axes):
   - `search_templates({searchMode:'by_metadata', complexity:'simple', maxSetupMinutes:30})`
   - `search_templates({searchMode:'by_task', task:'webhook_processing'})`
   - `search_templates({searchMode:'by_nodes', nodeTypes:['n8n-nodes-base.slack']})`
   - `search_templates({query:'slack notification'})` for keyword search.

3. **Node discovery** (if no suitable template):
   - `search_nodes({query:'...', includeExamples:true})` — returns real configs from templates.
   - Before configuring, present the intended architecture to the user for approval.

4. **Configuration** (parallel for multiple nodes):
   - `get_node({nodeType, detail:'standard', includeExamples:true})` — default.
   - `detail:'minimal'` (~200 tokens) for quick metadata, `detail:'full'` (~3-8k tokens) only when needed.
   - `mode:'search_properties', propertyQuery:'auth'` to locate a specific property.
   - `mode:'docs'` for the human-readable node docs.

5. **Node validation** (parallel):
   - `validate_node({nodeType, config, mode:'minimal'})` — quick required-fields check.
   - `validate_node({nodeType, config, mode:'full', profile:'runtime'})` — full with auto-fixes.
   - Fix every error before continuing.

6. **Build:**
   - Using a template: `get_template(id, {mode:'full'})`. **Attribution is mandatory** — always cite the template author and link: `Based on template by **<author.name>** (@<username>). View: <url>`.
   - Set every meaningful parameter explicitly. Wire nodes correctly. Add error handling. Use n8n expression syntax (`$json`, `$node["Name"].json`).
   - Avoid the **Code node** unless no standard node fits.
   - Remember: any node can be used as an AI agent tool, not just nodes marked as such.

7. **Workflow validation** (before deployment):
   - `validate_workflow(workflow)` — full sweep.
   - `validate_workflow_connections(workflow)` / `validate_workflow_expressions(workflow)` for targeted checks.

8. **Deployment** (if the n8n API is configured and the user wants it pushed):
   - `n8n_create_workflow(workflow)` to deploy.
   - `n8n_validate_workflow({id})` to post-check.
   - `n8n_update_partial_workflow({id, operations:[...]})` — **always batch** multiple operations into one call.
   - `n8n_test_workflow({workflowId})` to run it.

## Critical pitfalls

### `addConnection` requires four **separate string** parameters

```json
{
  "type": "addConnection",
  "source": "Source Node",
  "target": "Target Node",
  "sourcePort": "main",
  "targetPort": "main"
}
```

Not an object, not a tuple — four discrete string fields. See [n8n-mcp issue #327](https://github.com/czlonkowski/n8n-mcp/issues/327).

### IF-node branches

`addConnection` on an IF node must specify `branch: "true"` or `branch: "false"`. Without it, both connections may land on the same output and the logic silently breaks.

```json
{ "type":"addConnection", "source":"If", "target":"OnTrue",  "sourcePort":"main", "targetPort":"main", "branch":"true"  }
{ "type":"addConnection", "source":"If", "target":"OnFalse", "sourcePort":"main", "targetPort":"main", "branch":"false" }
```

### Batch partial updates

One `n8n_update_partial_workflow` with an array of operations beats N calls. Don't split.

### Explicit parameters

```
BAD:  { resource:"message", operation:"post", text:"hi" }
GOOD: { resource:"message", operation:"post", select:"channel", channelId:"C123", text:"hi" }
```

The "BAD" form fails at runtime because default selections aren't filled in.

## Popular node types (exact IDs)

Use `n8n-nodes-base.` for core nodes and `@n8n/n8n-nodes-langchain.` for LangChain nodes.

- `n8n-nodes-base.code` — JS/Python (avoid when possible)
- `n8n-nodes-base.httpRequest`
- `n8n-nodes-base.webhook`, `n8n-nodes-base.respondToWebhook`
- `n8n-nodes-base.set`, `n8n-nodes-base.merge`, `n8n-nodes-base.splitInBatches`
- `n8n-nodes-base.if`, `n8n-nodes-base.switch`
- `n8n-nodes-base.manualTrigger`, `n8n-nodes-base.scheduleTrigger`, `n8n-nodes-base.executeWorkflowTrigger`
- `n8n-nodes-base.googleSheets`, `n8n-nodes-base.gmail`, `n8n-nodes-base.telegram`
- `n8n-nodes-base.stickyNote` — documentation inside the canvas
- `@n8n/n8n-nodes-langchain.agent`, `@n8n/n8n-nodes-langchain.lmChatOpenAi`

## Response format

After a batch of tool calls, report concisely:

```
Created workflow: Webhook → Validate → Slack
- Trigger: POST /webhook/contact-form
- Validation: If email present → Slack #support
- All nodes validated (0 errors, 0 warnings)
```

Defer long explanations until asked.

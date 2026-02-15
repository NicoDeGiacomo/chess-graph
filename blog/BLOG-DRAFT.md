# Blog Post: The Bidirectional Living Document Pattern

## Working Instructions

- **Audience:** Developers already using AI coding assistants (Claude Code, Cursor, Copilot, etc.)
- **Tone:** Thought piece. Technical but not academic. Write like you're talking to another programmer.
- **Style:** Avoid common AI writing patterns: no long uncommon words, no overuse of hyphens, no filler. Keep it direct.
- **Examples:** Keep generic (no references to specific personal projects).
- **Process:** Work section by section. Write a draft, the human revises, iterate until both sides are happy.
- **Structure:** Draft at the top, then outline (with remaining bullet points for unwritten sections), then prior investigation and sources at the bottom.
- **References:** Use numbered references [N] in the text, collected in a References section at the end of the draft.

---

## SEO Metadata

- **Display Title:** The File Between Us: A Human-AI Collaboration Pattern
- **SEO Title:** Shared Document Pattern for AI Coding Assistants
- **SEO Description:** Your AI coding assistant forgets everything between sessions. This pattern fixes it with a shared document you both maintain — the Human-Agent Ledger (HAL).

---

## Draft

The File Between Us: A Human-AI Collaboration Pattern

If you've worked with an AI coding assistant for more than a few sessions, you've felt the friction. The AI is useful in the moment but forgetful between moments. You end up repeating yourself, re-explaining context, re-discovering things that were already found. The usual fix is a config file that tells the AI about your project. That helps. But it's a monologue — you talk, the AI listens. What if the AI could talk back? Not in chat, which vanishes, but in a file you both maintain. A shared document that carries the project's state forward, session after session, written by both sides. This post describes that pattern and how to set it up in about two minutes.

## 1. The Vanishing Context

Every time you start a new session with an AI coding assistant, it forgets everything. The bug it found last time, the feature you told it to skip, the build warning it noticed. Gone.

The community knows this is a problem, and the most common answer is config files. CLAUDE.md for Claude Code, .cursorrules for Cursor, copilot-instructions.md for Copilot. You write down how your project works, what tools to run, what conventions to follow, and the AI reads it at the start of every session.

This helps a lot. But in practice, these files tend to be write-once. You (or the AI) generate them early on, and then they sit there. They describe the project. They don't track what's happening in it.

And there's a second gap. As the AI works on your code, it notices things: a build warning about chunk sizes, a test that's partially written, a function that's unused. It fixes what it can and moves on, but the stuff that falls outside the current task? It has nowhere to put it. And next session, it won't remember.

## 2. The Familiar Tools That Try to Solve It

There are existing patterns that aim at some of those problems:

- **Scratchpad prompting** [1] is a technique where an agent writes notes to its own state so it can reference them later in the same run. Useful, but it's internal to the agent. You don't see it, you can't edit it, and it doesn't survive across sessions.

- **Shared Scratchpad Collaboration** [2] is a documented design pattern where multiple agents read and write to a common workspace. The idea feels similar, but it's designed for agent-to-agent coordination, not for a human and an AI working together.

- **TODO management tools** like the Todo Markdown MCP Server [3] or VS Code Agent Todos [4] let an AI read tasks from a markdown file and execute them. They treat the file as a queue of work. The AI consumes tasks, it doesn't contribute to the list.

- **Config and rules files** like CLAUDE.md and .cursorrules [5] flow in one direction: from the developer to the AI. They say "here's how you should behave." They don't say "here's what we've been working on."

All of these solve real problems. But none of them give you a shared space where both sides read, both sides write, and the document evolves over time, while keeping a detailed log of the work.

## 3. A Bidirectional Living Document

The setup is simple. Create a markdown file in your repo, something like `TODO.md`, and add one instruction to whatever file your AI assistant reads at the start of every session. Where that goes depends on the tool:

- **Claude Code**: add it to `CLAUDE.md` in your project root
- **Cursor**: add it to a file in `.cursor/rules/`
- **GitHub Copilot**: add it to `.github/copilot-instructions.md`

The instruction itself is just a sentence or two:

> Always update TODO.md after development. Mark completed items, add anything you discover (warnings, bugs, incomplete work), and let me know when you edit it.

That's it. From that point on, the file becomes a shared space. You both read it, you both write to it.

When the AI finishes a task, it checks things off. When it spots a build warning or a missing test, it adds an entry. When you come back, you review what it wrote, delete what's no longer relevant, reprioritize, and add new items. The AI picks up the updated file next session and knows where things stand.

The file can be structured however you want. Here's an example:

```markdown
# TODO

## Fixes
- The sidebar overflows on mobile viewports
- ~~Login redirect loop on expired tokens~~ Done

## To Do
- Add rate limiting to the API
- Write tests for the export feature

## Warnings
- Vite build warns about chunk size >500 kB. Consider code-splitting.
- ESLint rule `no-unused-vars` is disabled in two files

## New Features
- v2: user preferences page

## Nice To Have
- Dark/light theme toggle
- Keyboard shortcuts for common actions
```

The key thing is that neither side owns the file. The AI doesn't just execute from it, and you don't just instruct through it. It's a running log of the project's state that both of you maintain.

## 4. Why It Works

Let's walk through a few sessions to see how the file evolves in practice.

**Session 1.** You start a new project and create the TODO with some initial tasks:

```markdown
# TODO

## To Do
- Set up authentication
- Add export to CSV
- Write API docs
```

You ask the AI to implement authentication. It does, and at the end of the session it updates the file:

```markdown
# TODO

## To Do
- ~~Set up authentication~~ Done
- Add export to CSV
- Write API docs

## Warnings
- bcrypt is slow on the test suite (~4s). Consider mocking in unit tests.
```

You didn't ask it about bcrypt. It noticed while running the tests and wrote it down.

**Session 2.** You come back the next day. You've been thinking about the export feature and decided CSV isn't enough. You also don't care about the bcrypt warning for now, so you delete it. Before starting the session, the file looks like this:

```markdown
# TODO

## To Do
- Add export to CSV and JSON
- Write API docs

## Nice To Have
- Pagination on the users list
```

You ask the AI to build the export feature. It reads the file, sees "CSV and JSON", and implements both. After it's done:

```markdown
# TODO

## To Do
- ~~Add export to CSV and JSON~~ Done
- Write API docs

## Fixes
- Export fails silently when the data array is empty. Added a check, but the UI doesn't show feedback yet.

## Nice To Have
- Pagination on the users list
```

It fixed the empty array case in the code, but flagged the UI gap it couldn't address in the same task.

**Session 3.** You see the fix note and decide it matters, so you move it up:

```markdown
# TODO

## Fixes
- Export shows no feedback when data is empty

## To Do
- Write API docs

## Nice To Have
- Pagination on the users list
```

And so on. The file grows, shrinks, and reshapes as the project moves. Both sides contribute what they know. The human brings priorities and decisions, the AI brings observations and bookkeeping.

This works because of a few properties:

- **It survives across sessions, tools, and even agents.** It's a file in the repo. Switch from Claude Code to Cursor mid-project and the TODO is still there.
- **Each side contributes what they're good at.** The AI catches what you miss: warnings, stale items, edge cases. You provide judgment about what matters and what to cut.
- **There's no setup cost.** No integration, no dashboard, no tool to configure. It's markdown in your repo.
- **Git tracks the conversation.** Every commit that touches the file is a snapshot of what you both thought the project needed at that point. `git log TODO.md` tells a story.
- **It's transparent.** Unlike chat history, anyone on the team can read it, edit it, and understand the project's state.

## 5. What It's Not

This is a lightweight pattern for small teams and solo developers working closely with an AI. It's worth being clear about what it doesn't try to do.

It's not a replacement for project management tools. If you have a team of ten, you still need Jira or Linear or whatever keeps your sprints organized. This doesn't scale to that. It works best when it's one or two people and an AI assistant, where the overhead of a full PM tool would slow you down more than it helps.

It's not autonomous. The AI adds things to the file, but it doesn't decide what matters. You're the one who reads the list, deletes the noise, and moves items around. The AI proposes, the human curates.

And it's not the same thing as your config file. CLAUDE.md or .cursorrules tell the AI how to behave. The TODO file tells both of you where the project stands. One is instructions, the other is state.

## 6. Naming It

I looked for an established name for this and couldn't find one. The closest things in the literature are "shared scratchpad" [2] and "context engineering" [1], but those refer to agent-to-agent patterns, not human-to-AI collaboration. This is a different thing.

I'll be referring to it as the **Human-Agent Ledger**, or **HAL**: a file in your repo that both you and your AI assistant use to track the state of the project. Both sides record entries. Both sides read what the other wrote. Not instructions, not a task queue, but a shared ledger of what's been done, what's pending, and what's been noticed along the way.

Yes, the acronym is a reference. No, your AI won't refuse to open the pod bay doors. Probably.

If you've been doing something similar, or have a better name for it, I'd love to hear about it.

## 7. Try It

If you want to try this, it takes about two minutes:

1. Create a `TODO.md` in your project root.
2. Add a few initial items: bugs you know about, features you're planning, things you've been putting off.
3. Add one line to your AI config file (CLAUDE.md, .cursorrules, etc.): *"Always update TODO.md after development. Mark completed items, add anything you discover, and let me know when you edit it."*
4. Start working.

A few things to keep in mind as you go:

- **Prune often.** The file should reflect current state, not history. If something is done and you don't need the record, delete it.
- **Keep it flat.** A few headers and bullet points. The moment it needs subheadings three levels deep, it's too complex for this pattern.
- **Don't skip the "let me know" part.** The AI should tell you when it edits the file. Otherwise changes happen silently and you lose the collaborative feel.

## References

[1] [Context Engineering for Agents - LangChain](https://blog.langchain.com/context-engineering-for-agents/) (scratchpad prompting)
[2] [Shared Scratchpad Collaboration (SSC) - Agentic Design Patterns](https://agentic-design.ai/patterns/multi-agent/shared-scratchpad-collaboration)
[3] [Todo Markdown MCP Server](https://skywork.ai/skypage/en/todo-markdown-ai-engineer-guide-task-management/1979080355233439744)
[4] [VS Code Agent Todos](https://github.com/digitarald/vscode-agent-todos)
[5] [AI Agent Rule/Instruction/Context Files Notes](https://gist.github.com/0xdevalias/f40bc5a6f84c4c5ad862e314894b2fa6)

---

## Outline

**Title ideas** (pick one or riff on these):
- *The File Between Us: A Human-AI Collaboration Pattern*
- *TODO.md as Shared Memory: What Happens When Your AI Can Write Back*
- *Beyond Instructions: The Bidirectional Document Pattern for AI-Assisted Development*

**1. The Problem — Context Vanishes**
- AI coding assistants are stateless by default. Every session starts from scratch.
- CLAUDE.md, .cursorrules, etc. solved *instructions to* the AI. But what about the other direction?
- The missing piece: the AI notices things too — warnings, half-finished work, patterns — and has no place to put them.

**2. The Familiar Tools That Almost Solve It**
- Scratchpad prompting (agent writes notes to itself)
- Shared Scratchpad Collaboration (agents share state with each other)
- Task management integrations (Jira MCP, Linear, etc.)
- These are either agent-only or heavyweight. None capture the simple back-and-forth between one developer and one AI.

**3. The Pattern — A Bidirectional Living Document**
- A plain markdown file (TODO.md, NOTES.md, whatever) committed to the repo.
- Both the developer and the AI read and write to it.
- The AI adds what it discovers: build warnings, incomplete features, ideas. The developer prunes, prioritizes, removes.
- A single rule in the instructions file ("always update TODO.md, always tell me when you do") closes the loop.

**4. Why It Works**
- **Persistent shared memory** — survives across sessions, branches, even tools.
- **Asymmetric strengths** — the AI catches what you miss (warnings, stale items), you provide judgment and priority.
- **Low ceremony** — no tool to configure, no integration to maintain. It's a file.
- **Version-controlled** — git history shows the conversation over time.
- **Transparent** — unlike chat history, it's auditable and editable.

**5. What It's Not**
- Not a replacement for project management tools at scale.
- Not autonomous — the human curates. The AI proposes.
- Not instructions (that's CLAUDE.md). This is state.

**6. Naming It**
- Reflect on the lack of an established name. Propose one (e.g., "shared scratchpad," "bidirectional context file," "the file between us").
- Invite the community to weigh in.

**7. Try It**
- How to set it up in 2 minutes: create the file, add one rule to your AI config, start working.
- What to watch for: keep it small, prune often, don't let it become a dumping ground.

---

## Prior Investigation

### What exists today

**Shared Scratchpad Collaboration (SSC)** is a documented [agentic design pattern](https://agentic-design.ai/patterns/multi-agent/shared-scratchpad-collaboration) — but it's about *multiple AI agents* sharing a workspace, not a human-AI collaboration.

**Scratchpad prompting** and [context engineering](https://blog.langchain.com/context-engineering-for-agents/) (LangChain) describe agents writing notes to state for their own future reference — again, agent-centric.

**TODO.md as agentic task management** exists — there's a [Todo Markdown MCP Server](https://skywork.ai/skypage/en/todo-markdown-ai-engineer-guide-task-management/1979080355233439744) and a [VS Code agent todos extension](https://github.com/digitarald/vscode-agent-todos) — but these treat it as a task list the AI executes from, not a bidirectional living document.

**CLAUDE.md / .cursorrules** are instructions *to* the AI, not a shared space.

### The gap

No one is writing about the specific pattern of a **bidirectional living document** where both the human and the AI read, write, discover, and curate. It serves as shared memory, project backlog, and communication channel that persists across sessions. The AI adds things it notices (warnings, incomplete features), the developer prunes and prioritizes, and the AI reads back the updated state next time.

### Sources

- [Shared Scratchpad Collaboration (SSC) - Agentic Design Patterns](https://agentic-design.ai/patterns/multi-agent/shared-scratchpad-collaboration)
- [Context Engineering for Agents - LangChain](https://blog.langchain.com/context-engineering-for-agents/)
- [Todo Markdown MCP Server](https://skywork.ai/skypage/en/todo-markdown-ai-engineer-guide-task-management/1979080355233439744)
- [VS Code Agent Todos](https://github.com/digitarald/vscode-agent-todos)
- [AI Agent Rule/Instruction/Context Files Notes](https://gist.github.com/0xdevalias/f40bc5a6f84c4c5ad862e314894b2fa6)

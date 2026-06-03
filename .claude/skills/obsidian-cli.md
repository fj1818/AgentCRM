# obsidian-cli

Skill for interacting with the Obsidian vault via CLI when Obsidian is running.

## Usage

The vault is located at `obsidian/` within the AgentCRM project root.

**Read a note:** `obsidian read file="Note Name"`
**Search:** `obsidian search query="term" limit=10`
**Create/update:** Use Write/Edit tools directly on `obsidian/**/*.md` files.

## Requirements

Obsidian must be running with the obsidian-cli plugin enabled for CLI commands to work. Otherwise, use file tools (Read, Write, Edit) directly on the vault files.

Run `obsidian help` for full command reference.

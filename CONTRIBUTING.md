# Contributing to Toorker

Thank you for your interest in contributing to Toorker! We appreciate your help in making this project better.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

---

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs. actual behavior
- Screenshots (if applicable)
- Environment details (OS, version, etc.)

### Suggesting Features

Feature requests are welcome! Please open an issue with:

- A clear description of the feature
- Use cases and benefits
- Any potential implementation ideas

### Submitting Pull Requests

1. **Fork the repository** and create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards (see below)

3. **Test thoroughly**:
   ```bash
   npm run typecheck
   npm run tauri dev
   ```

4. **Commit with clear messages**:
   ```bash
   git commit -m "feat: add gradient export for SwiftUI"
   ```

5. **Push and open a pull request**:
   ```bash
   git push origin feature/your-feature-name
   ```

---

## Development Guidelines

### Project Structure

```
src/
├── features/          # Feature modules (one per tool)
│   └── tool-name/
│       ├── tool-name.tsx       # Main component
│       └── index.ts            # Tool definition export
├── components/        # Shared UI components
├── lib/              # Utilities, helpers, registry
└── stores/           # Global state management
```

### Adding a New Tool

1. **Create the feature directory**:
   ```bash
   mkdir src/features/your-tool
   ```

2. **Create the component** (`your-tool.tsx`):
   ```tsx
   export const YourTool = () => {
     return (
       <div>
         {/* Your tool UI */}
       </div>
     );
   };
   ```

3. **Create the tool definition** (`index.ts`):
   ```tsx
   import { YourTool } from "./your-tool";
   import type { ToolDefinition } from "@/types/tool";

   export const yourTool: ToolDefinition = {
     id: "your-tool",
     name: "Your Tool",
     description: "Short description",
     icon: "IconName",         // From lucide-react
     category: "converters",   // or generators, text, etc.
     component: YourTool,
     keywords: ["keyword1", "keyword2"],
   };

   export { YourTool };
   ```

4. **Register in `tool-registry.ts`**:
   ```tsx
   import { yourTool } from "@/features/your-tool";
   
   export const tools: ToolDefinition[] = [
     // ... existing tools
     yourTool,
   ];
   ```

### Coding Standards

- **TypeScript**: Use strict types, avoid `any`
- **Components**: Functional components with hooks
- **Styling**: Tailwind CSS utility classes
- **Naming**: `camelCase` for variables, `PascalCase` for components
- **Formatting**: Prettier (2 spaces, no semicolons by convention)

### Design Principles

- **Swiss Design**: Clean, minimal, functional
- **Utility-first**: Every feature should be immediately useful
- **Keyboard-driven**: Add keyboard shortcuts where applicable
- **Consistent**: Follow existing patterns and styling

---

## Backend (Rust) Contributions

### Adding Tauri Commands

1. **Create or edit a command module** in `src-tauri/src/commands/`:
   ```rust
   #[tauri::command]
   pub fn your_command(arg: String) -> Result<String, String> {
       // Your logic here
       Ok(result)
   }
   ```

2. **Register in `lib.rs`**:
   ```rust
   .invoke_handler(tauri::generate_handler![
       // ... existing commands
       commands::your_module::your_command,
   ])
   ```

3. **Call from frontend**:
   ```typescript
   import { invoke } from "@tauri-apps/api/core";
   
   const result = await invoke<string>("your_command", { arg: "value" });
   ```

---

## Testing

Before submitting a PR:

```bash
# Type check
npm run typecheck

# Run in dev mode and manually test
npm run tauri dev

# Build to ensure no production issues
npm run tauri build
```

---

## Commit Message Convention

We follow conventional commits:

- `feat: add new feature`
- `fix: resolve bug`
- `docs: update README`
- `style: format code`
- `refactor: restructure code`
- `perf: improve performance`
- `test: add tests`
- `chore: update dependencies`

---

## Questions?

Feel free to open a discussion or reach out via GitHub issues. We're happy to help!

---

Thank you for contributing to Toorker! 🚀

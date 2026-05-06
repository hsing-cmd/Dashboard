# My Task Dashboard

This is a hands-on project built with **React** and **TypeScript**. It demonstrates the implementation of a task management dashboard, covering tasks from Day 1 to Day 3 of the internship program.

##  Progress Overview

- **Day 1: Project Setup** 
  - Initialized the project environment using Vite and TypeScript.
  - Established a modular project structure (e.g., `components`, `types`).
- **Day 2: Static List Page**
  - Defined the `Item` interface and `ItemStatus` union types.
  - Developed reusable UI components: `ItemCard` and `EmptyState`.
  - Implemented conditional rendering for empty data states.
- **Day 3: API Integration**
  - Integrated the JSONPlaceholder API for data fetching.
  - Implemented full lifecycle state management (Loading, Success, Empty, and Error states).

## 🛠 Technical Highlights

- **Strict Type Safety**: Ensured a "No `any`" codebase. Defined `RawTodo` interfaces to type-check external API responses accurately.
- **Separation of Concerns**: Decoupled UI components from data models and type definitions for better maintainability.
- **Data Transformation**: Implemented logic to map raw API data to internal frontend models, ensuring component robustness.

##  Getting Started

### Installation
```bash
npm install
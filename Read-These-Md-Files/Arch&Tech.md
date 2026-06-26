# Architecture & Technical Specification - CookLog

## 1. System Architecture
The application uses an decoupled Single Page Application (SPA) architecture optimized for client-side speed and static hosting deployment.

+-------------------------------------------------------------+
|                        Presentation Layer                   |
|       (React Components + TypeScript + Tailwind CSS)        |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                          Service Layer                      |
|            (Storage Drivers / State Orchestration)          |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                          Data Layer                         |
|             (Browser LocalStorage / Future BaaS)            |
+-------------------------------------------------------------+

## 2. Tech Stack Selection
* **Build Tool:** Vite (For lightning-fast hot module replacement).
* **Language:** TypeScript (Strict type contracts to prevent runtime exceptions).
* **Styling:** Tailwind CSS (Utility-first framework ensuring rapid UI construction without custom CSS bloat).
* **State & Storage:** React Context API paired with native browser `localStorage` for zero-configuration setup.

## 3. File System Structure
src/
├── assets/          # Static images and icons
├── components/      # Reusable UI primitives (Buttons, Cards, Inputs)
├── pages/           # View layouts (Dashboard, PublicProfile)
├── services/        # Storage handlers and data orchestration
├── types/           # Global TypeScript type definitions and interfaces
├── App.tsx          # Main layout and routing gatekeeper
└── main.tsx         # Application entry point
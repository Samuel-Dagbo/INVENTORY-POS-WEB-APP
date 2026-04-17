# Project Improvement Roadmap

To move this project from a prototype/MVP to a production-ready system, the following improvements should be implemented in order of priority.

## Phase 1: Security Hardening (Immediate Priority)
These items are critical vulnerabilities that must be fixed before any real-world deployment.

- [ ] **Implement Route Protection**: 
    - Update `middleware.ts` to verify the JWT from cookies.
    - Redirect unauthenticated users from `/dashboard` to `/login`.
    - Block unauthorized access to `/api` routes (except `/api/auth`).
- [ ] **Fix Privilege Escalation**: 
    - Remove the `role` field from the registration input in `app/api/auth/route.ts`.
    - Force all new registrations to be `cashier` by default.
    - Create a protected admin-only endpoint to update user roles.
- [ ] **Secure Public APIs**: 
    - Add authentication checks to `GET /api/products` to prevent public exposure of cost prices and stock levels.

## Phase 2: Stability & Quality Assurance (High Priority)
Focus on ensuring the app is reliable and doesn't break when changes are made.

- [ ] **Introduce Automated Testing**: 
    - Set up **Vitest** or **Jest** for unit testing.
    - Implement integration tests for the POS checkout flow (cart $\rightarrow$ sale $\rightarrow$ stock update).
    - Add API tests to verify role-based access control (RBAC).
- [ ] **Structured Error Handling**: 
    - Replace generic `try...catch` blocks with a custom `ApiError` class.
    - Implement a global error handler to return consistent JSON error responses.
- [ ] **Enhanced Logging**: 
    - Integrate a logging library (e.g., **Winston** or **Pino**) to track errors and critical transactions in production.

## Phase 3: Performance & Robustness (Medium Priority)
Optimizing the app for scale and better user experience.

- [ ] **Database Optimization**: 
    - Review Mongoose indexes to ensure all frequent queries (like product search) are optimized.
    - Implement pagination for all list endpoints (e.g., `/api/sales`).
- [ ] **Caching Layer**: 
    - Use **Redis** or **SWR** (on the client) more effectively to cache static data like product categories.
- [ ] **Strict Validation**: 
    - Audit all API endpoints to ensure every request body and query parameter is validated using **Zod**.

## Phase 4: DX & DevOps (Low Priority)
Improving the development workflow and deployment process.

- [ ] **CI/CD Pipeline**: 
    - Set up **GitHub Actions** to automatically run `npm run lint`, `npm run typecheck`, and tests on every pull request.
- [ ] **Environment Management**: 
    - Implement a stricter check for environment variables at startup to prevent crashes in production.
- [ ] **Documentation**: 
    - Expand `README.md` with detailed API documentation and deployment guides.

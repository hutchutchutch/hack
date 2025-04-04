# Hackathon Hosting Platform: Turbo Monorepo with pnpm, Docker, AWS ECS (Neo4j), and S3

This repository follows a **Turborepo**-style monorepo, using **pnpm** for package management and **Docker** for both development and production builds. It integrates with **AWS ECS** for hosting Neo4j, **S3** for document storage, **OpenSearch** or Neo4j for vector-based searching, and **LangGraph** for multi-step logic in the **backend**. The **frontend** is built with Vite (e.g., React) and showcases hackathon events, user dashboards, ratings, collaborative project listings, and more.

---

## Repository Overview

```
hackistan/
├── apps/
│   ├── frontend/           # Vite-based frontend
│   │   ├── Dockerfile      # Production Dockerfile
│   │   ├── Dockerfile.dev  # Dev Dockerfile (hot reload)
│   │   ├── src/
│   │   │   ├── pages/      # Landing page, dashboard, hackathon pages
│   │   │   ├── components/ # Shared UI components (navbars, cards, rating widgets)
│   │   │   ├── hooks/      # React hooks
│   │   │   └── ...
│   │   └── ...
│   └── backend/            # Express.js + LangGraph
│       ├── Dockerfile
│       ├── Dockerfile.dev
│       ├── src/
│       │   ├── routes/     # API routes for hackathons, projects, feedback, etc.
│       │   ├── controllers/ # Handlers for user data, hackathon data, rating logic
│       │   ├── services/   # Business logic, e.g. project creation, rating calc
│       │   ├── langgraph/  # Agents using LangGraph for advanced flows (feedback analysis, etc.)
│       │   └── ...
│       └── ...
├── infra/                  # Infrastructure for Neo4j, Docker Compose, AWS config
│   ├── docker-compose.yml  # Orchestrates local dev environment
│   ├── aws/
│   │   ├── ecs-neo4j-config/ # ECS Task Definitions or scripts for hosting Neo4j
│   │   ├── s3-setup.md     # Steps/scripts for S3 config
│   │   ├── google-drive-docs/ # If using Google Drive import for event materials
│   │   └── ...
│   └── ...
├── packages/               # Shared libraries across apps (optional)
│   └── ...
├── scripts/                # Helper scripts/CLI automation
│   ├── seed-neo4j.ts       # Initialize hackathon data, e.g. sample projects
│   ├── rating-calc.ts      # Possibly script for offline rating calculations or migrations
│   └── ...
├── turbo.json              # Turborepo config
├── pnpm-workspace.yaml     # pnpm workspace definition
├── package.json            # Root-level scripts and devDependencies
└── README.md               # This file
```

### Key Directories

1. **`apps/frontend/`**  
   - **Vite** for the UI.
   - **Dockerfiles**:
     - `Dockerfile.dev` for local dev with hot reload.
     - `Dockerfile` for production builds.
   - Pages include:
     - **Landing page**: Pitches global AI engineer community for hackathons.
     - **User dashboard**: Show user's projects, testimonials, skillsets, collaborator list.
     - **Hackathon listing**: Show past hackathons with finished projects and track winners, plus the current live hackathon accepting submissions.
     - **Project rating**: Allow users to leave feedback on design, functionality, story, etc.

2. **`apps/backend/`**  
   - **Express.js** with TypeScript.  
   - Integrates **LangGraph** for multi-step workflows, e.g. analyzing feedback, generating queries, or orchestrating advanced logic.  
   - Connects to:
     - **AWS S3** for user-uploaded docs (like project images or PDFs).
     - **Neo4j** on ECS for storing hackathon relationships (who collaborated with whom, project skill tags, etc.).
     - **OpenSearch** or **Neo4j** for storing and searching vector embeddings (via Gemini) for advanced "project similarity" or "user synergy" queries.

3. **`infra/`**  
   - **docker-compose.yml**: For local dev, spins up Neo4j (optionally), the backend, and the frontend.  
   - **`aws/ecs-neo4j-config/`**: Defines how we run Neo4j in AWS ECS (Fargate or EC2-based tasks).  
   - **`aws/s3-setup.md`**: Docs for creating S3 buckets for storing user project assets.  
   - **`aws/google-drive-docs/`**: If you let users import documents from Google Drive, store relevant integration scripts or references here.

4. **`packages/`** (optional)  
   - If you have shared code (utilities, rating algorithms, or AI-based synergy scoring), place them in subfolders.  
   - **pnpm** automatically handles linking across your workspace.

5. **`scripts/`**  
   - **`seed-neo4j.ts`**: Possibly seeds the database with initial hackathon data, user profiles, sample feedback, etc.  
   - **`rating-calc.ts`**: Could be a script that recalculates project ratings or does migrations if you update your rating logic.

---

## Intent & Features

1. **Docker-based Development**  
   - Each app has a dev Dockerfile for immediate reloading.  
   - `infra/docker-compose.yml` can run the entire stack: Neo4j, the backend, and the frontend.

2. **AWS ECS for Neo4j**  
   - We use AWS ECS to run a **self-hosted Neo4j** container. This is essential for storing hackathon user relationships, project nodes, and rating edges.  
   - The `ecs-neo4j-config/` folder helps define or store the ECS task definition.

3. **S3 for File Uploads**  
   - Project media, user profile pictures, or hackathon promotional banners go to **S3**.  
   - The backend manages these uploads, storing metadata in Neo4j or a separate index.

4. **OpenSearch & Gemini Embeddings**  
   - For advanced "similar project search," we embed user texts or project descriptions with Gemini.  
   - The vector store can be in **OpenSearch** or a Neo4j vector index. This means we can do similarity-based queries to show relevant projects, user synergy, or recommended hackathon tracks.

5. **Google Drive Integration (Optional)**  
   - If you want to allow users to import docs from their Drive for hackathon submissions, you can store that code in the backend and the integration details in `infra/aws/google-drive-docs/`.

6. **LangGraph** (Backend)  
   - The backend orchestrates multi-step logic (e.g. rating analysis, synergy predictions) with **LangGraph**.  
   - Code might be in `apps/backend/src/langgraph/`, with typical files (`graph.ts`, `prompts.ts`, etc.).

---

## Development Workflow

1. **pnpm Install**  
   ```bash
   pnpm install
   ```
   Installs dependencies across the entire monorepo.

2. **Local Docker**  
   In `infra/`, run:
   ```bash
   docker compose up --build
   ```
   This spins up Neo4j, backend (Express + LangGraph), frontend (Vite).

   Alternatively, run them separately:
   ```bash
   pnpm --filter=backend dev
   pnpm --filter=frontend dev
   ```

3. **AWS ECS Deployment**  
   The folder `infra/aws/ecs-neo4j-config/` or any Terraform/Copilot scripts define how to host Neo4j in ECS.

   The backend and frontend each have Dockerfiles you can build/push to ECR, then define ECS services.

   S3, OpenSearch, and other resources can be configured via AWS console or IaC in the same folder.

4. **Credentials & Env Variables**  
   Manage environment variables (S3 buckets, Google OAuth secrets, etc.) through `.env` in dev and ECS secrets in production.

---

## Hackathon Features

1. **User Dashboards**:
   - Show each user's projects, skillsets, testimonials, and collaborators.
   - Possibly display recommendations for future hackathons or collaboration partners.

2. **Hackathon Page**:
   - Lists past hackathons and submitted projects, with each track or category.
   - Shows the live hackathon that's currently open for submissions (start/end date, rules, etc.).
   - Users can leave feedback or ratings (Story, Design, Function) plus open-ended comments.

3. **Ratings & Comments**:
   - Users can see aggregate ratings for each project.
   - Possibly the backend uses LangGraph to summarize feedback or highlight key points.

4. **Landing Page**:
   - Showcases a global community of AI engineers, encouraging signups for hackathons.
   - Integration with social media or Google auth if desired.

---

## Production Considerations

1. **Dockerfiles**
   - Each app's Dockerfile (production) is likely multi-stage, building minimal images for ECS.

2. **ECS**
   - Push images to ECR, define tasks for backend, frontend, plus the Neo4j container.
   - Possibly store user-generated data (S3), connect to OpenSearch for vector search.

3. **Security**
   - Keep secrets in AWS Secrets Manager or ECS Task Definition secrets.
   - Use IAM roles to allow the backend container to read/write S3, query OpenSearch, etc.

---

## Conclusion

This hackathon hosting platform uses:

- Turborepo + pnpm for consolidated multi-app dev
- Docker for local dev/prod builds
- Neo4j on AWS ECS to store project, user, and hackathon relationships
- S3 for storing user-uploaded assets (banners, docs, images)
- OpenSearch or Neo4j vectors for advanced search with Gemini embeddings
- LangGraph in the backend to orchestrate multi-step rating or synergy logic

By leveraging this structure, you can easily build robust hackathon management features, from user dashboards to track-based submissions, while scaling seamlessly in AWS. It's flexible for both local development and production-ready container deployments. Enjoy building your Hackathon Hosting Platform!
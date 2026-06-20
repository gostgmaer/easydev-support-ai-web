# EasyDev Support AI - Backend Architecture & End-to-End Plan

This document serves as the master blueprint for the EasyDev Support AI platform, designed to support **10,000+ tenants, 100,000+ agents, and 10,000,000+ conversations/month**.

---

## 1. Complete Domain Design & 2. Bounded Contexts

We adopt Domain-Driven Design (DDD) with clear Bounded Contexts. Each context encapsulates its own entities, repositories, and business logic, connected via asynchronous events.

*   **Conversations Context**: `Conversations`, `Messages`, `Tags`, `Notes`, `Attachments`. Handles the realtime unified inbox.
*   **Customers Context**: `Customers`, `Customer_Segments`, `CSAT`. Handles Customer 360 view and lifetime tracking.
*   **Ticketing Context**: `Tickets`, `Ticket_Comments`, `Ticket_SLA`. Handles escalations and traditional email-based support.
*   **Teams Context**: `Teams`, `Agent_Profiles`. Handles skill-based routing, shifts, and agent metadata (Auth is delegated to IAM).
*   **Channels Context**: `Channels`, `Channel_Configurations`. Handles webhook ingestions from WhatsApp, Email, FB Messenger, etc.
*   **Knowledge Context**: `Knowledge_Documents`, `Knowledge_Sources`. Orchestrates document ingestion via the EasyDev AI Platform.
*   **Connectors Context**: `Connectors`, `Connector_Instances`, `Logs`. The dynamic registry mapping intents to client API calls (e.g., Shopify).
*   **Workflows Context**: `Workflows`, `Workflow_Executions`. The visual rule engine.
*   **Analytics Context**: `Analytics_Events`, `Audit_Logs`. Event sourcing for reporting.

---

## 3. Complete Database Design (PostgreSQL)

Every table enforces Multi-Tenancy strictly via a composite primary key or indexed `tenant_id` column.

```sql
-- Core Foundation
CREATE TABLE customers (id UUID, tenant_id UUID, name VARCHAR, email VARCHAR, phone VARCHAR, ltv DECIMAL, sentiment VARCHAR, PRIMARY KEY (id, tenant_id));
CREATE TABLE teams (id UUID, tenant_id UUID, name VARCHAR, routing_strategy VARCHAR);
CREATE TABLE agent_profiles (user_id UUID, tenant_id UUID, team_id UUID, skills JSONB);

-- Conversations & Messaging
CREATE TABLE conversations (id UUID, tenant_id UUID, customer_id UUID, status VARCHAR, channel_id UUID, priority VARCHAR);
CREATE TABLE messages (id UUID, tenant_id UUID, conversation_id UUID, sender_type VARCHAR, content TEXT, attachments JSONB, created_at TIMESTAMP);
CREATE TABLE conversation_notes (id UUID, tenant_id UUID, conversation_id UUID, agent_id UUID, note TEXT);
CREATE TABLE conversation_tags (conversation_id UUID, tag VARCHAR, tenant_id UUID);

-- Tickets & SLA
CREATE TABLE tickets (id UUID, tenant_id UUID, customer_id UUID, subject VARCHAR, status VARCHAR, priority VARCHAR, assignee_id UUID, due_date TIMESTAMP);
CREATE TABLE ticket_comments (id UUID, tenant_id UUID, ticket_id UUID, content TEXT, is_internal BOOLEAN);
CREATE TABLE ticket_sla (id UUID, tenant_id UUID, policy_name VARCHAR, response_time_mins INT, resolution_time_mins INT);

-- Channels & Connectors
CREATE TABLE channels (id UUID, tenant_id UUID, provider VARCHAR, status VARCHAR);
CREATE TABLE channel_configurations (channel_id UUID, tenant_id UUID, credentials JSONB, webhook_url VARCHAR);
CREATE TABLE connectors (id UUID, name VARCHAR, auth_type VARCHAR); -- Global System Level
CREATE TABLE connector_instances (id UUID, tenant_id UUID, connector_id UUID, credentials JSONB, status VARCHAR);
CREATE TABLE connector_capabilities (connector_instance_id UUID, capability VARCHAR, endpoint VARCHAR, mapping JSONB);

-- Knowledge & Automation
CREATE TABLE knowledge_documents (id UUID, tenant_id UUID, source_type VARCHAR, url VARCHAR, sync_status VARCHAR);
CREATE TABLE workflows (id UUID, tenant_id UUID, name VARCHAR, definition JSONB, version INT, is_published BOOLEAN);
CREATE TABLE workflow_executions (id UUID, tenant_id UUID, workflow_id UUID, status VARCHAR, logs JSONB);

-- Analytics & Auditing
CREATE TABLE analytics_events (id UUID, tenant_id UUID, event_type VARCHAR, payload JSONB, created_at TIMESTAMP);
CREATE TABLE audit_logs (id UUID, tenant_id UUID, user_id UUID, action VARCHAR, resource VARCHAR, created_at TIMESTAMP);
```

---

## 4. NestJS Module Structure & 5. Folder Structure

```text
src/
├── common/                # Multi-tenant interceptors, IAM Guards, decorators
├── config/                # Environment, Redis, DB configs
├── modules/
│   ├── ai/                # Client for EasyDev AI Platform (/v1/generate, /v1/classify)
│   ├── analytics/         # TimescaleDB/Postgres event tracking
│   ├── channels/          # Webhook receivers (WhatsApp, Facebook, etc.)
│   ├── connectors/        # Marketplace integration logic (Dynamic Axios calls)
│   ├── conversations/     # Chat logic & Socket.IO Gateway
│   ├── customers/         # Customer 360 data management
│   ├── iam/               # Client for EasyDev IAM Service (Token validation)
│   ├── knowledge/         # Syncs docs to EasyDev AI /v1/documents/ingest
│   ├── teams/             # Agent profiles and routing logic
│   ├── tickets/           # Ticket CRUD and SLA Engine
│   └── workflows/         # BullMQ processing pipeline
├── queue/                 # BullMQ Processor definitions
└── main.ts
```

---

## 7. Event Driven Architecture & 8. BullMQ Queue Design

To handle 10,000,000+ messages/month without dropping webhooks:

1.  **Ingestion Queue (`incoming-messages`)**: 
    *   *Trigger*: A channel webhook (e.g., WhatsApp) hits `/v1/channels/whatsapp/webhook`.
    *   *Action*: Saved instantly to DB, pushed to `incoming-messages`. API returns 200 OK immediately.
2.  **AI Pipeline Queue (`ai-processing`)**:
    *   *Trigger*: Worker picks up `incoming-messages`.
    *   *Action*: Calls EasyDev AI `/v1/classify` for Intent. Analyzes Sentiment.
3.  **Workflow Queue (`workflow-execution`)**:
    *   *Trigger*: Intent mapped to a workflow (e.g., `ORDER_TRACKING`).
    *   *Action*: Evaluates node JSON. If Connector is needed, dispatches to `connector-tasks`.
4.  **Connector Queue (`connector-tasks`)**:
    *   *Action*: Safely executes outbound HTTP calls to Shopify/Salesforce with rate-limiting and retry logic.
5.  **Realtime Sync**:
    *   *Action*: After processing, an event is emitted via Redis Pub/Sub to the Socket.IO Gateway to push updates to the UI.

---

## 10. Multi Tenant Strategy

*   **Database Level**: All repositories automatically append `.where('tenant_id = :tenantId')`. We use a custom TypeORM `BaseTenantEntity`.
*   **API Level**: An IAM Guard validates the JWT from `EasyDev IAM`, extracts the `tenant_id`, and attaches it to the Express Request context.
*   **Queue Level**: Every BullMQ job payload contains `{ tenantId, data }` to ensure workers act within the correct context.

---

## 12. Connector Framework Architecture

The framework acts as an abstraction layer between the AI and external APIs.
1.  **AI Action Request**: "Find Order ORD-123".
2.  **Capability Lookup**: System checks `connector_capabilities` for `ORDER_TRACKING` mapped to this tenant.
3.  **Transformation**: The framework uses `JSONPath` or `Handlebars` to map the AI's entity `ORD-123` to the Shopify REST URL `/admin/api/2026/orders/123.json`.
4.  **Execution & Return**: The response is fetched, simplified, and fed back into the EasyDev AI `/v1/workflows/{workflowId}/tool-results` endpoint.

---

## 18. Deployment Architecture & 24. Scaling Strategy

*   **Kubernetes**: Deployed via Helm.
*   **API Pods**: Stateless NestJS API pods scaling horizontally based on CPU/Memory via HPA (Horizontal Pod Autoscaler).
*   **Worker Pods**: Dedicated NestJS pods running ONLY BullMQ processors, scaled based on Queue Depth (using KEDA).
*   **PostgreSQL**: Highly Available Cluster (Primary + Read Replicas). CQRS is applied; reporting queries hit read replicas.
*   **Redis**: Redis Cluster for Socket.IO adapter state, BullMQ locking, and caching.
*   **Observability**: Prometheus scraping metrics (Active connections, Queue length, Request duration). OpenTelemetry tracing a message from Webhook -> DB -> Queue -> AI -> UI.

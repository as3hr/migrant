# Migrant

Migrant is being built as an engineering intelligence layer that keeps databases and codebases in sync.

---

## The Problem

Modern applications rarely rely on a single source of truth. As engineering systems grow, teams end up managing multiple databases (production, staging, analytics), microservices, background workers, and codebases in different languages—all interacting with the same underlying data.

Understanding how these fragmented systems connect is painful and manual:

* **What tables, columns, and relationships exist** across different databases?
* **Which specific codebase or microservice depends** on a particular table or column?
* **What happens if a column or constraint is changed or removed?** Will it silently break a service?
* **Are production, staging, and dev schemas actually consistent?**
* **How do access controls and RLS policies** protect data across tables?

Existing database tools only inspect or query a single database in isolation. They don't understand the surrounding engineering context, the applications consuming the data, or the relationships across multiple environments.

---

## What We Have Done

We built the core foundation of Migrant, focusing first on deep database introspection and natural language retrieval directly in the CLI:

* **Interactive Terminal Interface:** Built with React + Ink for a fast, responsive CLI experience.
* **Authentication & Keyring Integration:** Secure web login flow via Supabase, with sessions stored locally in SQLite and database credentials saved directly in OS credential keychains.
* **PostgreSQL Schema Scanner:** Deep extraction of database schemas, tables, columns, data types, primary keys, foreign key relationships, and constraints.
* **Knowledge Indexing & RAG:** Structuring schema data into searchable knowledge representations and vector embeddings using `pgvector` and vector search.
* **Natural Language Query Engine:** Ask natural language questions in the CLI about connected database structures and relationships, powered by multi-provider LLM integrations (OpenAI, Anthropic, DeepSeek, Groq, OpenRouter).
* **Multi-Database Workspaces:** Support for connecting, persisting, and switching between multiple databases (e.g., `production`, `staging`) inside a single local workspace.

---

## What We Are Doing & Planning To Do

We are evolving Migrant from pure schema QA into systemic engineering intelligence:

* **Query Routing:** Smart classification of user queries to route between direct schema lookups, live database queries, multi-database comparisons, and LLM reasoning.
* **Schema Freshness & Drift Detection:** Automatically detecting schema changes in connected databases and re-indexing knowledge without requiring manual user rescans.
* **Multi-Database Intelligence:** Answering comparative queries across environments (e.g., *"Compare the users table schema between production and staging"*).
* **Codebase & Service Graph Integration:** Scanning application codebases (TypeScript, Go, Python, etc.) to map exact code references, queries, and ORM models to database tables and columns.
* **Impact Analysis:** Pre-evaluating schema migrations to show what breaks before applying a change (e.g., *"Which services will break if I rename user_id?"*).
* **Security & Policy Audit:** Introspecting PostgreSQL Row Level Security (RLS) policies and permissions to explain who can access what data.

---

## The Goal

The ultimate goal for Migrant is to serve as the unified brain between data infrastructure and application code.

Instead of developers manually digging through migrations, scattered ORMs, microservice repositories, and database tools, Migrant maintains a living map of how databases and codebases depend on each other—keeping your entire engineering system connected, understood, and in sync.
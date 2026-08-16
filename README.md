# Migrant

Migrant is a developer tool for understanding databases and the systems built around them.

Modern applications rarely have a single source of truth. A team may have multiple databases, multiple services, and multiple codebases that depend on the same data. Understanding how these systems relate to each other becomes increasingly difficult as they evolve.

Migrant is being built to solve this problem.

## The Problem

Developers spend a significant amount of time answering questions about existing systems.

Which tables exist?

What relationships exist between them?

Which services depend on a particular table?

What happens if a column or constraint is changed?

Are the schemas in production and staging still consistent?

Which parts of the codebase depend on a database structure?

These questions become harder when a team has multiple databases or multiple codebases using the same database.

Existing database tools are generally focused on inspecting or querying a database. They do not provide a complete understanding of the engineering context surrounding that database.

Migrant aims to provide that layer.

## Current Focus

The current implementation focuses on database understanding.

Migrant can currently:

* Authenticate developers through the Migrant web application
* Connect to PostgreSQL databases
* Connect multiple databases within the same workspace
* Persist database connections locally
* Store database credentials using the operating system credential store
* Restore sessions after restarting the CLI
* Scan database schemas
* Extract tables, columns, relationships and constraints
* Index database knowledge for retrieval
* Answer natural language questions about database structure
* Switch between connected databases
* Track database scanning state
* Remove local sessions and credentials on logout

Example:

```text
$ asher [production, staging] >

> what relationships does the users table have?

Migrant:
...
````

## Architecture

The current system is built around several components.

```text
CLI
 |
 + Auth
 |
 + Workspace
 |
 + Database Connections
 |
 + Schema Scanner
 |
 + Knowledge Index
 |
 + Query Engine
 |
 + LLM
```

Local workspace information is stored using SQLite.

Database credentials are stored using the operating system credential store rather than being stored directly in the local database.

Supabase is currently used for authentication and remote storage of indexed database knowledge.

## What Is Being Built

The next stage is focused on making Migrant better at understanding database systems rather than simply retrieving individual schema records.

### Query Routing

Migrant needs to determine what a question actually requires.

For example:

```text
What columns does users have?
```

may only require schema retrieval.

While:

```text
Give me an overview of this database.
```

may require multiple pieces of database knowledge.

Eventually a query router will determine whether a question requires:

```text
Schema retrieval
Live database queries
Multiple databases
LLM reasoning
```

### Database Freshness

Database schemas change continuously.

Migrant should detect when its stored understanding of a database is outdated without requiring developers to manually run a scan.

The planned approach is to compare a representation of the current database schema against the previously indexed schema.

If the schema has changed, Migrant can update its indexed knowledge before answering the query.

### Multi Database Intelligence

Migrant is being designed around multiple connected databases.

For example:

```text
production
staging
analytics
```

A future query could be:

```text
Compare the users table between production and staging.
```

Migrant should be able to retrieve the relevant information from both databases and provide a single answer.

### Codebase Understanding

A larger goal is to connect database knowledge with codebase knowledge.

Many teams have multiple services or codebases interacting with the same database.

For example:

```text
TypeScript service
        |
        v
     Database
        ^
        |
Go service
```

A database change can therefore affect multiple systems.

Migrant is intended to eventually understand these relationships and detect changes across both database schemas and codebases.

## Long Term Direction

The long term goal is to build an engineering intelligence layer that keeps databases and codebases synchronized.

Migrant should eventually help developers answer questions such as:

```text
Which codebases depend on this table?

What services use this column?

What will be affected if this foreign key is removed?

Are production and staging schemas different?

Which database does this service depend on?

What changed in the database since the last scan?

Did this schema change break anything in the codebase?

```

Another planned area is database security and management, including understanding and managing database access policies such as PostgreSQL RLS policies.

## Development Status

Migrant is currently under active development.

The current focus is:

```text
Database connections
        ↓
Persistent workspaces
        ↓
Schema scanning
        ↓
Database knowledge
        ↓
Query routing
        ↓
Freshness detection
        ↓
Multi database reasoning
        ↓
Codebase understanding
```

The architecture and APIs are expected to change as these problems are explored.

## Technology

Current technologies include:

* TypeScript
* Node.js
* PostgreSQL
* pgvector
* Supabase
* SQLite
* better-sqlite3
* Ink
* React
* Drizzle

## Why Migrant Exists

Database knowledge is often distributed across schemas, migrations, documentation, services and codebases.

Developers should not have to reconstruct that knowledge manually every time they work on an unfamiliar system.

Migrant is an attempt to make that knowledge accessible directly from the developer's environment.

## License

License information will be added before the first release.
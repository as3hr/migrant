import { describe, expect, test } from "bun:test";
import { parseAndValidatePgUrl } from "../src/infrastructure/commands/command_helpers.ts";

describe("parseAndValidatePgUrl", () => {
  test("should successfully parse a valid postgresql:// URL", () => {
    const url = "postgresql://user:password@localhost:5432/mydatabase";
    const result = parseAndValidatePgUrl(url);

    expect(result.isValid).toBe(true);
    expect(result.host).toBe("localhost");
    expect(result.port).toBe(5432);
    expect(result.database).toBe("mydatabase");
    expect(result.sslmode).toBeNull();
  });

  test("should successfully parse a valid postgres:// URL with sslmode", () => {
    const url = "postgres://postgres.loviktxrnsyuxozcpcvk:migrant-dev-987!@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require";
    const result = parseAndValidatePgUrl(url);

    expect(result.isValid).toBe(true);
    expect(result.host).toBe("aws-0-ap-northeast-2.pooler.supabase.com");
    expect(result.port).toBe(6543);
    expect(result.database).toBe("postgres");
    expect(result.sslmode).toBe("require");
  });

  test("should fail if URL does not start with postgres:// or postgresql://", () => {
    const url = "mysql://user:password@localhost:3306/mydb";
    const result = parseAndValidatePgUrl(url);

    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Must start with postgres:// or postgresql://");
  });

  test("should fail on empty string", () => {
    const result = parseAndValidatePgUrl("   ");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Connection string is empty.");
  });

  test("should default to port 5432 if not specified", () => {
    const url = "postgres://user:password@localhost/testdb";
    const result = parseAndValidatePgUrl(url);

    expect(result.isValid).toBe(true);
    expect(result.port).toBe(5432);
  });

  test("should fail if database name is missing", () => {
    const url = "postgres://user:password@localhost:5432/";
    const result = parseAndValidatePgUrl(url);

    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Database name is missing.");
  });

  test("should fail if port is invalid", () => {
    const url = "postgres://user:password@localhost:999999/testdb";
    const result = parseAndValidatePgUrl(url);

    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Malformed connection string.");
  });

  test("should handle URL encoded passwords and usernames", () => {
    const url = "postgres://user%40domain.com:pass%23word@localhost:5432/mydb";
    const result = parseAndValidatePgUrl(url);

    expect(result.isValid).toBe(true);
    expect(result.host).toBe("localhost");
    expect(result.database).toBe("mydb");
  });
});

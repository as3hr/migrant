import { describe, expect, test } from "bun:test";

const add = (a: number, b: number): number => a + b;

describe("Math Operations", () => {
  test("should correctly add two numbers", () => {
    expect(add(2, 3)).toBe(5);
  });

  test("should handle negative numbers", () => {
    expect(add(-1, -1)).toBe(-2);
  });
});
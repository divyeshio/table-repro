import { faker } from "@faker-js/faker";
import type { Person } from "../types/person";

// Seed faker for deterministic output across hot-reloads
faker.seed(42);

const ROLES = ["Engineer", "Designer", "Manager", "Analyst", "Director"] as const;
const DEPARTMENTS = ["Engineering", "Design", "Product", "Sales", "Marketing"] as const;
const TAGS = ["remote", "senior", "contractor", "intern", "lead"] as const;

export function generatePersons(count = 3000): Person[] {
  return Array.from({ length: count }, (_, i) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const name = `${firstName} ${lastName}`;
    const email = faker.internet.email({ firstName, lastName });

    const role = faker.helpers.arrayElement(ROLES);
    const department = faker.helpers.arrayElement(DEPARTMENTS);
    const status: Person["status"] = faker.helpers.weightedArrayElement([
      { weight: 8, value: "Active" },
      { weight: 2, value: "Inactive" },
    ]);

    const tagCount = faker.number.int({ min: 0, max: 3 });
    const tags = faker.helpers.arrayElements(TAGS, tagCount);

    const joinedAt = faker.date
      .between({ from: "2018-01-01", to: "2024-12-31" })
      .toISOString()
      .split("T")[0]!;

    const updatedOn = faker.date
      .between({ from: "2024-01-01", to: "2025-04-01" })
      .toISOString();
    const lastAccessedOn = faker.date
      .between({ from: updatedOn, to: "2025-04-01" })
      .toISOString();

    return {
      id: `person-${i + 1}`,
      name,
      email,
      age: faker.number.int({ min: 22, max: 62 }),
      role,
      department,
      status,
      salary: faker.number.int({ min: 40_000, max: 160_000 }),
      isLiked: faker.datatype.boolean({ probability: 0.3 }),
      tags,
      joinedAt,
      notes: faker.lorem.sentence(),
      avatarUrl: faker.image.avatar(),
      updatedOn,
      lastAccessedOn,
    };
  });
}

/** All 3000 persons — generated once, shared across the app */
export const ALL_PERSONS: Person[] = generatePersons(3000);

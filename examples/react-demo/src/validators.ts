import { createValidatorRegistry } from "@formknot/core";

/** Shared validator registry demonstrating an asynchronous custom validator referenced from a schema by id only. */
export const demoValidators = createValidatorRegistry();

const TAKEN_EMAILS = new Set(["taken@example.com", "admin@formknot.dev"]);

demoValidators.register("uniqueEmail", async ({ value }) => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return TAKEN_EMAILS.has(String(value).toLowerCase()) ? "This email address is already registered" : undefined;
});

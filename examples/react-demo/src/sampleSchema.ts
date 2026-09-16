import type { FormKnotSchema } from "@formknot/core";

/**
 * A realistic sample schema demonstrating: conditional fields (company name
 * shown only for business customers), every built-in validation rule type,
 * an async custom validator ("uniqueEmail"), and a custom "currency" field.
 */
export const sampleSchema = {
  id: "customer-onboarding",
  title: "Customer onboarding",
  description: "Tell us about yourself so we can set up your account.",
  version: 1,
  settings: {
    clearHiddenFieldValues: true,
    validateVisibleFieldsOnly: true,
    submitButtonLabel: "Create account",
    resetButtonLabel: "Clear form",
  },
  fields: [
    {
      id: "f-customerType",
      type: "select",
      name: "customerType",
      label: "Customer type",
      required: true,
      defaultValue: "individual",
      options: [
        { id: "o-individual", label: "Individual", value: "individual" },
        { id: "o-company", label: "Company", value: "company" },
      ],
      validations: [{ id: "v-customerType-required", type: "required", message: "Please select a customer type" }],
    },
    {
      id: "f-companyName",
      type: "text",
      name: "companyName",
      label: "Company name",
      placeholder: "Acme, Inc.",
      validations: [{ id: "v-companyName-required", type: "required", message: "Company name is required for business accounts" }],
      conditions: {
        strategy: "all",
        rules: [{ id: "c-companyName", sourceField: "customerType", operator: "equals", value: "company", action: "show" }],
      },
    },
    {
      id: "f-fullName",
      type: "text",
      name: "fullName",
      label: "Full name",
      required: true,
      autoComplete: "name",
      validations: [
        { id: "v-fullName-required", type: "required", message: "Full name is required" },
        { id: "v-fullName-minLength", type: "minLength", value: 2, message: "Full name must be at least 2 characters" },
      ],
    },
    {
      id: "f-email",
      type: "email",
      name: "email",
      label: "Email address",
      required: true,
      autoComplete: "email",
      description: "We'll send your confirmation here. Try taken@example.com to see the async check fail.",
      validations: [
        { id: "v-email-required", type: "required", message: "Email is required" },
        { id: "v-email-format", type: "email", message: "Enter a valid email address" },
        { id: "v-email-unique", type: "custom", validatorId: "uniqueEmail", message: "This email address is already registered" },
      ],
    },
    {
      id: "f-amount",
      type: "currency",
      name: "openingDeposit",
      label: "Opening deposit",
      description: "Custom field type registered by the demo app.",
      defaultValue: 100,
      metadata: { currency: "USD" },
      validations: [{ id: "v-amount-min", type: "min", value: 25, message: "Minimum opening deposit is $25" }],
    },
    {
      id: "f-plan",
      type: "radio",
      name: "plan",
      label: "Plan",
      required: true,
      defaultValue: "free",
      options: [
        { id: "o-free", label: "Free", value: "free" },
        { id: "o-pro", label: "Pro", value: "pro" },
        { id: "o-enterprise", label: "Enterprise", value: "enterprise" },
      ],
    },
    {
      id: "f-interests",
      type: "checkboxGroup",
      name: "interests",
      label: "What are you interested in?",
      options: [
        { id: "o-forms", label: "Dynamic forms", value: "forms" },
        { id: "o-validation", label: "Validation", value: "validation" },
        { id: "o-automation", label: "Workflow automation", value: "automation" },
      ],
    },
    {
      id: "f-startDate",
      type: "date",
      name: "startDate",
      label: "Preferred start date",
      attributes: { min: "2026-01-01" },
    },
    {
      id: "f-notes",
      type: "textarea",
      name: "notes",
      label: "Anything else we should know?",
      attributes: { rows: 4, maxLength: 500 },
      validations: [{ id: "v-notes-maxLength", type: "maxLength", value: 500, message: "Please keep notes under 500 characters" }],
    },
    {
      id: "f-newsletter",
      type: "checkbox",
      name: "newsletter",
      label: "Send me product updates",
      defaultValue: true,
    },
    {
      id: "f-referral",
      type: "hidden",
      name: "referralSource",
      label: "Referral source",
      defaultValue: "formknot-demo",
    },
  ],
} as unknown as FormKnotSchema;

import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createValidatorRegistry, type FormKnotSchema } from "@formknot/core";
import { FormKnotForm } from "./FormKnotForm";
import { createFormKnotFieldRegistry } from "./fieldRegistry";
import type { FormKnotFieldComponentProps } from "./types";

function schema(fields: FormKnotSchema["fields"], settings?: FormKnotSchema["settings"]): FormKnotSchema {
  return { id: "s1", version: 1, fields, settings };
}

describe("FormKnotForm built-in fields", () => {
  it("renders a text field with label, description, and submits its value", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <FormKnotForm
        schema={schema([{ id: "f1", type: "text", name: "fullName", label: "Full name", description: "As it appears on your ID" }])}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByText("As it appears on your ID")).toBeInTheDocument();
    const input = screen.getByLabelText("Full name");
    await user.type(input, "Ada Lovelace");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].data.fullName).toBe("Ada Lovelace");
    expect(onSubmit.mock.calls[0][0].valid).toBe(true);
  });

  it("renders a select field with options", async () => {
    const user = userEvent.setup();
    render(
      <FormKnotForm
        schema={schema([
          {
            id: "f1",
            type: "select",
            name: "plan",
            label: "Plan",
            options: [
              { id: "o1", label: "Free", value: "free" },
              { id: "o2", label: "Pro", value: "pro" },
            ],
          },
        ])}
      />
    );
    await user.selectOptions(screen.getByLabelText("Plan"), "pro");
    expect((screen.getByLabelText("Plan") as HTMLSelectElement).value).toBe("pro");
  });

  it("renders a radio group inside a fieldset/legend", async () => {
    render(
      <FormKnotForm
        schema={schema([
          {
            id: "f1",
            type: "radio",
            name: "size",
            label: "Size",
            options: [
              { id: "o1", label: "Small", value: "s" },
              { id: "o2", label: "Large", value: "l" },
            ],
          },
        ])}
      />
    );
    const group = await screen.findByRole("group", { name: "Size" });
    expect(within(group).getByLabelText("Small")).toBeInTheDocument();
    expect(within(group).getByLabelText("Large")).toBeInTheDocument();
  });

  it("renders a checkbox group and toggles multiple values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <FormKnotForm
        schema={schema([
          {
            id: "f1",
            type: "checkboxGroup",
            name: "toppings",
            label: "Toppings",
            options: [
              { id: "o1", label: "Cheese", value: "cheese" },
              { id: "o2", label: "Olives", value: "olives" },
            ],
          },
        ])}
        onSubmit={onSubmit}
      />
    );
    await user.click(screen.getByLabelText("Cheese"));
    await user.click(screen.getByLabelText("Olives"));
    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].data.toppings.sort()).toEqual(["cheese", "olives"]);
  });

  it("applies initialValues and defaultValue", async () => {
    render(
      <FormKnotForm
        schema={schema([{ id: "f1", type: "text", name: "city", label: "City", defaultValue: "Default City" }])}
        initialValues={{ city: "Initial City" }}
      />
    );
    expect(await screen.findByLabelText("City")).toHaveValue("Initial City");
  });

  it("falls back to defaultValue when no initialValues override it", async () => {
    render(<FormKnotForm schema={schema([{ id: "f1", type: "text", name: "city", label: "City", defaultValue: "Default City" }])} />);
    expect(await screen.findByLabelText("City")).toHaveValue("Default City");
  });

  it("hides the default Submit/Reset actions when the schema has only hidden fields", async () => {
    render(<FormKnotForm schema={schema([{ id: "f1", type: "hidden", name: "trackingId", label: "Tracking ID", defaultValue: "abc" }])} />);
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Submit" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Reset" })).not.toBeInTheDocument();
    });
  });

  it("shows the default Submit/Reset actions once a visible field exists alongside a hidden one", async () => {
    render(
      <FormKnotForm
        schema={schema([
          { id: "f1", type: "hidden", name: "trackingId", label: "Tracking ID", defaultValue: "abc" },
          { id: "f2", type: "text", name: "name", label: "Name" },
        ])}
      />
    );
    expect(await screen.findByRole("button", { name: "Submit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
  });
});

describe("FormKnotForm validation", () => {
  it("shows a required-field error message on submit and in the error summary", async () => {
    const user = userEvent.setup();
    render(
      <FormKnotForm
        schema={schema([
          { id: "f1", type: "text", name: "name", label: "Name", validations: [{ id: "v1", type: "required", message: "Name is required" }] },
        ])}
      />
    );
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findAllByText("Name is required")).not.toHaveLength(0);
  });

  it("associates the error message with the field via aria-describedby", async () => {
    const user = userEvent.setup();
    render(
      <FormKnotForm
        schema={schema([
          { id: "f1", type: "text", name: "name", label: "Name", validations: [{ id: "v1", type: "required", message: "Name is required" }] },
        ])}
      />
    );
    await user.click(screen.getByRole("button", { name: "Submit" }));
    const input = await screen.findByLabelText("Name");
    await waitFor(() => expect(input).toHaveAttribute("aria-invalid", "true"));
    expect(input.getAttribute("aria-describedby")).toContain("f1-error");
  });

  it("runs a registered async custom validator", async () => {
    const user = userEvent.setup();
    const validators = createValidatorRegistry();
    validators.register("uniqueEmail", async ({ value }) => (value === "taken@example.com" ? "Already registered" : undefined));
    const onSubmit = vi.fn();
    render(
      <FormKnotForm
        schema={schema([
          {
            id: "f1",
            type: "email",
            name: "email",
            label: "Email",
            validations: [{ id: "v1", type: "custom", validatorId: "uniqueEmail", message: "Already registered" }],
          },
        ])}
        validators={validators}
        onSubmit={onSubmit}
      />
    );
    await user.type(screen.getByLabelText("Email"), "taken@example.com");
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByText("Already registered")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("prevents duplicate submissions while one is in flight", async () => {
    const user = userEvent.setup();
    let resolveSubmit: () => void = () => {};
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => (resolveSubmit = resolve)));
    render(<FormKnotForm schema={schema([{ id: "f1", type: "text", name: "name", label: "Name" }])} onSubmit={onSubmit} />);
    const button = screen.getByRole("button", { name: "Submit" });
    await user.click(button);
    await user.click(button);
    await waitFor(() => expect(button).toBeDisabled());
    resolveSubmit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });
});

describe("FormKnotForm conditional behavior", () => {
  const conditionalSchema = schema([
    {
      id: "f1",
      type: "select",
      name: "customerType",
      label: "Customer type",
      options: [
        { id: "o1", label: "Individual", value: "individual" },
        { id: "o2", label: "Company", value: "company" },
      ],
      defaultValue: "individual",
    },
    {
      id: "f2",
      type: "text",
      name: "companyName",
      label: "Company name",
      conditions: { strategy: "all", rules: [{ id: "c1", sourceField: "customerType", operator: "equals", value: "company", action: "show" }] },
    },
  ]);

  it("hides a conditional field until its condition is met, then shows it", async () => {
    const user = userEvent.setup();
    render(<FormKnotForm schema={conditionalSchema} />);
    expect(screen.queryByLabelText("Company name")).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Customer type"), "company");
    expect(await screen.findByLabelText("Company name")).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Customer type"), "individual");
    await waitFor(() => expect(screen.queryByLabelText("Company name")).not.toBeInTheDocument());
  });

  it("disables a field when a disable condition is active", async () => {
    const user = userEvent.setup();
    const disableSchema = schema([
      { id: "f1", type: "checkbox", name: "lockIt", label: "Lock it" },
      {
        id: "f2",
        type: "text",
        name: "locked",
        label: "Locked field",
        conditions: { strategy: "all", rules: [{ id: "c1", sourceField: "lockIt", operator: "equals", value: true, action: "disable" }] },
      },
    ]);
    render(<FormKnotForm schema={disableSchema} />);
    expect(screen.getByLabelText("Locked field")).not.toBeDisabled();
    await user.click(screen.getByLabelText("Lock it"));
    await waitFor(() => expect(screen.getByLabelText("Locked field")).toBeDisabled());
  });
});

describe("FormKnotForm custom fields", () => {
  function CurrencyInput(props: FormKnotFieldComponentProps) {
    return (
      <input
        id={props.id}
        name={props.name}
        data-testid="currency-input"
        value={(props.value as string) ?? ""}
        onChange={(event) => props.onChange(event.target.value)}
        onBlur={props.onBlur}
      />
    );
  }

  it("renders a registered custom field component", async () => {
    const registry = createFormKnotFieldRegistry();
    registry.register("currency", { component: CurrencyInput as never });
    render(
      <FormKnotForm
        schema={schema([{ id: "f1", type: "currency" as never, name: "amount", label: "Amount" }])}
        components={registry}
      />
    );
    expect(await screen.findByTestId("currency-input")).toBeInTheDocument();
  });
});

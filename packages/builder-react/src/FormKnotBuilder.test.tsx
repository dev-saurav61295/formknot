import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FormKnotSchema } from "@formknot/core";
import { FormKnotBuilder } from "./FormKnotBuilder";

function getCanvas() {
  return screen.getByRole("region", { name: "Form canvas" });
}

describe("FormKnotBuilder", () => {
  it("adds a field to the canvas by clicking a palette item", async () => {
    const user = userEvent.setup();
    render(<FormKnotBuilder />);
    await user.click(screen.getByRole("button", { name: "Text" }));
    expect(within(getCanvas()).getByText("New field")).toBeInTheDocument();
  });

  it("selects a field and edits its label through the settings panel", async () => {
    const user = userEvent.setup();
    render(<FormKnotBuilder />);
    await user.click(screen.getByRole("button", { name: "Text" }));
    await user.click(within(getCanvas()).getByText("New field"));

    const labelInput = screen.getByLabelText("Label");
    await user.clear(labelInput);
    await user.type(labelInput, "Full name");
    await user.tab();

    await waitFor(() => expect(within(getCanvas()).getByText("Full name")).toBeInTheDocument());
  });

  it("reorders fields using the move-down control", async () => {
    const user = userEvent.setup();
    render(<FormKnotBuilder />);
    await user.click(screen.getByRole("button", { name: "Text" }));
    await user.click(screen.getByRole("button", { name: "Email" }));

    const rows = () => within(getCanvas()).getAllByRole("listitem");
    expect(within(rows()[0]).getByText("text")).toBeInTheDocument();

    await user.click(within(rows()[0]).getByRole("button", { name: /Move .* down/ }));
    await waitFor(() => expect(within(rows()[0]).getByText("email")).toBeInTheDocument());
  });

  it("duplicates a field", async () => {
    const user = userEvent.setup();
    render(<FormKnotBuilder />);
    await user.click(screen.getByRole("button", { name: "Text" }));
    await user.click(screen.getByRole("button", { name: /Duplicate/ }));
    expect(within(getCanvas()).getAllByRole("listitem")).toHaveLength(2);
  });

  it("deletes a field only after confirming", async () => {
    const user = userEvent.setup();
    render(<FormKnotBuilder />);
    await user.click(screen.getByRole("button", { name: "Text" }));
    await user.click(screen.getByRole("button", { name: /^Delete/ }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(within(getCanvas()).getAllByRole("listitem")).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: /^Delete/ }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Delete" }));
    expect(within(getCanvas()).queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("supports undo and redo", async () => {
    const user = userEvent.setup();
    render(<FormKnotBuilder />);
    await user.click(screen.getByRole("button", { name: "Text" }));
    expect(within(getCanvas()).queryAllByRole("listitem")).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(within(getCanvas()).queryAllByRole("listitem")).toHaveLength(0);

    await user.click(screen.getByRole("button", { name: "Redo" }));
    expect(within(getCanvas()).queryAllByRole("listitem")).toHaveLength(1);
  });

  it("edits validation rules for a field", async () => {
    const user = userEvent.setup();
    render(<FormKnotBuilder />);
    await user.click(screen.getByRole("button", { name: "Text" }));
    await user.click(within(getCanvas()).getByText("New field"));
    await user.click(screen.getByText("Validation"));
    await user.click(screen.getByRole("button", { name: "+ Add validation rule" }));
    expect(screen.getByLabelText("Rule 1 type")).toBeInTheDocument();
  });

  it("edits options for a select field", async () => {
    const user = userEvent.setup();
    render(<FormKnotBuilder />);
    await user.click(screen.getByRole("button", { name: "Select" }));
    await user.click(within(getCanvas()).getByText("New field"));
    expect(screen.getByLabelText("Option 1 label")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "+ Add option" }));
    expect(screen.getByLabelText("Option 3 label")).toBeInTheDocument();
  });

  it("configures a conditional rule referencing another field", async () => {
    const user = userEvent.setup();
    render(<FormKnotBuilder />);
    await user.click(screen.getByRole("button", { name: "Text" }));
    await user.click(screen.getByRole("button", { name: "Text" }));

    const rows = within(getCanvas()).getAllByRole("listitem");
    await user.click(within(rows[1] as HTMLElement).getByText("New field"));
    await user.click(screen.getByText("Conditional logic"));
    await user.click(screen.getByRole("button", { name: "+ Add condition" }));
    expect(screen.getByLabelText(/Rule 1: when field/)).toBeInTheDocument();
  });

  it("exports the current schema and reports it through onExport", async () => {
    const user = userEvent.setup();
    const onExport = vi.fn();
    render(<FormKnotBuilder onExport={onExport} />);
    await user.click(screen.getByRole("button", { name: "Text" }));
    await user.click(screen.getByRole("button", { name: "Export JSON" }));
    expect(onExport).toHaveBeenCalled();
    const textarea = screen.getByLabelText("Exported schema JSON") as HTMLTextAreaElement;
    expect(textarea.value).toContain('"type": "text"');
  });

  it("imports a valid schema and replaces the canvas", async () => {
    const user = userEvent.setup();
    const schema: FormKnotSchema = {
      id: "imported",
      version: 1,
      fields: [{ id: "f1", type: "text", name: "imported_field", label: "Imported field" }],
    };
    render(<FormKnotBuilder />);
    await user.click(screen.getByRole("button", { name: "Import JSON" }));
    await user.click(screen.getByLabelText("Schema JSON to import"));
    await user.paste(JSON.stringify(schema));
    await user.click(screen.getByRole("button", { name: "Import" }));
    await waitFor(() => expect(within(getCanvas()).getByText("Imported field")).toBeInTheDocument());
  });

  it("reports errors for invalid JSON without crashing", async () => {
    const user = userEvent.setup();
    render(<FormKnotBuilder />);
    await user.click(screen.getByRole("button", { name: "Import JSON" }));
    await user.click(screen.getByLabelText("Schema JSON to import"));
    await user.paste("{ not valid json");
    await user.click(screen.getByRole("button", { name: "Import" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("emits the latest valid schema through onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FormKnotBuilder onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Text" }));
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0] as FormKnotSchema;
    expect(lastCall.fields).toHaveLength(1);
  });

  it("renders a live preview reflecting the current schema", async () => {
    const user = userEvent.setup();
    render(<FormKnotBuilder />);
    await user.click(screen.getByRole("button", { name: "Text" }));
    const preview = screen.getByRole("region", { name: "Live preview" });
    await waitFor(() => expect(within(preview).getByText("New field")).toBeInTheDocument());
  });
});

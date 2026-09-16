import { createFormKnotFieldRegistry } from "@formknot/react";
import { CurrencyField } from "./CurrencyField";

/** Shared field-component registry used by both the builder and the standalone renderer, so a "currency" field behaves identically in both places. */
export const demoFieldRegistry = createFormKnotFieldRegistry();

demoFieldRegistry.register("currency", {
  component: CurrencyField,
  label: "Currency",
  defaultConfig: {
    label: "Amount",
    metadata: { currency: "USD" },
  },
});

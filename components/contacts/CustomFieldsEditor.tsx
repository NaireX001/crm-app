"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { updateContactCustomFields } from "@/lib/contacts/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function CustomFieldsEditor({
  contactId,
  initialFields,
}: {
  contactId: string;
  initialFields: Record<string, string>;
}) {
  const [fields, setFields] = useState<{ key: string; value: string }[]>(
    Object.entries(initialFields ?? {}).map(([key, value]) => ({ key, value }))
  );

  function addField() {
    setFields((prev) => [...prev, { key: "", value: "" }]);
  }

  function removeField(index: number) {
    setFields((prev) => prev.filter((_, i) => i !== index));
  }

  function updateField(
    index: number,
    patch: Partial<{ key: string; value: string }>
  ) {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  return (
    <form
      action={updateContactCustomFields}
      className="flex flex-col gap-3 rounded-md border border-gray-200 bg-white p-4"
    >
      <input type="hidden" name="contact_id" value={contactId} />

      {fields.map((f, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            name="field_key"
            placeholder="Field name"
            value={f.key}
            onChange={(e) => updateField(i, { key: e.target.value })}
            className="w-1/3"
          />
          <Input
            name="field_value"
            placeholder="Value"
            value={f.value}
            onChange={(e) => updateField(i, { value: e.target.value })}
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => removeField(i)}
            className="text-gray-400 hover:text-red-600"
            aria-label="Remove field"
          >
            <X size={16} />
          </button>
        </div>
      ))}

      {fields.length === 0 && (
        <p className="text-sm text-gray-500">
          No custom fields yet — add whatever extra info you need for this
          contact.
        </p>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={addField}
          className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
        >
          <Plus size={14} /> Add field
        </button>
        <Button type="submit" variant="secondary">
          Save custom fields
        </Button>
      </div>
    </form>
  );
}

export interface BooleanSettingProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function BooleanSetting({ id, label, checked, onChange }: BooleanSettingProps) {
  return (
    <div className="formknot-builder-setting formknot-builder-setting-boolean">
      <input id={id} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}

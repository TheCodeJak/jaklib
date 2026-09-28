export interface OptionProps {
  value: string;
  children: React.ReactNode;
}

export const Option = ({ value, children }: OptionProps) => (
  <option value={value}>{children}</option>
)
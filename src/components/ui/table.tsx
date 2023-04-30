import { type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export const Table = ({ children }: Props) => {
  return (
    <div className="my-3 w-full overflow-y-auto">
      <table className="w-full">{children}</table>
    </div>
  );
};

export const TableHeadData = ({ children }: Props) => {
  return (
    <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
      {children}
    </th>
  );
};

export const TableHeadRow = ({ children, ...props }: Props) => {
  return (
    <tr className="m-0 border-t p-0 even:bg-muted" {...props}>
      {children}
    </tr>
  );
};

export const TableBodyRow = ({ children, ...props }: Props) => {
  return (
    <tr className="m-0 border-t p-0 even:bg-muted" {...props}>
      {children}
    </tr>
  );
};

export const TableBodyData = ({ children, ...props }: Props) => {
  return (
    <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
      {children}
    </td>
  );
};

import { ArrowDownAZ, ArrowUpAZ } from 'lucide-react';

export default function SortableHeader({ field, label, sort, onSort }) {
  const active = sort.sortBy === field;
  const Icon = active && sort.sortOrder === 'asc' ? ArrowUpAZ : ArrowDownAZ;

  return (
    <th>
      <button className="sort-button" type="button" onClick={() => onSort(field)}>
        <span>{label}</span>
        <Icon size={15} />
      </button>
    </th>
  );
}

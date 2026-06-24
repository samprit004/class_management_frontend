import { CreateButton } from '@/components/refine-ui/buttons/create';
import { DataTable } from '@/components/refine-ui/data-table/data-table';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { ListView } from '@/components/refine-ui/views/list-view';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Department } from '@/types';
import { useTable } from '@refinedev/react-table';
import { ColumnDef } from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

const DepartmentsList = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const searchFilters = searchQuery
        ? [{ field: 'name', operator: 'contains' as const, value: searchQuery }]
        : [];

    const departmentsTable = useTable<Department>({
        columns: useMemo<ColumnDef<Department>[]>(() => [
            {
                id: 'code',
                accessorKey: 'code',
                size: 100,
                header: () => <p className='column-title ml-2'>Code</p>,
                cell: ({ getValue }) => <Badge>{getValue() as string}</Badge>,
            },
            {
                id: 'name',
                accessorKey: 'name',
                size: 250,
                header: () => <p className='column-title'>Name</p>,
                cell: ({ getValue }) => <span className='text-foreground'>{getValue() as string}</span>,
            },
            {
                id: 'description',
                accessorKey: 'description',
                size: 400,
                header: () => <p className='column-title'>Description</p>,
                cell: ({ getValue }) => (
                    <span className='truncate line-clamp-2 text-muted-foreground'>
                        {(getValue() as string) || '—'}
                    </span>
                ),
            },
        ], []),
        refineCoreProps: {
            resource: 'departments',
            pagination: { pageSize: 10, mode: 'server' },
            filters: {
                permanent: [...searchFilters],
            },
            sorters: {
                initial: [{ field: 'id', order: 'desc' }],
            },
        },
    });

    return (
        <ListView>
            <Breadcrumb />

            <h1 className='page-title'>Departments List</h1>
            <div className='intro-row'>
                <p>Manage all departments available for subjects.</p>

                <div className='flex gap-2 w-full sm:w-auto'>
                    <div className='search-field'>
                        <Search className='search-icon' />
                        <Input
                            type='text'
                            placeholder='Search by name ...'
                            className='pl-10 w-full'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <CreateButton />
                </div>
            </div>

            <DataTable table={departmentsTable} />
        </ListView>
    );
};

export default DepartmentsList;

import { CreateButton } from '@/components/refine-ui/buttons/create';
import { DataTable } from '@/components/refine-ui/data-table/data-table';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { ListView } from '@/components/refine-ui/views/list-view';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Department, Subject } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useList } from '@refinedev/core';
import { useTable } from '@refinedev/react-table';
import { ColumnDef } from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

const SubjectsList = () => {
    const { user } = useAuth();
    const canCreate = user?.role === 'admin' || user?.role === 'teacher';
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartmentId, setSelectedDepartmentId] = useState('');

    const { data: departmentsData, isLoading: departmentsLoading } = useList<Department>({
        resource: 'departments',
        pagination: { pageSize: 100 },
    });
    const departments = departmentsData?.data ?? [];

    const searchFilters = searchQuery
        ? [{ field: 'name', operator: 'contains' as const, value: searchQuery }]
        : [];

    const departmentFilters =
        selectedDepartmentId && selectedDepartmentId !== 'all'
            ? [{ field: 'departmentId', operator: 'eq' as const, value: selectedDepartmentId }]
            : [];

    const subjectTable = useTable<Subject>({
        columns: useMemo<ColumnDef<Subject>[]>(() => [
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
                size: 200,
                header: () => <p className='column-title'>Name</p>,
                cell: ({ getValue }) => <span className='text-foreground'>{getValue() as string}</span>,
            },
            {
                id: 'department',
                accessorKey: 'department.name',
                size: 180,
                header: () => <p className='column-title'>Department</p>,
                cell: ({ getValue }) => {
                    const name = getValue() as string | undefined;
                    return name ? <Badge variant='secondary'>{name}</Badge> : <span className='text-muted-foreground'>—</span>;
                },
            },
            {
                id: 'description',
                accessorKey: 'description',
                size: 300,
                header: () => <p className='column-title'>Description</p>,
                cell: ({ getValue }) => (
                    <span className='truncate line-clamp-2 text-muted-foreground'>
                        {(getValue() as string) || '—'}
                    </span>
                ),
            },
        ], []),
        refineCoreProps: {
            resource: 'subjects',
            pagination: { pageSize: 10, mode: 'server' },
            filters: {
                permanent: [...searchFilters, ...departmentFilters],
            },
            sorters: {
                initial: [{ field: 'id', order: 'desc' }],
            },
        },
    });

    return (
        <ListView>
            <Breadcrumb />

            <h1 className='page-title'>Subjects List</h1>
            <div className='intro-row'>
                <p>Quick access to all the management tools for subjects.</p>

                <div className='flex flex-wrap items-center gap-2'>
                    <div className='search-field'>
                        <Search className='search-icon' />
                        <Input
                            type='text'
                            placeholder='Search by name or code ...'
                            className='pl-10 w-full'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Select
                        value={selectedDepartmentId}
                        onValueChange={setSelectedDepartmentId}
                        disabled={departmentsLoading}
                    >
                        <SelectTrigger className='min-w-[180px]'>
                            <SelectValue placeholder='Filter by department' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='all'>All Departments</SelectItem>
                            {departments.map((dept) => (
                                <SelectItem key={dept.id} value={String(dept.id)}>
                                    {dept.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {canCreate && <CreateButton />}
                </div>
            </div>

            <DataTable table={subjectTable} />
        </ListView>
    );
};

export default SubjectsList;

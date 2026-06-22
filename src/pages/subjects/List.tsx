import { CreateButton } from '@/components/refine-ui/buttons/create'
import { DataTable } from '@/components/refine-ui/data-table/data-table'
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb'
import { ListView } from '@/components/refine-ui/views/list-view'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from '@/components/ui/select'
import { DEPARTMENT_OPTIONS } from '@/constants'
import { Subject } from '@/types'
import { useTable } from '@refinedev/react-table'
import { ColumnDef } from '@tanstack/react-table'

import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'


const SubjectsList = () => {
  const [searchQuery, setsearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')

  const departmentFilters = selectedDepartment === 'all' ? [] : [{ field: 'department', operator: 'eq' as const, value: selectedDepartment }]
  const searchFilters = searchQuery ? [{ field: 'name', operator: 'contains' as const, value: searchQuery }] : [];

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
        filterFn: 'includesString'
      },
      {
        id: 'department',
        accessorKey: 'department.name',
        size: 150,
        header: () => <p className='column-title'>Department</p>,
        cell: ({ getValue }) => <Badge variant='secondary'>{getValue() as string}</Badge>,
      },
      {
        id: 'description',
        accessorKey: 'description',
        size: 300,
        header: () => <p className='column-title'>Description</p>,
        cell: ({ getValue }) => <span className='truncate line-clamp-2'>{getValue() as string}</span>,
      }
    ], []),
    refineCoreProps: {
      resource: 'subjects',
      pagination: { pageSize: 10, mode: 'server' },
      filters: {
        permanent: [...searchFilters, ...departmentFilters]
      },
      sorters: {
        initial: [
          { field: 'id', order: 'desc' }
        ]
      },
    }
  })
  return (
    <ListView>
      <Breadcrumb />

      <h1 className="page-title">Subjects List</h1>
      <div className='intro-row'>
        <p>Quick access to all the management tools for subjects.</p>



        <div className='flex gap-2 w-full sm:w-auto'>

          <div className='search-field'>
            <Search className='search-icon' />
            <Input
              type='text'
              placeholder='Search by name ...'
              className='pl-10 w-full'
              value={searchQuery}
              onChange={(e) => setsearchQuery(e.target.value)}
            />
          </div>

          <Select
            value={selectedDepartment}
            onValueChange={(value) => setSelectedDepartment(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder='Filter by department' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {DEPARTMENT_OPTIONS.map((department) => (
                <SelectItem key={department.value} value={department.value}>
                  {department.label}
                </SelectItem>
              ))}
            </SelectContent>

          </Select>
          <CreateButton />
        </div>

      </div>

      <DataTable table={subjectTable} />
    </ListView>
  )
}

export default SubjectsList
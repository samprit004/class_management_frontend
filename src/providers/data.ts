import { createDataProvider, CreateDataProviderOptions } from "@refinedev/rest";
import { BACKEND_BASE_URL } from "@/constants";
import { ListResponse } from "@/types";

if (!BACKEND_BASE_URL)
    throw new Error('No backend url available');


const options: CreateDataProviderOptions = {
    getList: {
        getEndpoint: ({ resource }) => resource,

        buildQueryParams: async ({ resource, pagination, filters }) => {
            const page = pagination?.currentPage ?? 1;
            const perPage = pagination?.pageSize ?? 10;
            const params: Record<string, unknown> = { page, limit: perPage }

            filters?.forEach((filter) => {
                const field = 'field' in filter ? filter.field : '';
                const value = String(filter.value);

                if (resource === 'subjects') {
                    if (field === 'departmentId') params.departmentId = value;
                    if (field === 'department') params.department = value;
                    if (field === 'name' || field === 'code') params.search = value;
                }
                if (resource === 'departments') {
                    if (field === 'name') params.search = value;
                }
                if (resource === 'classes') {
                    if (field === 'name') params.search = value;
                    if (field === 'subject') params.subject = value;
                    if (field === 'teacher') params.teacher = value;
                }
                if (resource === 'users') {
                    if (field === 'role') params.role = value;
                    if (field === 'name' || field === 'email') params.search = value;
                }
            })

            return params;
        },

        mapResponse: async (response) => {
            const payload: ListResponse = await response.clone().json();
            return payload.data ?? [];
        },

        getTotalCount: async (response) => {
            const payload: ListResponse = await response.clone().json();
            return payload.pagination?.total ?? payload.data?.length ?? 0;
        },
    },

}

const { dataProvider } = createDataProvider(BACKEND_BASE_URL, options);
export { dataProvider };

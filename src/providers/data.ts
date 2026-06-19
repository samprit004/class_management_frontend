import { DataProvider, BaseRecord, GetListParams, GetListResponse } from "@refinedev/core";
import { MOCK_SUBJECTS } from "../constants/mock-data";


export const dataProvider: DataProvider = {
    getList: async <TData extends BaseRecord = BaseRecord>({ resource }: GetListParams): Promise<GetListResponse<TData>> => {
        if (resource !== 'subjects')
            return { data: [] as TData[], total: 0, };

        return {
            data: MOCK_SUBJECTS as unknown as TData[],
            total: MOCK_SUBJECTS.length,
        }

    },

    getOne: async () => { throw new Error('This is not present here!') },
    create: async () => { throw new Error('This is not present here!') },
    update: async () => { throw new Error('This is not present here!') },
    deleteOne: async () => { throw new Error('This is not present here!') },

    getApiUrl: () => ''


}


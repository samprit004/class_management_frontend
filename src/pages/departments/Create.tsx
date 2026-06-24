import { CreateView } from '@/components/refine-ui/views/create-view.tsx';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useBack } from '@refinedev/core';
import { Separator } from '@/components/ui/separator.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from '@refinedev/react-hook-form';
import { departmentSchema } from '@/lib/schema.ts';
import * as z from 'zod';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Loader2 } from 'lucide-react';

const DepartmentsCreate = () => {
    const back = useBack();

    const form = useForm({
        resolver: zodResolver(departmentSchema),
        refineCoreProps: {
            resource: 'departments',
            action: 'create',
        },
    });

    const {
        refineCore: { onFinish },
        handleSubmit,
        formState: { isSubmitting },
        control,
    } = form;

    const onSubmit = async (values: z.infer<typeof departmentSchema>) => {
        try {
            await onFinish(values);
        } catch (error) {
            console.error('Error creating department:', error);
        }
    };

    return (
        <CreateView className='class-view'>
            <Breadcrumb />

            <h1 className='page-title'>Create a Department</h1>
            <div className='intro-row'>
                <p>Provide the required information below to add a department.</p>
                <Button onClick={() => back()}>Go Back</Button>
            </div>

            <Separator />

            <div className='my-4 flex items-center'>
                <Card className='class-form-card'>
                    <CardHeader className='relative z-10'>
                        <CardTitle className='text-2xl pb-0 font-bold text-gradient-orange'>
                            Fill out form
                        </CardTitle>
                    </CardHeader>

                    <Separator />

                    <CardContent className='mt-7'>
                        <Form {...form}>
                            <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
                                <FormField
                                    control={control}
                                    name='name'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Department Name <span className='text-orange-600'>*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder='Computer Science' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={control}
                                    name='code'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Department Code <span className='text-orange-600'>*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder='CS'
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(e.target.value.toUpperCase())
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={control}
                                    name='description'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder='Brief description about the department'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator />

                                <Button type='submit' size='lg' className='w-full'>
                                    {isSubmitting ? (
                                        <div className='flex gap-1'>
                                            <span>Creating Department...</span>
                                            <Loader2 className='inline-block ml-2 animate-spin' />
                                        </div>
                                    ) : (
                                        'Create Department'
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </CreateView>
    );
};

export default DepartmentsCreate;

'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const publishFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be in format x.y.z'),
  author: z.string().min(2, 'Author name must be at least 2 characters'),
  license: z.string().optional(),
  repository: z.string().url('Must be a valid URL').optional(),
});

type PublishFormValues = z.infer<typeof publishFormSchema>;

interface PublishFormProps {
  onSubmit: (values: PublishFormValues) => void;
  isLoading?: boolean;
}

export function PublishForm({ onSubmit, isLoading }: PublishFormProps) {
  const form = useForm<PublishFormValues>({
    resolver: zodResolver(publishFormSchema),
    defaultValues: {
      name: '',
      description: '',
      version: '1.0.0',
      author: '',
      license: 'MIT',
      repository: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="My Awesome Plugin" {...field} />
              </FormControl>
              <FormDescription>
                The name of your plugin or theme
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A brief description of what your plugin or theme does..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Help others understand what your plugin or theme does
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="version"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Version</FormLabel>
              <FormControl>
                <Input placeholder="1.0.0" {...field} />
              </FormControl>
              <FormDescription>
                Version number in semver format (x.y.z)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="author"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Author</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="license"
          render={({ field }) => (
            <FormItem>
              <FormLabel>License</FormLabel>
              <FormControl>
                <Input placeholder="MIT" {...field} />
              </FormControl>
              <FormDescription>
                Optional: Specify the license for your plugin or theme
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="repository"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repository URL</FormLabel>
              <FormControl>
                <Input placeholder="https://github.com/username/repo" {...field} />
              </FormControl>
              <FormDescription>
                Optional: Link to your source code repository
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Publishing...' : 'Publish'}
        </Button>
      </form>
    </Form>
  );
}

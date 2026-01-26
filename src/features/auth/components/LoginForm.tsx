import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const location = useLocation();
  const state = location.state as { email?: string; password?: string; registered?: boolean };

  // Default credentials for development
  const defaultEmail = state?.email || (import.meta.env.DEV ? 'admin@admin.com' : '');
  const defaultPassword = state?.password || (import.meta.env.DEV ? 'admin123' : '');

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: defaultEmail,
      password: defaultPassword,
      rememberMe: false,
    },
  });

  const { mutate: login, isPending, isError, error } = useLogin();

  const onSubmit = (data: LoginFormData) => {
    login({
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {state?.registered && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          ✅ Registration successful! Please sign in with your credentials.
        </div>
      )}

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.email?.message}
          />
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.password?.message}
          />
        )}
      />

      <Controller
        name="rememberMe"
        control={control}
        render={({ field }) => (
          <div className="flex items-center">
            <Checkbox
              isSelected={field.value}
              onChange={field.onChange}
            />
            <label className="ml-2 text-sm text-gray-700">Remember me</label>
          </div>
        )}
      />

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error?.message || 'Login failed. Please try again.'}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isPending}
        loading={isPending}
      >
        {isPending ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
};

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegister } from '../hooks/useRegister';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const registerSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      confirm_password: '',
    },
  });

  const { mutate: registerUser, isPending, isError, error } = useRegister();

  const onSubmit = (data: RegisterFormData) => {
    registerUser({
      email: data.email,
      password: data.password,
      fullName: data.full_name,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        name="full_name"
        control={control}
        render={({ field }) => (
          <Input
            label="Full Name"
            type="text"
            placeholder="Ali Yılmaz"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.full_name?.message}
          />
        )}
      />

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
        name="confirm_password"
        control={control}
        render={({ field }) => (
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.confirm_password?.message}
          />
        )}
      />

      {isError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          {error?.message || 'Registration failed. Please try again.'}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isPending}
        loading={isPending}
      >
        {isPending ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );
};

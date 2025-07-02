import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-lg px-4 py-2',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 active:bg-primary-700',
        secondary: 'bg-gray-200 active:bg-gray-300',
        outline: 'border border-gray-300 bg-transparent',
        ghost: 'bg-transparent',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        lg: 'h-12 px-6',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

const textVariants = cva('font-medium', {
  variants: {
    variant: {
      primary: 'text-white',
      secondary: 'text-gray-900',
      outline: 'text-gray-900',
      ghost: 'text-gray-900',
    },
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

interface ButtonProps
  extends React.ComponentPropsWithoutRef<typeof TouchableOpacity>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<typeof TouchableOpacity, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <TouchableOpacity
        ref={ref as React.Ref<View>}
        disabled={disabled || loading}
        className={cn(
          buttonVariants({ variant, size }),
          disabled && 'opacity-50',
          className
        )}
        {...props}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? 'white' : '#000'}
          />
        ) : (
          <>
            {leftIcon && <View className="mr-2">{leftIcon}</View>}
            <Text className={cn(textVariants({ variant, size }))}>
              {children}
            </Text>
            {rightIcon && <View className="ml-2">{rightIcon}</View>}
          </>
        )}
      </TouchableOpacity>
    );
  }
); 
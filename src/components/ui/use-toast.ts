// Adapted from https://ui.shadcn.com/docs/components/toast
import { useState, useEffect, useCallback } from "react";
import { toast as sonnerToast, type Toast } from "sonner";

export type ToastProps = Toast & {
    title?: string;
    description?: string;
    variant?: "default" | "destructive";
};

export function useToast() {
    const [toasts, setToasts] = useState<ToastProps[]>([]);

    useEffect(() => {
        toasts.forEach((toast) => {
            const { id, title, description, variant, ...props } = toast;

            // Apply variant styles
            const variantProps = variant === "destructive"
                ? { style: { backgroundColor: "hsl(var(--destructive))", color: "hsl(var(--destructive-foreground))" } }
                : {};

            sonnerToast(title, {
                id,
                description,
                ...variantProps,
                ...props,
            });
        });
    }, [toasts]);

    const toast = useCallback(
        ({ ...props }: ToastProps) => {
            const id = props.id || String(Date.now());
            setToasts((toasts) => [...toasts, { id, ...props }]);
            return id;
        },
        [setToasts]
    );

    const dismiss = useCallback((toastId?: string) => {
        setToasts((toasts) => toasts.filter((t) => t.id !== toastId));
        sonnerToast.dismiss(toastId);
    }, []);

    return {
        toast,
        dismiss,
    };
}

// Helper function to create a toast with variant
const createToast = (props: ToastProps) => {
    const { title, description, variant, ...rest } = props;
    return sonnerToast(title || "", {
        description,
        ...(variant === "destructive" ? { style: { backgroundColor: "hsl(var(--destructive))", color: "hsl(var(--destructive-foreground))" } } : {}),
        ...rest,
    });
};

// Export toast object with methods
export const toast = {
    // Basic toast function
    ...sonnerToast,

    // Custom variants
    default(props: Omit<ToastProps, "variant">) {
        return createToast({ ...props, variant: "default" });
    },
    destructive(props: Omit<ToastProps, "variant">) {
        return createToast({ ...props, variant: "destructive" });
    },
};
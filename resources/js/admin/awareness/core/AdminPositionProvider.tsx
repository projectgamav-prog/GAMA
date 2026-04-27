import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { AdminLayoutPositionContext } from './layout-position-context';

const AdminPositionContext =
    createContext<AdminLayoutPositionContext | null>(null);

export function AdminPositionProvider({
    children,
    value,
}: {
    children: ReactNode;
    value: AdminLayoutPositionContext;
}) {
    return (
        <AdminPositionContext.Provider value={value}>
            {children}
        </AdminPositionContext.Provider>
    );
}

export function AdminPositionBoundary({
    children,
    value,
}: {
    children: ReactNode;
    value: AdminLayoutPositionContext;
}) {
    return (
        <AdminPositionProvider value={value}>
            {children}
        </AdminPositionProvider>
    );
}

export function useAdminPositionContext(): AdminLayoutPositionContext | null {
    return useContext(AdminPositionContext);
}

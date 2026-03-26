import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard } from 'lucide-react';
import type { ReactNode } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { dashboard, home } from '@/routes';
import type { User } from '@/types';

type Props = {
    children?: ReactNode;
    showHome?: boolean;
};

export function AuthenticatedUtilityNav({
    children,
    showHome = true,
}: Props) {
    const { auth } = usePage().props;
    const getInitials = useInitials();
    const user = auth.user as User | null | undefined;

    if (!user) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            {showHome && (
                <Button asChild variant="ghost">
                    <Link href={home()}>Home</Link>
                </Button>
            )}

            <Button asChild variant="outline">
                <Link href={dashboard()}>
                    <LayoutDashboard className="size-4" />
                    Dashboard
                </Link>
            </Button>

            {children}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="size-10 rounded-full p-1"
                    >
                        <Avatar className="size-8 overflow-hidden rounded-full">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                    <UserMenuContent user={user} />
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

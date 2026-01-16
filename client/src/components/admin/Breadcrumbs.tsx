import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'wouter';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const parts = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Admin', href: '/admin' }];

  let currentPath = '/admin';
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    currentPath += `/${part}`;
    
    // Format the label
    const label = part
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Last item should not have href
    breadcrumbs.push({
      label,
      href: i === parts.length - 1 ? undefined : currentPath,
    });
  }

  return breadcrumbs;
}

export function Breadcrumbs() {
  const [location] = useLocation();
  const breadcrumbs = generateBreadcrumbs(location);

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 px-4 py-2 bg-gray-50 border-b">
      <Link href="/admin" className="hover:text-gray-900">
        <Home className="h-4 w-4" />
      </Link>
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-gray-400" />
          {item.href ? (
            <Link href={item.href} className="hover:text-gray-900">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-gray-900">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

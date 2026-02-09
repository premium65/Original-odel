// components/Breadcrumb.tsx
import Link from 'next/link';
import { FC } from 'react';

interface BreadcrumbProps {
  items: { title: string; href: string }[];
}

const Breadcrumb: FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav aria-label="breadcrumb">
      <ol className="flex space-x-1 text-gray-700">
        {items.map((item, index) => (
          <li
            key={item.href}
            className={`flex items-center${index === items.length - 1 ? ' text-gray-500' : ''}`}
          >
            {index === items.length - 1 ? (
              item.title
            ) : (
              <>
                <Link href={item.href} className="hover:text-blue-600">
                  {item.title}
                </Link>
                <span className="ml-2 mr-1">/</span>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;

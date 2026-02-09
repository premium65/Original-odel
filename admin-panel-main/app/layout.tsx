import ProviderComponent from '@/components/layouts/provider-component';
import 'react-perfect-scrollbar/dist/css/styles.css';
import '../styles/tailwind.css';
import '@mantine/core/styles.css';
import 'mantine-datatable/styles.css';
import { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';


export const metadata: Metadata = {
    title: {
        template: '%s | Admin Goib.tech',
        default: 'Admin Goib.tech',
    },
};
const nunito = Nunito({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-nunito',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
                 <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
            <body className={nunito.variable}>
                <ProviderComponent><MantineProvider defaultColorScheme="auto"><ModalsProvider>{children}</ModalsProvider></MantineProvider></ProviderComponent>
            </body>
        </html>
    );
}

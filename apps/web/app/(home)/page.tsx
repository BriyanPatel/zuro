import Link from 'next/link';

export default function HomePage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <h1 className="text-5xl font-bold mb-6">Zuro</h1>
            <p className="text-xl mb-8 text-gray-600">The Backend builder for busy developers.</p>
            <Link
                href="/docs"
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
            >
                Read the Documentation
            </Link>
        </main>
    );
}

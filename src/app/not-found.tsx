import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="text-center space-y-8 p-8">
                {/* 404 Number */}
                <div className="relative">
                    <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-700 select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <svg
                                className="w-12 h-12 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.007-5.691-2.709M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Page Not Found
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                        Oops! The page you're looking for seems to have wandered off into the digital void.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button asChild size="lg" className="min-w-[140px]">
                        <Link href="/">
                            Go Home
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="min-w-[140px]">
                        <Link href="/dashboard">
                            Dashboard
                        </Link>
                    </Button>
                </div>

                {/* Additional Help */}
                <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Need help? Try going back to the{' '}
                        <Link href="/" className="text-blue-600 hover:text-blue-500 underline">
                            homepage
                        </Link>{' '}
                        or check out your{' '}
                        <Link href="/dashboard" className="text-blue-600 hover:text-blue-500 underline">
                            projects
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}
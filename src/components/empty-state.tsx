"use client";

import {useState} from "react";
import {ArrowRight, Eye, EyeOff, Key} from "lucide-react";

interface EmptyStateProps {
    onAddKey: (key: string) => void;
    isLoading: boolean;
    error: string | null;
}

export function EmptyState({onAddKey, isLoading, error}: EmptyStateProps) {
    const [inputValue, setInputValue] = useState("");
    const [showKey, setShowKey] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onAddKey(inputValue.trim());
        }
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[hsl(var(--primary)/0.1)] mb-4">
                        <Key className="w-8 h-8 text-[hsl(var(--primary))]"/>
                    </div>
                    <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">
                        Add your API key
                    </h2>
                    <p className="text-[hsl(var(--muted-foreground))] text-sm">
                        Enter your API key to view usage statistics
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <input
                            type={showKey ? "text" : "password"}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Enter API key..."
                            className="w-full px-4 py-3 pr-12 rounded-lg bg-[hsl(var(--input))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition-all"
                            disabled={isLoading}
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={() => setShowKey(!showKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                        >
                            {showKey ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                        </button>
                    </div>

                    {error && (
                        <div
                            className="px-4 py-3 rounded-lg bg-[hsl(var(--destructive)/0.1)] border border-[hsl(var(--destructive)/0.3)] text-[hsl(var(--destructive))] text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !inputValue.trim()}
                        className="w-full px-4 py-3 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div
                                    className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"/>
                                Connecting...
                            </>
                        ) : (
                            <>
                                Connect
                                <ArrowRight className="w-5 h-5"/>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

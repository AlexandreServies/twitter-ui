"use client";

import {useEffect, useRef, useState} from "react";
import {Check, Eye, EyeOff, Plus, X} from "lucide-react";
import {ApiKeyEntry} from "@/lib/types";
import {formatKeyLabel} from "@/lib/storage";

interface ApiKeyTabsProps {
    apiKeys: ApiKeyEntry[];
    activeTabId: string;
    onSelectTab: (id: string) => void;
    onAddKey: (key: string) => void;
    onRemoveKey: (id: string) => void;
    onRenameKey: (id: string, label: string) => void;
    isAddingKey: boolean;
    addKeyError: string | null;
}

export function ApiKeyTabs({
                               apiKeys,
                               activeTabId,
                               onSelectTab,
                               onAddKey,
                               onRemoveKey,
                               onRenameKey,
                               isAddingKey,
                               addKeyError,
                           }: ApiKeyTabsProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newKeyValue, setNewKeyValue] = useState("");
    const [showNewKey, setShowNewKey] = useState(false);
    const [editingTabId, setEditingTabId] = useState<string | null>(null);
    const [editingLabel, setEditingLabel] = useState("");
    const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const editInputRef = useRef<HTMLInputElement>(null);

    // Focus input when adding mode is activated
    useEffect(() => {
        if (isAdding && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isAdding]);

    // Focus input when editing
    useEffect(() => {
        if (editingTabId && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [editingTabId]);

    // Close context menu on click outside
    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        if (contextMenu) {
            document.addEventListener("click", handleClick);
            return () => document.removeEventListener("click", handleClick);
        }
    }, [contextMenu]);

    // Track if we were previously adding (to detect successful add completion)
    const wasAddingKey = useRef(false);

    // Reset adding state when a key is successfully added
    useEffect(() => {
        if (isAddingKey) {
            wasAddingKey.current = true;
        } else if (wasAddingKey.current && !addKeyError) {
            // Was adding, now done, no error = success
            setIsAdding(false);
            setNewKeyValue("");
            setShowNewKey(false);
            wasAddingKey.current = false;
        } else if (wasAddingKey.current && addKeyError) {
            // Was adding, now done, has error = keep input open
            wasAddingKey.current = false;
        }
    }, [isAddingKey, addKeyError]);

    const handleAddSubmit = () => {
        if (newKeyValue.trim()) {
            onAddKey(newKeyValue.trim());
        }
    };

    const handleAddKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddSubmit();
        } else if (e.key === "Escape") {
            setIsAdding(false);
            setNewKeyValue("");
            setShowNewKey(false);
        }
    };

    const handleTabDoubleClick = (entry: ApiKeyEntry) => {
        setEditingTabId(entry.id);
        setEditingLabel(entry.label || formatKeyLabel(entry.key));
    };

    const handleEditSubmit = () => {
        if (editingTabId && editingLabel.trim()) {
            onRenameKey(editingTabId, editingLabel.trim());
        }
        setEditingTabId(null);
        setEditingLabel("");
    };

    const handleEditKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleEditSubmit();
        } else if (e.key === "Escape") {
            setEditingTabId(null);
            setEditingLabel("");
        }
    };

    const handleContextMenu = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        setContextMenu({id, x: e.clientX, y: e.clientY});
    };

    return (
        <div className="relative">
            <div className="flex items-end gap-1 px-4 sm:px-6 lg:px-8">
                {apiKeys.map((entry) => (
                    <div
                        key={entry.id}
                        className="relative"
                    >
                        <button
                            onClick={() => onSelectTab(entry.id)}
                            onDoubleClick={() => handleTabDoubleClick(entry)}
                            onContextMenu={(e) => handleContextMenu(e, entry.id)}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                                activeTabId === entry.id
                                    ? "bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
                                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
                            }`}
                        >
                            {editingTabId === entry.id ? (
                                <input
                                    ref={editInputRef}
                                    type="text"
                                    value={editingLabel}
                                    onChange={(e) => setEditingLabel(e.target.value)}
                                    onBlur={handleEditSubmit}
                                    onKeyDown={handleEditKeyDown}
                                    className="w-24 bg-transparent border-b border-[hsl(var(--primary))] outline-none text-center"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                formatKeyLabel(entry.key, entry.label)
                            )}
                        </button>
                        {/* Active indicator */}
                        {activeTabId === entry.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(var(--primary))]"/>
                        )}
                    </div>
                ))}

                {/* Add button / inline input */}
                {isAdding ? (
                    <div className="flex items-center gap-1 px-2 py-1.5 rounded-t-lg bg-[hsl(var(--muted))]">
                        <div className="relative">
                            <input
                                ref={inputRef}
                                type={showNewKey ? "text" : "password"}
                                value={newKeyValue}
                                onChange={(e) => setNewKeyValue(e.target.value)}
                                onKeyDown={handleAddKeyDown}
                                placeholder="API key..."
                                className="w-32 px-2 py-1 pr-7 text-sm bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--ring))]"
                                disabled={isAddingKey}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewKey(!showNewKey)}
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                            >
                                {showNewKey ? <EyeOff className="w-3.5 h-3.5"/> : <Eye className="w-3.5 h-3.5"/>}
                            </button>
                        </div>
                        <button
                            onClick={handleAddSubmit}
                            disabled={!newKeyValue.trim() || isAddingKey}
                            className="p-1 rounded text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAddingKey ? (
                                <div
                                    className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"/>
                            ) : (
                                <Check className="w-4 h-4"/>
                            )}
                        </button>
                        <button
                            onClick={() => {
                                setIsAdding(false);
                                setNewKeyValue("");
                                setShowNewKey(false);
                            }}
                            disabled={isAddingKey}
                            className="p-1 rounded text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] disabled:opacity-50"
                        >
                            <X className="w-4 h-4"/>
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="px-3 py-2 text-sm font-medium rounded-t-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
                        title="Add API key"
                    >
                        <Plus className="w-4 h-4"/>
                    </button>
                )}
            </div>

            {/* Error message for adding key */}
            {isAdding && addKeyError && (
                <div
                    className="mx-4 sm:mx-6 lg:mx-8 mt-2 px-3 py-2 rounded-lg bg-[hsl(var(--destructive)/0.1)] border border-[hsl(var(--destructive)/0.3)] text-[hsl(var(--destructive))] text-sm">
                    {addKeyError}
                </div>
            )}

            {/* Context menu */}
            {contextMenu && (
                <div
                    className="fixed z-50 py-1 min-w-[120px] rounded-lg bg-[hsl(var(--popover))] border border-[hsl(var(--border))] shadow-lg"
                    style={{left: contextMenu.x, top: contextMenu.y}}
                >
                    <button
                        onClick={() => {
                            const entry = apiKeys.find((k) => k.id === contextMenu.id);
                            if (entry) handleTabDoubleClick(entry);
                            setContextMenu(null);
                        }}
                        className="w-full px-3 py-1.5 text-sm text-left text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
                    >
                        Rename
                    </button>
                    <button
                        onClick={() => {
                            if (confirm("Remove this API key? You can re-add it anytime.")) {
                                onRemoveKey(contextMenu.id);
                            }
                            setContextMenu(null);
                        }}
                        className="w-full px-3 py-1.5 text-sm text-left text-[hsl(var(--destructive))] hover:bg-[hsl(var(--muted))] transition-colors"
                    >
                        Remove
                    </button>
                </div>
            )}
        </div>
    );
}

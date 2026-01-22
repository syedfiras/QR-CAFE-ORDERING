"use client";

import React, { useState, useEffect } from "react";
import Button from "./Button";
import { getMenu } from "../services/api";
import Image from "next/image";
import ConfirmModal from "./ConfirmModal";

interface ManageItemsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddNew: () => void;
    onEdit: (item: any) => void;
    onDelete: (id: string) => Promise<void>;
}

interface MenuItem {
    id: string;
    name: string;
    price: number;
    image_url: string;
    description?: string;
    is_available: boolean;
}

interface Category {
    id: string;
    name: string;
    menu_items: MenuItem[];
}

export default function ManageItemsModal({
    isOpen,
    onClose,
    onAddNew,
    onEdit,
    onDelete,
}: ManageItemsModalProps) {
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [menu, setMenu] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const [deleteConfirm, setDeleteConfirm] = useState<{
        isOpen: boolean;
        itemId: string | null;
        itemName: string;
    }>({
        isOpen: false,
        itemId: null,
        itemName: "",
    });

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            fetchMenu();
        }
    }, [isOpen]);

    const fetchMenu = async () => {
        setLoading(true);
        try {
            const data = await getMenu();
            setMenu(data);
        } catch (error) {
            console.error("Error fetching menu:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnimationEnd = () => {
        if (!isOpen) setShouldRender(false);
    };

    const handleDeleteClick = (id: string, name: string) => {
        setDeleteConfirm({
            isOpen: true,
            itemId: id,
            itemName: name,
        });
    };

    const confirmDelete = async () => {
        if (deleteConfirm.itemId) {
            await onDelete(deleteConfirm.itemId);
            setDeleteConfirm({ isOpen: false, itemId: null, itemName: "" });
            fetchMenu(); // Refresh list
        }
    };

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 z-[50] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0"
                }`}
            onTransitionEnd={handleAnimationEnd}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
                onClick={onClose}
            />

            <ConfirmModal
                isOpen={deleteConfirm.isOpen}
                title="Delete Item"
                message={`Are you sure you want to delete "${deleteConfirm.itemName}"? This action cannot be undone.`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm({ isOpen: false, itemId: null, itemName: "" })}
                variant="destructive"
                confirmLabel="Delete Item"
            />

            {/* Modal Content */}
            <div
                className={`relative bg-white rounded-[2rem] shadow-soft-xl max-w-4xl w-full h-[80vh] flex flex-col overflow-hidden transform transition-all duration-300 ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
                    }`}
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-neutral-100 flex items-center justify-between bg-white z-10">
                    <div>
                        <h3 className="font-display text-2xl font-bold text-neutral-800">
                            Manage Items
                        </h3>
                        <p className="text-neutral-500 text-sm">View and edit your menu items</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center hover:bg-neutral-200 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-[#FAFAFA]">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                        </div>
                    ) : menu.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-neutral-400 mb-4">No items found.</p>
                            <Button onClick={onAddNew}>Add Your First Item</Button>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {/* Add Button Area */}
                            <div className="flex justify-end">
                                <Button
                                    onClick={onAddNew}
                                    className="bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-200"
                                >
                                    + Add New Item
                                </Button>
                            </div>

                            {menu.map(category => (
                                <div key={category.id}>
                                    <h4 className="font-display text-xl font-bold text-neutral-700 mb-4 flex items-center gap-3">
                                        {category.name}
                                        <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-1 rounded-full font-sans font-medium">
                                            {category.menu_items.length}
                                        </span>
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {category.menu_items.map(item => (
                                            <div key={item.id} className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow group">
                                                <div className="flex gap-4 items-start">
                                                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100">
                                                        <Image
                                                            src={item.image_url}
                                                            alt={item.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h5 className="font-bold text-neutral-800 truncate">{item.name}</h5>
                                                        <p className="text-primary-500 font-bold text-sm">₹{item.price}</p>
                                                        <p className="text-neutral-400 text-xs mt-1 line-clamp-1">{item.description}</p>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="pt-4 border-t border-neutral-50 flex items-center gap-2 mt-auto">
                                                    <button
                                                        onClick={() => onEdit({ ...item, category: category.name })}
                                                        className="flex-1 py-2 rounded-lg bg-neutral-50 text-neutral-600 text-sm font-bold hover:bg-primary-50 hover:text-primary-600 transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(item.id, item.name)}
                                                        className="flex-1 py-2 rounded-lg bg-neutral-50 text-neutral-600 text-sm font-bold hover:bg-red-50 hover:text-red-500 transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

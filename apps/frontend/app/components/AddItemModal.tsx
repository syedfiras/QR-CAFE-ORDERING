"use client";

import React, { useState, useEffect } from "react";
import Button from "./Button";
import { getMenu } from "../services/api";

interface MenuItem {
    id: string;
    name: string;
    description?: string;
    price: number;
    category?: string;
    image_url: string;
}

interface AddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: FormData) => Promise<void>;
    initialData?: {
        name: string;
        description: string;
        price: number;
        category: string;
        image_url: string;
    } | null;
    onBack?: () => void;
}

interface Category {
    id: string;
    name: string;
}

export default function AddItemModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    onBack,
}: AddItemModalProps) {
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isNewCategory, setIsNewCategory] = useState(false);

    const isEditMode = !!initialData;

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);

            // Fetch categories
            getMenu()
                .then((data) => {
                    setCategories(data);

                    if (initialData) {
                        // Edit Mode: Pre-fill
                        setName(initialData.name);
                        setDescription(initialData.description || "");
                        setPrice(initialData.price.toString());
                        setCategory(initialData.category);
                        setIsNewCategory(false);
                        setCategoryImageFile(null);
                    } else {
                        // Add Mode: Reset
                        setName("");
                        setDescription("");
                        setPrice("");
                        setImageFile(null);
                        setCategoryImageFile(null);
                        setIsNewCategory(false);
                        if (data && data.length > 0) {
                            setCategory(data[0].name);
                        } else {
                            setCategory("");
                        }
                    }
                })
                .catch((err) => console.error("Error fetching categories:", err));
        }
    }, [isOpen, initialData]);

    const handleAnimationEnd = () => {
        if (!isOpen) setShouldRender(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !price || !category) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            formData.append("price", price);
            formData.append("category", category);
            formData.append("isNewCategory", isNewCategory.toString());
            if (imageFile) {
                formData.append("image", imageFile);
            }
            if (categoryImageFile && isNewCategory) {
                formData.append("categoryImage", categoryImageFile);
            }

            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error("Failed to submit item", error);
        } finally {
            setLoading(false);
        }
    };

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0"
                }`}
            onTransitionEnd={handleAnimationEnd}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={`relative bg-white rounded-3xl shadow-soft-xl max-w-md w-full p-8 transform transition-all duration-300 max-h-[90vh] overflow-y-auto ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
                    }`}
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center hover:bg-neutral-200 transition-colors"
                            >
                                ←
                            </button>
                        )}
                        <h3 className="font-display text-2xl font-bold text-neutral-800">
                            {isEditMode ? "Edit Menu Item" : "Add Menu Item"}
                        </h3>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">
                            Item Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                            placeholder="e.g. Truffle Pasta"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">
                            Category <span className="text-red-500">*</span>
                        </label>
                        {!isNewCategory && categories.length > 0 ? (
                            <div className="relative">
                                <select
                                    required
                                    value={category}
                                    onChange={(e) => {
                                        if (e.target.value === "__NEW__") {
                                            setIsNewCategory(true);
                                            setCategory("");
                                        } else {
                                            setCategory(e.target.value);
                                        }
                                    }}
                                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium appearance-none"
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.name}>
                                            {c.name}
                                        </option>
                                    ))}
                                    <option value="__NEW__" className="font-bold text-primary-600">
                                        + Create New Category
                                    </option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-neutral-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        required={isNewCategory || categories.length === 0}
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="flex-1 px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                                        placeholder="New Category Name"
                                        autoFocus={isNewCategory}
                                    />
                                    {categories.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsNewCategory(false);
                                                setCategoryImageFile(null);
                                                if (categories.length > 0) setCategory(categories[0].name);
                                            }}
                                            className="px-4 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-700 underline"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                                
                                {/* Category Image Upload - Only for new categories */}
                                <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
                                    <label className="block text-xs font-bold text-primary-700 uppercase tracking-widest mb-2">
                                        Category Fallback Image (Optional)
                                    </label>
                                    <p className="text-xs text-neutral-500 mb-3">
                                        This image will be used as fallback for items in this category that don't have their own image.
                                    </p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setCategoryImageFile(e.target.files[0]);
                                            }
                                        }}
                                        className="w-full px-3 py-2 rounded-lg bg-white border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-sm file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary-100 file:text-primary-700 hover:file:bg-primary-200"
                                    />
                                    {categoryImageFile && (
                                        <p className="text-xs text-primary-600 mt-2 font-medium">
                                            Selected: {categoryImageFile.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">
                            Price (₹) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                            placeholder="150"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium resize-none h-24"
                            placeholder="Describe the dish..."
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">
                            Item Image (Optional)
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setImageFile(e.target.files[0]);
                                    }
                                }}
                                className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                            />
                        </div>
                        {imageFile ? (
                            <p className="text-xs text-primary-600 mt-2 font-medium">Selected: {imageFile.name}</p>
                        ) : isEditMode && initialData?.image_url && !initialData.image_url.includes("default") ? (
                            <p className="text-xs text-neutral-500 mt-2">Current image: <a href={initialData.image_url} target="_blank" className="text-primary-600 hover:underline">View</a></p>
                        ) : null}
                        <p className="text-[10px] text-neutral-400 mt-1">
                            {isNewCategory 
                                ? "If no item image is uploaded, the category fallback image will be used."
                                : "Upload to change the current image."}
                        </p>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3.5 rounded-xl font-bold text-neutral-500 hover:bg-neutral-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <Button
                            type="submit"
                            loading={loading}
                            className="flex-1 py-3.5 rounded-xl font-bold bg-primary-500 text-white shadow-lg shadow-primary-200 hover:bg-primary-600"
                        >
                            {isEditMode ? "Save Changes" : "Add Item"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}


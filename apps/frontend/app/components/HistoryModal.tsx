"use client";

import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { getOrderHistory } from "../services/api";
import OrderCard from "./OrderCard";
import SkeletonCard from "./SkeletonCard";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getOrderHistory(date);
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, date]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Order History Archive">
      <div className="space-y-8">
        {/* Date Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200">
          <div>
            <p className="text-neutral-400 text-[10px] font-black uppercase tracking-widest mb-1">Select Archive Date</p>
            <h4 className="font-display text-xl font-bold text-neutral-800">Browse Records</h4>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-6 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl font-bold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all cursor-pointer"
          />
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} variant="order" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-24 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="font-display text-xl font-bold text-neutral-800 mb-2">No Records Found</h3>
            <p className="text-neutral-500">There are no orders recorded for {new Date(date).toLocaleDateString()}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={{
                  ...order,
                  total: order.order_items
                    .filter((item: any) => !item.is_cancelled)
                    .reduce((sum: number, item: any) => sum + (item.menu_items.price || 0) * item.quantity, 0),
                  isPaid: order.payments && order.payments.length > 0,
                }}
                onPrepare={() => {}}
                onComplete={() => {}}
                onCancel={() => {}}
                onCancelItem={() => {}}
                onMarkPaid={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

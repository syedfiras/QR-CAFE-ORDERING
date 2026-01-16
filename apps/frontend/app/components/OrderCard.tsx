import React, { useEffect, useState } from "react";
import StatusBadge from "./StatusBadge";
import Button from "./Button";

interface OrderItem {
  id: string;
  quantity: number;
  is_cancelled: boolean;
  menu_items: {
    name: string;
    price?: number;
  };
}

interface AdminOrder {
  id: string;
  status: "PENDING" | "PREPARING" | "COMPLETED" | "CANCELLED";
  created_at: string;
  updated_at?: string;
  cafe_tables: {
    table_number: number;
  };
  order_items: OrderItem[];
  total?: number;
  isPaid?: boolean;
}

interface OrderCardProps {
  order: AdminOrder;
  onPrepare: () => void;
  onComplete: () => void;
  onCancel: () => void;
  onCancelItem: (itemId: string) => void;
  onMarkPaid: () => void;
}

export default function OrderCard({
  order,
  onPrepare,
  onComplete,
  onCancel,
  onCancelItem,
  onMarkPaid,
}: OrderCardProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  // Helper to safely parse dates, assuming UTC if no offset
  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    // If string has already 'Z' or offset, usage is compliant
    if (dateStr.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(dateStr)) {
        return new Date(dateStr);
    }
    // Assume UTC if missing
    return new Date(`${dateStr}Z`);
  };

  const formatToIST = (dateStr: string) => {
    if (!dateStr) return "";
    const date = parseDate(dateStr);
    
    return new Intl.DateTimeFormat('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
    }).format(date);
  };

  const getRelativeTime = (dateStr: string) => {
    const date = parseDate(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 1000 / 60);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    const hours = Math.floor(diffMins / 60);
    return `${hours} hr ago`;
  };

  const getDuration = (startStr: string, endStr?: string) => {
    if (!endStr) return null;
    const start = parseDate(startStr);
    const end = parseDate(endStr);
    const diffMins = Math.floor((end.getTime() - start.getTime()) / 1000 / 60);
    return `${diffMins} mins`;
  };

  const activeItems = order.order_items.filter((item) => !item.is_cancelled);
  const total = order.total || 0;

  // Timing Logic
  // Use updated_at if available for finished states, otherwise fallback might be needed or just show created
  const createdTime = formatToIST(order.created_at);
  const isCompleted = order.status === 'COMPLETED';
  // If we don't have updated_at, we can't show exact completion time. 
  // We'll rely on what's passed. If missing, UI simply won't show the range end.
  const completedTime = isCompleted && order.updated_at ? formatToIST(order.updated_at) : null;
  const duration = isCompleted && order.updated_at ? getDuration(order.created_at, order.updated_at) : null;
  const relativeTime = getRelativeTime(isCompleted && order.updated_at ? order.updated_at : order.created_at);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
      {/* Header Bar - Clean & Solid */}
      <div className="bg-white px-5 py-4 border-b border-neutral-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-neutral-900 px-3 py-1.5 rounded-lg text-white font-bold text-base tracking-wide shadow-sm">
             Table {order.cafe_tables.table_number}
          </div>
          <StatusBadge status={order.status} size="sm" />
        </div>
        <div className="text-right flex flex-col items-end">
             {isCompleted ? (
                 <>
                     <span className="text-xs font-semibold text-neutral-600">
                        {createdTime} - {completedTime}
                     </span>
                     {duration && (
                         <span className="text-[10px] uppercase font-bold text-green-600 tracking-wider mt-0.5">
                             {duration}
                         </span>
                     )}
                 </>
             ) : (
                <>
                    <span className="text-xs font-semibold text-neutral-900">{createdTime}</span>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">{relativeTime}</span>
                </>
             )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col bg-white">
        {/* Items List - Strict 4-Column Grid */}
        <div className="space-y-3 mb-6 flex-1">
          <div className="grid grid-cols-12 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 px-1">
             <div className="col-span-5">Item</div>
             <div className="col-span-2 text-center">Qty</div>
             <div className="col-span-3 text-right">Price</div>
             <div className="col-span-2 text-right"></div>
          </div>
          {activeItems.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-12 items-center py-3 px-1 border-b border-neutral-100 last:border-0"
            >
              {/* Item Name */}
              <div className="col-span-5 pr-2">
                <span className="text-sm font-semibold text-neutral-800 leading-tight">{item.menu_items.name}</span>
              </div>
              
              {/* Quantity */}
              <div className="col-span-2 text-center">
                 <span className="text-sm font-bold text-neutral-700 bg-neutral-100 px-2 py-1 rounded-lg">{item.quantity}</span>
              </div>
              
              {/* Price */}
              <div className="col-span-3 text-right">
                 <span className="text-sm font-bold text-neutral-800">₹{(item.menu_items.price || 0) * item.quantity}</span>
              </div>
              
              {/* Action - DISTINCT COLUMN */}
              <div className="col-span-2 text-right flex justify-end">
                 {order.status !== "COMPLETED" && (
                    <button
                        onClick={() => onCancelItem(item.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                        title="Remove Item"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                 )}
              </div>
            </div>
          ))}

          {/* Cancelled items summary */}
           {order.order_items.filter((item) => item.is_cancelled).length > 0 && (
             <div className="mt-4 pt-3 border-t border-dashed border-neutral-200">
               <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Cancelled Items</p>
               {order.order_items.filter((item) => item.is_cancelled).map(item => (
                   <div key={item.id} className="flex justify-between items-center py-1 opacity-60">
                       <span className="text-xs text-neutral-500 line-through">{item.menu_items.name}</span>
                       <span className="text-[10px] font-bold text-red-500 border border-red-200 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-wide">Cancelled</span>
                   </div>
               ))}
             </div>
           )}
        </div>

        {/* Footer Area */}
        <div className="pt-5 border-t border-neutral-100 mt-auto space-y-5">
             <div className="flex items-end justify-between"> 
                 <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Amount</span>
                 <span className="text-3xl font-bold text-neutral-900 tracking-tight">₹{total}</span>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
                {/* Action Buttons Logic - STRICT Hierarchy */}
                {order.status === "PENDING" && (
                  <>
                     <Button size="md" variant="destructive" onClick={onCancel} className="w-full">
                        Cancel
                     </Button>
                     <Button size="md" variant="primary" onClick={onPrepare} className="w-full">
                        Prepare
                     </Button>
                  </>
                )}
                
                {order.status === "PREPARING" && (
                    <div className="col-span-2">
                        <Button size="md" variant="primary" onClick={onComplete} className="w-full bg-primary-500 hover:bg-primary-600 text-white shadow-soft-lg">
                            Complete Order
                        </Button>
                    </div>
                )}

                {order.status === "COMPLETED" && !order.isPaid && (
                     <div className="col-span-2">
                        <Button size="md" variant="primary" onClick={onMarkPaid} className="w-full">
                            Mark as Paid
                        </Button>
                     </div>
                )}
             </div>
        </div>
      </div>
    </div>
  );
}

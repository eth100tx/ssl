'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface OrderDetails {
  id: number;
  order_number: string;
  type: string;
  status: string;
  event_date: string | null;
  event_address: string | null;
  event_city: string | null;
  event_state: string | null;
  event_zip: string | null;
  comments: string | null;
  customer_name: string;
  customer_company: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  customer_city: string | null;
  customer_state: string | null;
  customer_zip: string | null;
  items: Array<{
    id: number;
    item_type: string;
    description: string | null;
    skill: string | null;
    quantity: number;
    unit_price: number | null;
    hours: number | null;
    rental_start: string | null;
    rental_end: string | null;
    total: number | null;
    equipment_name: string | null;
    equipment_serial: string | null;
  }>;
}

interface OrderWorker {
  id: number;
  employee_name: string;
  employee_role: string;
  employee_phone: string | null;
  employee_beeper: string | null;
  role: string | null;
  skills: string | null;
  notes: string | null;
}

export default function SupportSheetPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [workers, setWorkers] = useState<OrderWorker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orderRes, workersRes] = await Promise.all([
          fetch(`/api/orders/${id}`),
          fetch(`/api/orders/${id}/workers`),
        ]);

        if (orderRes.ok) {
          const orderData = await orderRes.json();
          setOrder(orderData);
        }
        if (workersRes.ok) {
          const workersData = await workersRes.json();
          setWorkers(workersData);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">Order not found</p>
      </div>
    );
  }

  // Separate equipment items by type
  const equipmentItems = order.items?.filter((i) => i.item_type !== 'operator') || [];
  const operatorItems = order.items?.filter((i) => i.item_type === 'operator') || [];

  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .print-page {
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-white print-page">
        {/* Print Controls - Hidden when printing */}
        <div className="no-print fixed top-4 right-4 flex gap-2 z-50">
          <button
            onClick={() => router.push(`/orders/${id}`)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow-lg hover:bg-gray-700"
          >
            Back to Order
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg shadow-lg hover:bg-amber-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>

        <div className="max-w-4xl mx-auto p-8">
          {/* Header */}
          <div className="border-b-4 border-black pb-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-black">SSL Inc.</h1>
                <p className="text-lg text-black">Sound & Lighting Services</p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold">EVENT SUPPORT SHEET</h2>
                <p className="text-lg font-semibold">{order.order_number}</p>
              </div>
            </div>
          </div>

          {/* Event & Customer Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="border border-black rounded-lg p-4">
              <h3 className="text-sm font-bold uppercase text-black mb-3 border-b border-black pb-1">Event Information</h3>
              <div className="space-y-2 text-black">
                <div>
                  <span className="font-semibold">Date:</span>{' '}
                  <span className="text-lg font-medium">{formatDate(order.event_date)}</span>
                </div>
                <div>
                  <span className="font-semibold">Location:</span>
                  <div className="ml-4">
                    {order.event_address && <div>{order.event_address}</div>}
                    <div>
                      {[order.event_city, order.event_state, order.event_zip].filter(Boolean).join(', ') || '-'}
                    </div>
                  </div>
                </div>
                {order.comments && (
                  <div>
                    <span className="font-semibold">Notes:</span>
                    <div className="ml-4 text-sm">{order.comments}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="border border-black rounded-lg p-4">
              <h3 className="text-sm font-bold uppercase text-black mb-3 border-b border-black pb-1">Customer</h3>
              <div className="space-y-2 text-black">
                <div className="text-lg font-semibold">{order.customer_name}</div>
                {order.customer_company && (
                  <div>{order.customer_company}</div>
                )}
                {order.customer_phone && (
                  <div>
                    <span className="font-semibold">Phone:</span> {order.customer_phone}
                  </div>
                )}
                {order.customer_address && (
                  <div className="text-sm">
                    {order.customer_address}<br />
                    {[order.customer_city, order.customer_state, order.customer_zip].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Assigned Crew */}
          {workers.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold uppercase border-b-2 border-black pb-2 mb-4 text-black">Assigned Crew</h3>
              <table className="w-full text-black">
                <thead>
                  <tr className="border-b border-black">
                    <th className="text-left py-2 font-bold">Name</th>
                    <th className="text-left py-2 font-bold">Role</th>
                    <th className="text-left py-2 font-bold">Contact</th>
                    <th className="text-left py-2 font-bold">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((worker) => (
                    <tr key={worker.id} className="border-b border-black">
                      <td className="py-2 font-medium">{worker.employee_name}</td>
                      <td className="py-2">
                        {worker.role || worker.employee_role}
                        {worker.skills && (
                          <div className="text-xs">{worker.skills}</div>
                        )}
                      </td>
                      <td className="py-2 text-sm">
                        {worker.employee_phone && <div>{worker.employee_phone}</div>}
                        {worker.employee_beeper && (
                          <div>Beeper: {worker.employee_beeper}</div>
                        )}
                      </td>
                      <td className="py-2 text-sm">{worker.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Equipment List */}
          {equipmentItems.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold uppercase border-b-2 border-black pb-2 mb-4 text-black">Equipment</h3>
              <table className="w-full text-black">
                <thead>
                  <tr className="border-b border-black">
                    <th className="text-left py-2 font-bold">Item</th>
                    <th className="text-center py-2 font-bold">Type</th>
                    <th className="text-center py-2 font-bold">Qty</th>
                    <th className="text-center py-2 font-bold">Serial #</th>
                    <th className="text-left py-2 font-bold">Dates</th>
                  </tr>
                </thead>
                <tbody>
                  {equipmentItems.map((item) => (
                    <tr key={item.id} className="border-b border-black">
                      <td className="py-2">
                        <div className="font-medium">{item.equipment_name || item.description || '-'}</div>
                      </td>
                      <td className="py-2 text-center">
                        <span className="px-2 py-1 bg-gray-200 text-black text-xs rounded capitalize font-medium">
                          {item.item_type}
                        </span>
                      </td>
                      <td className="py-2 text-center font-medium">{item.quantity}</td>
                      <td className="py-2 text-center text-sm">
                        {item.equipment_serial || '-'}
                      </td>
                      <td className="py-2 text-sm">
                        {item.rental_start && item.rental_end ? (
                          <span>
                            {new Date(item.rental_start).toLocaleDateString()} -{' '}
                            {new Date(item.rental_end).toLocaleDateString()}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Operator Support */}
          {operatorItems.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold uppercase border-b-2 border-black pb-2 mb-4 text-black">Operator Support Required</h3>
              <table className="w-full text-black">
                <thead>
                  <tr className="border-b border-black">
                    <th className="text-left py-2 font-bold">Description</th>
                    <th className="text-left py-2 font-bold">Skill</th>
                    <th className="text-center py-2 font-bold">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {operatorItems.map((item) => (
                    <tr key={item.id} className="border-b border-black">
                      <td className="py-2 font-medium">{item.description || '-'}</td>
                      <td className="py-2">
                        {item.skill && (
                          <span className="px-2 py-1 bg-gray-200 text-black text-xs rounded font-medium">
                            {item.skill}
                          </span>
                        )}
                      </td>
                      <td className="py-2 text-center font-medium">{item.hours || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Checklist Section */}
          <div className="mt-8 border-t-2 border-black pt-4 text-black">
            <h3 className="text-lg font-bold uppercase mb-4">Pre-Event Checklist</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-black rounded"></div>
                  <span>Equipment loaded and checked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-black rounded"></div>
                  <span>Cables and accessories packed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-black rounded"></div>
                  <span>Customer contact confirmed</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-black rounded"></div>
                  <span>Crew briefed on event</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-black rounded"></div>
                  <span>Directions to venue verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-black rounded"></div>
                  <span>Emergency contacts noted</span>
                </div>
              </div>
            </div>
          </div>

          {/* Time Log */}
          <div className="mt-8 border-t-2 border-black pt-4 text-black">
            <h3 className="text-lg font-bold uppercase mb-4">Time Log</h3>
            <table className="w-full border border-black">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-black p-2 text-left font-bold">Crew Member</th>
                  <th className="border border-black p-2 font-bold">Time In</th>
                  <th className="border border-black p-2 font-bold">Time Out</th>
                  <th className="border border-black p-2 font-bold">Total Hours</th>
                  <th className="border border-black p-2 font-bold">Signature</th>
                </tr>
              </thead>
              <tbody>
                {workers.length > 0 ? (
                  workers.map((worker) => (
                    <tr key={worker.id}>
                      <td className="border border-black p-2 font-medium">{worker.employee_name}</td>
                      <td className="border border-black p-2 h-10"></td>
                      <td className="border border-black p-2"></td>
                      <td className="border border-black p-2"></td>
                      <td className="border border-black p-2"></td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr><td className="border border-black p-2"></td><td className="border border-black p-2 h-10"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
                    <tr><td className="border border-black p-2"></td><td className="border border-black p-2 h-10"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
                    <tr><td className="border border-black p-2"></td><td className="border border-black p-2 h-10"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td><td className="border border-black p-2"></td></tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-black text-center text-sm text-black">
            <p>Generated: {new Date().toLocaleString()}</p>
            <p className="font-medium">SSL Inc. - Sound & Lighting Services</p>
          </div>
        </div>
      </div>
    </>
  );
}

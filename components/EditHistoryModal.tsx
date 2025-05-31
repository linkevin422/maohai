'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Dialog } from '@headlessui/react';
import { format } from 'date-fns';

type Props = {
  locationId: string;
  open: boolean;
  onClose: () => void;
};

type EditLog = {
  id: string;
  user_id: string;
  edited_fields: Record<string, any>;
  created_at: string;
};

export default function EditHistoryModal({ locationId, open, onClose }: Props) {
  const [logs, setLogs] = useState<EditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;

    const fetchLogs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('location_edits')
        .select('*')
        .eq('location_id', locationId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch edit logs:', error);
        setLogs([]);
      } else {
        setLogs(data);
      }
      setLoading(false);
    };

    fetchLogs();
  }, [open, locationId]);

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="max-w-2xl w-full bg-white rounded-lg shadow-lg overflow-auto max-h-[90vh] p-6 text-black">
          <Dialog.Title className="text-lg font-bold mb-4">📝 Edit History</Dialog.Title>

          {loading ? (
            <p>Loading...</p>
          ) : logs.length === 0 ? (
            <p>No edits found for this location.</p>
          ) : (
            <ul className="space-y-4">
              {logs.map((log) => (
                <li key={log.id} className="border-b pb-2">
                  <div className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">{log.user_id}</span> on{' '}
                    {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm')}
                  </div>
                  <ul className="ml-4 list-disc text-sm">
                    {Object.entries(log.edited_fields).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key}</strong>: {JSON.stringify(value)}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={onClose}
            className="mt-6 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Close
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

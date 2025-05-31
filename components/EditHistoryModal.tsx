'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Dialog } from '@headlessui/react';
import { format } from 'date-fns';
import { useText } from '@/lib/getText';

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
  name?: string;
  url?: string;
};

export default function EditHistoryModal({ locationId, open, onClose }: Props) {
  const supabase = createClientComponentClient();
  const { getText } = useText();
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
        console.error('❌ Failed to fetch logs:', error);
        setLogs([]);
      } else {
        setLogs(data || []);
      }

      setLoading(false);
    };

    fetchLogs();
  }, [open, locationId]);

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="max-w-2xl w-full bg-white rounded-xl shadow-2xl overflow-auto max-h-[90vh] p-6 text-black">
          <Dialog.Title className="text-xl font-bold mb-6">
            📝 {getText('mapsubmit_change_log')}
          </Dialog.Title>

          {loading ? (
            <p className="text-gray-600">{getText('mapsubmit_loading')}</p>
          ) : logs.length === 0 ? (
            <p className="text-gray-600">{getText('mapsubmit_no_edits')}</p>
          ) : (
            <ul className="space-y-6">
              {logs.map((log) => (
                <li key={log.id} className="border-b pb-4">
                  <div className="text-sm text-gray-500 mb-2">
                    <span className="font-medium">{log.user_id}</span>{' '}
                    {getText('mapsubmit_on')}{' '}
                    {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm')}
                  </div>

                  <ul className="ml-4 list-disc text-sm space-y-1 break-words">
                    {Object.entries(log.edited_fields).map(([key, value]) => {
                      const label = getText(`field_${key}`) || key;

                      if (value?.before !== undefined && value?.after !== undefined) {
                        return (
                          <li key={key}>
                            <strong>{label}</strong>:&nbsp;
                            <span className="line-through text-red-600">{value.before}</span>{' '}
                            → <span className="text-green-700">{value.after}</span>
                          </li>
                        );
                      }

                      return (
                        <li key={key}>
                          <strong>{label}</strong>: {JSON.stringify(value)}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 text-right">
            <button
              onClick={onClose}
              className="inline-block bg-gray-800 text-white px-5 py-2 rounded hover:bg-gray-700 transition"
            >
              {getText('mapsubmit_close')}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

import { Bell } from 'lucide-react';
import { DateObject } from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    // Ensure the date is treated correctly, regardless of timezone issues
    const date = new Date(dateStr);
    return new DateObject({ date, calendar: persian, locale: persian_fa }).format("dddd DD MMMM");
};

export default function UpcomingEvents({ events }) {
    if (!events || events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-content-400">
                <Bell size={48} />
                <p className="mt-4 text-sm">هیچ رویداد مهمی در ۱۴ روز آینده ندارید.</p>
            </div>
        );
    }
    
    return (
        <ul className="divide-y divide-content-200">
            {events.map((event, index) => (
                <li key={index} className="py-3 flex justify-between items-center">
                    <div>
                        <p className="font-semibold text-content-800">{event.symbol}</p>
                        <p className="text-sm text-content-500">{event.type === 'Option' ? 'سررسید اختیار' : 'سررسید کاورد کال'}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-primary-600">{`${event.days_left} روز دیگر`}</p>
                        <p className="text-xs text-content-400">{formatDate(event.date)}</p>
                    </div>
                </li>
            ))}
        </ul>
    );
}
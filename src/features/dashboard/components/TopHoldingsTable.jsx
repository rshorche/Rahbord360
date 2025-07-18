import { formatCurrency } from '../../../shared/utils/formatters';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';

export default function TopHoldingsTable({ data }) {
  if (!data || data.length === 0) {
    return <div className="h-full w-full flex items-center justify-center text-content-400">هیچ دارایی بازی برای نمایش وجود ندارد.</div>;
  }

  return (
    <div className="flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table className="min-w-full divide-y divide-content-200">
            <thead>
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-right text-sm font-semibold text-content-900 sm:pl-0">نماد</th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-content-900">ارزش روز</th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-content-900">سود/زیان باز</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-content-200">
              {data.map((item) => (
                <tr key={item.symbol}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-content-900 sm:pl-0">{item.symbol}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-content-500">{formatCurrency(item.currentValue)}</td>
                  <td className={cn("whitespace-nowrap px-3 py-4 text-sm font-semibold", item.unrealizedPL >= 0 ? 'text-success-600' : 'text-danger-600')}>
                    <div className="flex items-center">
                       {item.unrealizedPL >= 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                       {formatCurrency(item.unrealizedPL)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
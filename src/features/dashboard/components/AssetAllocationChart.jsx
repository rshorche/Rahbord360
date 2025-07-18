import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '../../../shared/utils/formatters';

const COLORS = ['#0ea5e9', '#f97316', '#8b5cf6'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/80 backdrop-blur-sm p-3 border border-content-200 rounded-lg shadow-lg">
        <p className="font-bold">{`${data.name}: ${formatCurrency(data.value)}`}</p>
        <p className="text-sm text-content-600">{`حدود ${data.percent.toFixed(1)}٪ از کل دارایی`}</p>
      </div>
    );
  }
  return null;
};

export default function AssetAllocationChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="h-full w-full flex items-center justify-center text-content-400">داده‌ای برای نمایش وجود ندارد.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip content={<CustomTooltip />} />
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend 
            iconType="circle"
            formatter={(value) => (
                <span className="text-content-700 font-medium ml-2">{value}</span>
            )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '../../../shared/utils/formatters';
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const formatDateToJalali = (dateStr) => {
    if (!dateStr) return '';
    return new DateObject({ date: dateStr, calendar: persian, locale: persian_fa }).format("YY/MM/DD");
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 backdrop-blur-sm p-3 border border-content-200 rounded-lg shadow-lg">
        <p className="font-bold mb-2">{`تاریخ: ${formatDateToJalali(label)}`}</p>
        {payload.map((p, index) => (
             <p key={index} style={{ color: p.color }}>
                {`${p.name}: ${formatCurrency(p.value)}`}
            </p>
        ))}
      </div>
    );
  }
  return null;
};


export default function PortfolioGrowthChart({ data }) {
   if (!data || data.length === 0) {
    return <div className="h-full w-full flex items-center justify-center text-content-400">داده‌ای برای نمایش رشد سرمایه وجود ندارد.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 20,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tickFormatter={formatDateToJalali} />
        <YAxis tickFormatter={(value) => new Intl.NumberFormat('fa-IR').format(value)} />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
            verticalAlign="top" 
            align="left" 
            iconType="circle"
            formatter={(value) => <span className="text-content-700 font-medium ml-2">{value}</span>}
        />
        <Area type="monotone" dataKey="total_value" name="ارزش کل سبد" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.1} />
        <Area type="monotone" dataKey="net_deposits" name="آورده خالص" stroke="#f97316" fill="#f97316" fillOpacity={0.1} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '../../../shared/utils/formatters';
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

// فرمت جدید تاریخ برای نمایش "روز ماه"
const formatDateToJalali = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return new DateObject({ date, calendar: persian, locale: persian_fa }).format("D MMMM");
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const formattedLabel = new DateObject({ date: new Date(label), calendar: persian, locale: persian_fa }).format("YYYY/MM/DD");
    return (
      <div className="bg-white/80 backdrop-blur-sm p-3 border border-content-200 rounded-lg shadow-lg">
        <p className="font-bold mb-2">{`تاریخ: ${formattedLabel}`}</p>
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
   if (!data || data.length < 2) {
    return <div className="h-full w-full flex items-center justify-center text-content-400">داده کافی برای نمایش نمودار رشد وجود ندارد.</div>;
  }
  
  const chartData = data.map(item => ({
    ...item,
    date: new Date(item.date).getTime(),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
      >
        <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={(unixTime) => formatDateToJalali(new Date(unixTime))}
            dy={10}
            type="number"
            domain={['dataMin', 'dataMax']}
            scale="time"
        />
        <YAxis 
            hide={true} 
            domain={['auto', 'auto']}
        />
        <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '3 3' }}
        />
        <Legend 
            verticalAlign="bottom"
            wrapperStyle={{ paddingTop: '25px' }}
            iconType="circle"
            formatter={(value) => <span className="text-content-700 font-medium ml-2">{value}</span>}
        />
        {/* **تغییر کلیدی:** خط دوم حالا capital_growth را نمایش می‌دهد */}
        <Line type="monotone" dataKey="capital_growth" name="افزایش سرمایه" stroke="#0ea5e9" strokeWidth={2.5} dot={false} activeDot={{ r: 8, strokeWidth: 2, fill: '#fff' }} />
        <Line type="monotone" dataKey="net_deposits" name="آورده خالص" stroke="#f97316" strokeWidth={2.5} dot={false} activeDot={{ r: 8, strokeWidth: 2, fill: '#fff' }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
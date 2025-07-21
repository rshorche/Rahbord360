import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { formatCurrency } from '../../../shared/utils/formatters';
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const formatDateToJalali = (dateStr) => {
    if (!dateStr) return '';
    return new DateObject({ date: new Date(dateStr), calendar: persian, locale: persian_fa }).format("YYYY/MM/DD");
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

const formatYAxisTick = (tick) => {
  if (Math.abs(tick) >= 1000000000) {
    return `${(tick / 1000000000).toLocaleString('fa-IR')} B`;
  }
  if (Math.abs(tick) >= 1000000) {
    return `${(tick / 1000000).toLocaleString('fa-IR')} M`;
  }
  if (Math.abs(tick) >= 1000) {
    return `${(tick / 1000).toLocaleString('fa-IR')} K`;
  }
  return tick.toLocaleString('fa-IR');
};

const getDynamicTicks = (data) => {
    const maxValue = Math.max(...data.map(d => d.total_value), ...data.map(d => d.net_deposits));
    if (maxValue <= 0) return { domain: [0, 1000], ticks: [0, 500, 1000] };

    const orderOfMagnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
    const firstDigit = Math.floor(maxValue / orderOfMagnitude);

    let step;
    if (firstDigit < 2) {
        step = orderOfMagnitude / 2;
    } else if (firstDigit < 5) {
        step = orderOfMagnitude;
    } else {
        step = orderOfMagnitude * 2;
    }
    
    const upperBound = Math.ceil(maxValue / step) * step;
    const ticks = [];
    for (let i = 0; i <= upperBound; i += step) {
        ticks.push(i);
    }

    return { domain: [0, upperBound], ticks };
};


export default function PortfolioGrowthChart({ data }) {
   if (!data || data.length === 0) {
    return <div className="h-full w-full flex items-center justify-center text-content-400">داده‌ای برای نمایش رشد سرمایه وجود ندارد.</div>;
  }
  
  const { domain, ticks } = getDynamicTicks(data);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: -10, // --- FINAL CORRECTION ---
          bottom: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={formatDateToJalali}
            dy={10}
        />
        <YAxis 
            axisLine={false} 
            tickLine={false}
            tickFormatter={formatYAxisTick} 
            width={60}
            domain={domain}
            ticks={ticks}
        />
        <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '3 3' }}
        />
        <Legend 
            verticalAlign="bottom"
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
            formatter={(value) => <span className="text-content-700 font-medium ml-2">{value}</span>}
        />
        <Line type="monotone" dataKey="total_value" name="ارزش کل سبد" stroke="#0ea5e9" strokeWidth={2.5} dot={false} activeDot={{ r: 8, strokeWidth: 2, fill: '#fff' }} />
        <Line type="monotone" dataKey="net_deposits" name="آورده خالص" stroke="#f97316" strokeWidth={2.5} dot={false} activeDot={{ r: 8, strokeWidth: 2, fill: '#fff' }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
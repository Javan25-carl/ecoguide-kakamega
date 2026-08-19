import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function IncomeChart({ data }) {
  return (
    <div className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-6">
      <h3 className="font-semibold text-charcoal dark:text-white text-sm mb-4">
        Earnings by month
      </h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#26323814" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#26323899" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#26323899" }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(value) => [`KSh ${value.toLocaleString()}`, "Earnings"]}
              contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(38,50,56,0.12)" }}
            />
            <Bar dataKey="earnings" fill="#2E7D32" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

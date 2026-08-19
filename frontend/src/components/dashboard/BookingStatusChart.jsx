import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = {
  Pending: "#FFC107",
  Active: "#4FC3F7",
  Completed: "#2E7D32",
  Rejected: "#EF5350",
  Cancelled: "#90A4AE",
};

export default function BookingStatusChart({ stats }) {
  const data = [
    { name: "Pending", value: stats.pending_trips || 0 },
    { name: "Active", value: stats.active_trips || 0 },
    { name: "Completed", value: stats.completed_trips || 0 },
    { name: "Rejected", value: stats.rejected_trips || 0 },
    { name: "Cancelled", value: stats.cancelled_trips || 0 },
  ].filter((d) => d.value > 0);

  return (
    <div className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-6">
      <h3 className="font-semibold text-charcoal dark:text-white text-sm mb-4">
        Bookings by status
      </h3>
      <div className="h-64">
        {data.length === 0 ? (
          <div className="h-full grid place-items-center text-sm text-charcoal/40 dark:text-white/40">
            No bookings yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {data.map((d) => (
                  <Cell key={d.name} fill={COLORS[d.name]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(38,50,56,0.12)" }} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

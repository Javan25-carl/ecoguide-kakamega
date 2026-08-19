import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, X, ChevronLeft, ChevronRight, ArrowUpRight, Loader2 } from "lucide-react";
import api from "../../services/api.js";

const STATUS_STYLE = {
  pending: "bg-gold/15 text-gold",
  accepted: "bg-forest/15 text-forest",
  rejected: "bg-red-100 text-red-500",
  cancelled: "bg-charcoal/10 text-charcoal/50",
  completed: "bg-sky/15 text-sky",
};

const PAYMENT_STYLE = {
  unpaid: "bg-charcoal/10 text-charcoal/50 dark:bg-white/10 dark:text-white/50",
  paid: "bg-forest/15 text-forest",
};

const STATUSES = ["all", "pending", "accepted", "completed", "rejected", "cancelled"];
const PAYMENT_STATUSES = ["all", "unpaid", "paid"];
const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price_high", label: "Highest price" },
  { value: "price_low", label: "Lowest price" },
];

const PER_PAGE = 15;

/**
 * Fully self-contained: owns its own search/filter/sort/pagination state
 * and fetches directly from the backend's real query-param-driven endpoint
 * (GET /admin/bookings) rather than receiving a flat list from the parent
 * and slicing it client-side. The backend already supported search,
 * per-field filters, four sort orders, and real pagination - this
 * component is what was missing to actually use any of it.
 */
export default function BookingManagementTable() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const debounceRef = useRef(null);

  // Debounce the search box so we're not firing a request on every keystroke
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQ(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  const fetchBookings = useCallback(() => {
    setLoading(true);
    const params = { page, per_page: PER_PAGE, sort };
    if (q) params.q = q;
    if (status !== "all") params.status = status;
    if (paymentStatus !== "all") params.payment_status = paymentStatus;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;

    api
      .get("/admin/bookings", { params })
      .then(({ data }) => {
        setBookings(data.bookings || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [q, status, paymentStatus, dateFrom, dateTo, sort, page]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  // Any filter change (other than page itself) should reset back to page 1
  useEffect(() => { setPage(1); }, [status, paymentStatus, dateFrom, dateTo, sort]);

  const clearFilters = () => {
    setSearchInput("");
    setQ("");
    setStatus("all");
    setPaymentStatus("all");
    setDateFrom("");
    setDateTo("");
    setSort("newest");
    setPage(1);
  };

  const hasActiveFilters =
    q || status !== "all" || paymentStatus !== "all" || dateFrom || dateTo || sort !== "newest";

  return (
    <div className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="font-semibold text-charcoal dark:text-white text-sm">
          Booking management {total > 0 && `(${total})`}
        </h3>
        <div className="flex items-center gap-1 bg-soft dark:bg-white/5 rounded-full p-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize transition-colors ${
                status === s ? "bg-forest text-white" : "text-charcoal/55 dark:text-white/45"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <div className="flex items-center gap-2 bg-soft dark:bg-white/5 rounded-xl px-3 py-2 flex-1 min-w-[200px]">
          <Search size={14} className="text-charcoal/40 dark:text-white/35 shrink-0" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by booking ID, tourist, guide, or attraction..."
            className="w-full text-sm bg-transparent outline-none text-charcoal dark:text-white"
          />
        </div>

        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="text-xs font-medium bg-soft dark:bg-white/5 text-charcoal dark:text-white rounded-xl px-3 py-2 outline-none"
        >
          {PAYMENT_STATUSES.map((p) => (
            <option key={p} value={p}>{p === "all" ? "Any payment status" : p}</option>
          ))}
        </select>

        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          title="From date"
          className="text-xs font-medium bg-soft dark:bg-white/5 text-charcoal dark:text-white rounded-xl px-3 py-2 outline-none"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          title="To date"
          className="text-xs font-medium bg-soft dark:bg-white/5 text-charcoal dark:text-white rounded-xl px-3 py-2 outline-none"
        />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="text-xs font-medium bg-soft dark:bg-white/5 text-charcoal dark:text-white rounded-xl px-3 py-2 outline-none"
        >
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs font-semibold text-charcoal/50 dark:text-white/40 hover:text-red-500 transition-colors px-2"
          >
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-charcoal/40 dark:text-white/40 text-sm py-6 justify-center">
          <Loader2 size={15} className="animate-spin" /> Loading...
        </div>
      )}

      {!loading && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-charcoal/45 dark:text-white/40 border-b border-charcoal/10 dark:border-white/10">
                <th className="pb-2 font-medium">Tourist</th>
                <th className="pb-2 font-medium">Guide</th>
                <th className="pb-2 font-medium">Trip date</th>
                <th className="pb-2 font-medium">Amount</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Payment</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-charcoal/5 dark:border-white/5 last:border-0">
                  <td className="py-2.5 text-charcoal dark:text-white font-medium">{b.tourist_name || "—"}</td>
                  <td className="py-2.5 text-charcoal/60 dark:text-white/50">{b.guide_name || "—"}</td>
                  <td className="py-2.5 text-charcoal/60 dark:text-white/50">{b.trip_date}</td>
                  <td className="py-2.5 text-charcoal/60 dark:text-white/50">
                    KSh {b.total_price?.toLocaleString?.() ?? 0}
                  </td>
                  <td className="py-2.5">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[b.status]}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${PAYMENT_STYLE[b.payment_status] || PAYMENT_STYLE.unpaid}`}>
                      {b.payment_status || "unpaid"}
                    </span>
                  </td>
                  <td className="py-2.5 text-right">
                    <Link
                      to={`/bookings/${b.id}`}
                      className="inline-grid place-items-center w-7 h-7 rounded-full text-charcoal/40 dark:text-white/35 hover:bg-soft dark:hover:bg-white/10 hover:text-forest transition-colors"
                      title="View details"
                    >
                      <ArrowUpRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-charcoal/40 dark:text-white/35">
                    No bookings match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && pages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-charcoal/10 dark:border-white/10">
          <p className="text-xs text-charcoal/45 dark:text-white/40">
            Page {page} of {pages}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 grid place-items-center rounded-full bg-soft dark:bg-white/5 text-charcoal/60 dark:text-white/50 disabled:opacity-40 hover:bg-forest/10 hover:text-forest transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              disabled={page >= pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              className="w-8 h-8 grid place-items-center rounded-full bg-soft dark:bg-white/5 text-charcoal/60 dark:text-white/50 disabled:opacity-40 hover:bg-forest/10 hover:text-forest transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

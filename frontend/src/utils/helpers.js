export const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty', 'Other'];
export const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export const stockLabel = (n) => {
  if (n <= 0) return { label: 'Out of Stock', cls: 'out' };
  if (n <= 5)  return { label: `Only ${n} left`, cls: 'low' };
  return { label: 'In Stock', cls: 'in' };
};

export const errMsg = (err) =>
  err?.response?.data?.message ||
  err?.response?.data?.errors?.[0]?.msg ||
  err?.message ||
  'Something went wrong';

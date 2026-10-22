/* Next 12 months ("Oct 2026" …) + "Flexible" — the travel-month choices used by forms across the site. */
export const nextMonths = () => Array.from({ length: 12 }, (_, i) => { const x = new Date(); x.setDate(1); x.setMonth(x.getMonth() + i); return x.toLocaleString('en-US', { month: 'short', year: 'numeric' }); });

/* <option> elements; `sel` is pre-selected (pass as the <select>'s defaultValue instead when the select is controlled) */
export const monthOptions = ({ flexible = true } = {}) => [...nextMonths(), ...(flexible ? ['Flexible'] : [])].map(m => <option key={m}>{m}</option>);

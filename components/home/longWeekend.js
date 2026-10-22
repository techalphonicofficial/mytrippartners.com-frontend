/* next long weekend on or after the date t ("YYYY-MM-DD"): [date, banner label, text] (original polish.js nextLongWeekend) */
export const nextLongWeekend = (list, t) => (list || []).find(x => x[0] >= t) || ['', 'ANY WEEKEND', 'Take a Friday off and we plan the rest.'];

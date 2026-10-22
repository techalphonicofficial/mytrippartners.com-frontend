/* Booking stage tracker (original statusTrack(n)): n = current stage 1…5. */
import { I } from '@/components/icons';
import { STAGES } from '@/lib/booking/calc';

export default function StatusTrack({ n }) {
  return <ol className="track">{STAGES.map((t, i) => <li key={t} className={`${i < n ? 'done' : ''} ${i === n - 1 ? 'cur' : ''}`}><span>{i < n ? I.tick : i + 1}</span><small>{t}</small></li>)}</ol>;
}

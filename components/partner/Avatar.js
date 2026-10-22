/* Initials avatar of a travel partner (original avatar(b, big)): <span class="av-b [big]" style="--h:…">AS</span>.
   Server-safe; used by the home page partner banner and the partner pages. b needs { id, name }. */
export const hueOf = id => [...String(id)].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
export const initials = name => String(name || '').split(' ').map(x => x[0]).join('');

export default function Avatar({ b, big }) {
  return <span className={'av-b ' + (big ? 'big' : '')} style={{ '--h': hueOf(b.id) }} aria-hidden="true">{initials(b.name)}</span>;
}

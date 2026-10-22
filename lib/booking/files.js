/* Payment-proof files → data URIs (client only). Photos are re-encoded as JPEG (max side `max` px) like the
   original fileToJpeg (partner2.js); PDFs are read as they are (max 3 MB). */
export function fileToJpeg(file, max) {
  return new Promise((res, rej) => {
    if (!file || !/^image\//.test(file.type)) return rej(new Error('Please choose a photo (JPG or PNG).'));
    if (file.size > 12e6) return rej(new Error('That file is too large (max 12 MB).'));
    const url = URL.createObjectURL(file), im = new Image();
    im.onload = () => {
      const r = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight)), w = Math.round(im.naturalWidth * r), h = Math.round(im.naturalHeight * r);
      const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(im, 0, 0, im.naturalWidth, im.naturalHeight, 0, 0, w, h);
      URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', 0.82));
    };
    im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('Could not read that image.')); };
    im.src = url;
  });
}

export const readDataUri = file => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(new Error('Could not read that file.')); r.readAsDataURL(file); });

/* → { file, fileType: 'pdf'|'jpg', fileName } or throws with the message to show */
export async function readProof(file) {
  if (file.type === 'application/pdf') { if (file.size > 3e6) throw new Error('The PDF must be under 3 MB.'); return { file: await readDataUri(file), fileType: 'pdf', fileName: file.name.slice(0, 60) }; }
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('Please upload a JPG, PNG or PDF.');
  return { file: await fileToJpeg(file, 1600), fileType: 'jpg', fileName: file.name.slice(0, 60) };
}

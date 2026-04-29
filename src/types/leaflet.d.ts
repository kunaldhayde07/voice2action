// leaflet ships its own types via @types/leaflet
// this file handles a few edge cases that trip up Next.js SSR

declare module 'leaflet' {
  // re-export everything — the main types package handles the rest
}

// make sure the leaflet CSS import doesn't confuse TypeScript
declare module 'leaflet/dist/leaflet.css' {
  const content: string;
  export default content;
}
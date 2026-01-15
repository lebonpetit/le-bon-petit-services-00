/// <reference types="vite/client" />

// Declare vite-imagetools query parameters
declare module '*?format=webp&quality=80' {
    const src: string;
    export default src;
}

declare module '*?format=webp' {
    const src: string;
    export default src;
}

declare module '*.png?*' {
    const src: string;
    export default src;
}

declare module '*.jpg?*' {
    const src: string;
    export default src;
}

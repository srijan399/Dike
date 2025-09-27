export const dikeTheme = {
    gradientColors: ["#1e1b4b", "#312e81", "#3730a3", "#1e40af"],
    backgroundOverlayClass: "bg-black/40 backdrop-blur-[1px]",
    blinds: {
        angle: 45,
        noise: 0.1,
        blindCount: 20,
        blindMinWidth: 80,
        spotlightRadius: 0.5,
        spotlightSoftness: 0.7,
        spotlightOpacity: 0.4,
        mouseDampening: 0.25,
        distortAmount: 8,
        shineDirection: "right" as const,
        mixBlendMode: "multiply" as const,
    },
};

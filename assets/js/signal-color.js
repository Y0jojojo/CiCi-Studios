(() => {
  const signalPalette = [
    { color: "#ff7043", rgb: "255, 112, 67" },
    { color: "#40c4ff", rgb: "64, 196, 255" },
    { color: "#ffd740", rgb: "255, 215, 64" },
    { color: "#ff5ca8", rgb: "255, 92, 168" },
    { color: "#a8e063", rgb: "168, 224, 99" },
    { color: "#b39ddb", rgb: "179, 157, 219" }
  ];
  const signalColor = signalPalette[Math.floor(Math.random() * signalPalette.length)];
  document.documentElement.style.setProperty("--signal", signalColor.color);
  document.documentElement.style.setProperty("--signal-rgb", signalColor.rgb);
})();


function press(button) {
  console.log("Button pressed:", button);
  // Integrate with emulator key mapping
}

document.getElementById('rom-loader').addEventListener('change', function(evt) {
  const file = evt.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const romData = new Uint8Array(e.target.result);
    console.log("ROM loaded. Length:", romData.length);
    // Here you'd pass romData to the emulator instance
  };
  reader.readAsArrayBuffer(file);
});

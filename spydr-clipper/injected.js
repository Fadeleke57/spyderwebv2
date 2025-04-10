// injected.js
(function() {
    const token = localStorage.getItem("token");
    console.log("Injected script got token:", token);
    if (token) {
      window.postMessage({ type: "SPYDR_TOKEN", token: token }, "*");
    }
  })();
  
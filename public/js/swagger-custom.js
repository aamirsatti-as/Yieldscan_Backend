function generateId() {
  return crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9);
}

let currentRequestId = generateId();

window.onload = () => {
  const ui = SwaggerUIBundle({
    url: "/openapi.yaml",
    dom_id: "#swagger-ui",
    presets: [SwaggerUIBundle.presets.apis],
    layout: "BaseLayout",

    requestInterceptor: (req) => {
      currentRequestId = generateId();

      const url = new URL(req.url, window.location.origin);
      url.searchParams.set("requestId", currentRequestId);
      req.url = url.pathname + url.search;

      setTimeout(() => {
        const container = document.querySelector(".loading-container");
        if (container) {
          let el = container.querySelector(".loading-number");
          if (!el) {
            el = document.createElement("div");
            el.className = "loading-number";
            el.style.marginLeft = "10px";
            el.style.color = "#f93e3e";
            el.style.fontWeight = "bold";
            el.style.position = "relative";
            el.style.left = "-40%";
            container.insertBefore(el, container.firstChild);
          }

          const sse = new EventSource(`/api/long-task/progress?requestId=${currentRequestId}`);
          sse.onmessage = (e) => {
            try {
              const parsed = JSON.parse(e.data);

              const chainStatuses = [];

              const knownChains = ["ETH", "BSC", "ARB"];

              for (const chain of knownChains) {
                const value = parsed[chain];

                if (value === undefined) {
                  chainStatuses.push(`${chain} ⏳`);
                } else if (value === 1) {
                  chainStatuses.push(`${chain} ✅`);
                } else {
                  chainStatuses.push(`${chain} ${value}`);
                }
              }

              el.textContent = chainStatuses.join("   ");
            } catch (ex) {
              // el.textContent = e.data === "done" ? "✔" : e.data;
            }
          };
          sse.onerror = () => sse.close();
        }
      }, 300);

      return req;
    }
  });

  window.ui = ui;
};

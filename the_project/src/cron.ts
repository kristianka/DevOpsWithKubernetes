const wikipediaCronFetch = async () => {
  const serviceUrl =
    process.env.TODO_SERVICE_URL || "http://todo-server-svc.project.svc.cluster.local:2345";
  const basePath = process.env.BASE_PATH || "/project";

  try {
    // seems like wikipedia just has api, no need to yoink it from location header
    const randomTitleRes = await fetch("https://en.wikipedia.org/api/rest_v1/page/random/title");

    if (!randomTitleRes.ok) {
      throw new Error(`Failed to fetch random Wikipedia title, status: ${randomTitleRes.status}`);
    }

    const titleData = await randomTitleRes.json();
    const pageTitle = titleData.items[0].title;
    const todoText = `Read https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`;

    const res = await fetch(`${serviceUrl}${basePath}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: todoText })
    });
    console.log("Wikipedia cron job added todo. Status:", res.status);
  } catch (error) {
    console.error("Failed to add todo:", error);
  }
};

wikipediaCronFetch();

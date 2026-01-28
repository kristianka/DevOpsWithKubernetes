import * as k8s from "@kubernetes/client-node";

const kc = new k8s.KubeConfig();
kc.loadFromCluster();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const appsApi = kc.makeApiClient(k8s.AppsV1Api);
const customApi = kc.makeApiClient(k8s.CustomObjectsApi);

console.log("DummySite Controller started");

// Fetch HTML from URL
const fetchWebsiteContent = async (url: string) => {
  try {
    const response = await fetch(url);
    const html = await response.text();
    console.log(`Fetched ${html.length} bytes from ${url}`);
    return html;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
};

// Create resources for a DummySite
const reconcileDummySite = async (dummySite: any) => {
  const name = dummySite.metadata.name || "unknown";
  const namespace = dummySite.metadata.namespace || "default";
  const websiteUrl = dummySite.spec.website_url;

  console.log(`Reconciling DummySite: ${name} with URL: ${websiteUrl}`);

  try {
    const htmlContent = await fetchWebsiteContent(websiteUrl);

    // create ConfigMap with HTML content
    const configMap: k8s.V1ConfigMap = {
      metadata: {
        name: `${name}-html`
      },
      data: {
        "index.html": htmlContent
      }
    };

    try {
      await k8sApi.createNamespacedConfigMap({ namespace, body: configMap });
      console.log(`Created ConfigMap: ${name}-html`);
    } catch (e: any) {
      if (e.response?.statusCode === 409) {
        // Already exists, update it
        await k8sApi.replaceNamespacedConfigMap({
          name: `${name}-html`,
          namespace,
          body: configMap
        });
        console.log(`Updated ConfigMap: ${name}-html`);
      } else {
        throw e;
      }
    }

    // create Deployment with nginx serving the HTML
    const deployment: k8s.V1Deployment = {
      metadata: {
        name: `${name}-site`
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            app: `${name}-site`
          }
        },
        template: {
          metadata: {
            labels: {
              app: `${name}-site`
            }
          },
          spec: {
            containers: [
              {
                name: "nginx",
                image: "nginx:alpine",
                ports: [
                  {
                    containerPort: 80
                  }
                ],
                volumeMounts: [
                  {
                    name: "html",
                    mountPath: "/usr/share/nginx/html"
                  }
                ]
              }
            ],
            volumes: [
              {
                name: "html",
                configMap: {
                  name: `${name}-html`
                }
              }
            ]
          }
        }
      }
    };

    try {
      await appsApi.createNamespacedDeployment({ namespace, body: deployment });
      console.log(`Created Deployment: ${name}-site`);
    } catch (e: any) {
      if (e.response?.statusCode === 409) {
        await appsApi.replaceNamespacedDeployment({
          name: `${name}-site`,
          namespace,
          body: deployment
        });
        console.log(`Updated Deployment: ${name}-site`);
      } else {
        throw e;
      }
    }

    // create Service
    const service: k8s.V1Service = {
      metadata: {
        name: `${name}-service`
      },
      spec: {
        selector: {
          app: `${name}-site`
        },
        ports: [
          {
            protocol: "TCP",
            port: 80,
            targetPort: 80 as any
          }
        ],
        type: "ClusterIP"
      }
    };

    try {
      await k8sApi.createNamespacedService({ namespace, body: service });
      console.log(`Created Service: ${name}-service`);
    } catch (e: any) {
      if (e.response?.statusCode === 409) {
        await k8sApi.replaceNamespacedService({
          name: `${name}-service`,
          namespace,
          body: service
        });
        console.log(`Updated Service: ${name}-service`);
      } else {
        throw e;
      }
    }

    console.log(`Successfully reconciled DummySite: ${name}`);
  } catch (error) {
    console.error(`Error reconciling DummySite ${name}:`, error);
  }
};

// Watch for DummySite resources
const watchDummySites = async () => {
  const watch = new k8s.Watch(kc);

  const req = await watch.watch(
    "/apis/stable.dwk/v1/namespaces/default/dummysites",
    {},
    (type, apiObj) => {
      console.log(`Event: ${type} for DummySite: ${apiObj.metadata.name}`);

      if (type === "ADDED" || type === "MODIFIED") {
        reconcileDummySite(apiObj);
      }
    },
    (err) => {
      console.error("Watch error:", err);
      // Restart watch after a delay
      setTimeout(watchDummySites, 5000);
    }
  );

  console.log("Watching for DummySite resources...");
};

// Start the controller
watchDummySites();

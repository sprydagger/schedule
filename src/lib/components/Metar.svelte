<script>
    import { onMount } from "svelte";
    import { prefs } from "../stores/preferences";

    export let apiKey;

    let metar = "LOADING...";
    let lastUpdated = null;
    let error = false;

    const REFRESH_MS = 5 * 60 * 1000;
    let interval;
    let unsubscribe;

    async function fetchMetar() {
        if (!$prefs.airportCode) return;

        try {
            error = false;

            const res = await fetch(
                `https://avwx.rest/api/metar/${$prefs.airportCode}`,
                {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                    },
                },
            );

            if (!res.ok) throw new Error("fetch failed");

            const data = await res.json();
            metar = data.raw || "NO DATA";
            lastUpdated = new Date();
        } catch {
            error = true;
            metar = "UNAVAILABLE";
        }
    }

    onMount(() => {
        // initial + reactive updates
        unsubscribe = prefs.subscribe(($prefs) => {
            fetchMetar($prefs.airportCode);
        });

        // periodic refresh
        interval = setInterval(() => {
            fetchMetar($prefs.airportCode);
        }, REFRESH_MS);

        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    });
</script>

<br />
<span>{metar}</span>

<script>
    import { onMount } from "svelte";
    import { prefs } from "../stores/preferences";

    export let apiKey;

    let metar = "LOADING...";
    let lastUpdated = null;
    let error = false;

    const REFRESH_MS = 5 * 60 * 1000;
    let interval;

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

    $: if ($prefs.airportCode) {
        fetchMetar();
    }

    onMount(() => {
        fetchMetar();
        interval = setInterval(fetchMetar, REFRESH_MS);

        return () => clearInterval(interval);
    });
</script>

<br />
<span>{metar}</span>

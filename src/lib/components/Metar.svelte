<script>
    import { onMount } from "svelte";
    import { prefs } from "../stores/preferences";
    import { env } from "$env/dynamic/public";

    let apiKey;

    let metar = "LOADING...";
    let taf = "LOADING...";
    let error = false;

    const METAR_REFRESH_MS = 5 * 60 * 1000;
    const TAF_REFRESH_MS = 30 * 60 * 1000;

    let metarInterval;
    let tafInterval;
    let unsubscribe;

    function formatTaf(raw) {
        if (!raw || raw === "NO DATA" || raw === "UNAVAILABLE") return raw;

        return raw
            .replace(/\s+(FM\d{6})/g, "\n  $1")
            .replace(/\s+(TEMPO)/g, "\n  $1")
            .replace(/\s+(BECMG)/g, "\n  $1")
            .replace(/\s+(PROB\d{2})/g, "\n  $1");
    }

    async function fetchMetar() {
        if (!$prefs.airportCode || !apiKey) return;

        try {
            const res = await fetch(
                `https://avwx.rest/api/metar/${$prefs.metarLocation}?onfail=nearest`,
                {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                    },
                },
            );

            if (!res.ok) throw new Error();

            const data = await res.json();
            metar = "METAR " + data.raw || "NO DATA";
        } catch {
            metar = "UNAVAILABLE";
        }
    }

    async function fetchTaf() {
        if (!$prefs.airportCode || !apiKey) return;

        try {
            const res = await fetch(
                `https://avwx.rest/api/taf/${$prefs.tafLocation}?onfail=nearest`,
                {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                    },
                },
            );

            if (!res.ok) throw new Error();

            const data = await res.json();
            taf = "TAF " + data.raw || "NO DATA";
            taf = formatTaf(taf);
        } catch {
            taf = "UNAVAILABLE";
        }
    }

    onMount(() => {
        apiKey = env.PUBLIC_AVWX_TOKEN;

        unsubscribe = prefs.subscribe(($prefs) => {
            fetchMetar($prefs.metarLocation);
            fetchTaf($prefs.tafLocation);
        });

        metarInterval = setInterval(() => {
            fetchMetar($prefs.metarLocation);
        }, METAR_REFRESH_MS);

        tafInterval = setInterval(() => {
            fetchTaf($prefs.tafLocation);
        }, TAF_REFRESH_MS);

        return () => {
            unsubscribe();
            clearInterval(metarInterval);
            clearInterval(tafInterval);
        };
    });
</script>

<br />

<span class="metar-report">{metar}</span>

<br />
<br />

<details>
    <summary>TAF</summary>
    <section>
        <pre style="font-size: 12pt; font-family: 'PT Mono';">{taf}</pre>
    </section>
</details>

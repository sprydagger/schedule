<script context="module">
    export const ssr = false;
</script>

<script>
    import { onMount } from "svelte";

    let loading = true;
    let error;
    let announcement;

    async function fetchAnnouncement() {
        loading = true;
        error = null;
        announcement = null;

        try {
            const response = await fetch(
                "https://script.google.com/macros/s/AKfycbzIUk99xyEvBo4dlj1ttc9jAI0Kl0yhC6uYZwVUD660-glxvHvk7tBcJNlmn6EfdwI-vw/exec"
            );
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            // let data = JSON.parse(fetched.contents);

            if (Array.isArray(data) && data.length > 0) {
                announcement = data[0];
            } else {
                announcement = null;
            }
        } catch (e) {
            error = e;
        } finally {
            loading = false;
        }
    }
    onMount(() => {
        fetchAnnouncement();
    });
</script>

<br />
<details>
    <summary>Announcements</summary>

    {#if loading}
        <p>Loading...</p>
    {:else if error}
        <p style="color:red">Error loading announcements: {error}</p>
    {:else if announcement}
        <p>
            <a href={announcement.link} target="_blank" rel="noopener">
                {announcement.name}
            </a>
        </p>
    {:else}
        <p>No announcement available.</p>
    {/if}

    <button on:click={fetchAnnouncement}>Refresh</button>
</details>

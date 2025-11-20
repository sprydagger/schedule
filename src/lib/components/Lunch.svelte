<script context="module">
    export const ssr = false;
</script>

<script>
    import { onMount } from "svelte";

    let rawData;
    let todayGrouped = [];
    let tomorrowGrouped = [];
    let error;
    let loading = true;

    function formatDate(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }

    function processData(raw, dayStr) {
        let meal = raw.data.find((m) => m.day === dayStr);
        if (!meal) return null;

        meal = JSON.parse(meal.setting);
        const grouped = [];
        let currentCategory;

        for (const item of meal.current_display) {
            if (item.type === "category") {
                currentCategory = { name: item.name, recipes: [] };
                grouped.push(currentCategory);
            } else if (item.type === "recipe" && currentCategory) {
                currentCategory.recipes.push(item.name);
            }
        }

        return grouped;
    }

    async function fetchLunch() {
        loading = true;
        error = null;
        rawData = null;
        todayGrouped = [];
        tomorrowGrouped = [];

        try {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;

            const response = await fetch(
                `https://api.allorigins.win/get?url=${encodeURIComponent(`https://menus.healthepro.com/api/organizations/2455/menus/108947/year/${year}/month/${month}/date_overwrites`)}`,
            );

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const fetched = await response.json();
            rawData = JSON.parse(fetched.contents);

            const today = formatDate(now);
            const tomorrow = formatDate(new Date(now.getTime() + 86400000));

            todayGrouped = processData(rawData, today);
            tomorrowGrouped = processData(rawData, tomorrow);
        } catch (e) {
            error = e.message;
            console.error(e);
        } finally {
            loading = false;
        }
    }

    onMount(fetchLunch);
</script>

<br />
<details>
    <summary>Lunch</summary>
    {#if loading}
        <p>Loading...</p>
    {:else if error}
        <p style="color:red">{error}</p>
    {:else if rawData}
        <div class="days">
            <div>
                <h3>Today</h3>
                {#if todayGrouped}
                    {#each todayGrouped as group}
                        <h4>{group.name}</h4>
                        <ul>
                            {#each group.recipes as r}
                                <li>{r}</li>
                            {/each}
                        </ul>
                    {/each}
                {:else}
                    <p>No data for today.</p>
                {/if}
            </div>

            <div>
                <h3>Tomorrow</h3>
                {#if tomorrowGrouped}
                    {#each tomorrowGrouped as group}
                        <h4>{group.name}</h4>
                        <ul>
                            {#each group.recipes as r}
                                <li>{r}</li>
                            {/each}
                        </ul>
                    {/each}
                {:else}
                    <p>No data for tomorrow.</p>
                {/if}
            </div>
        </div>
    {/if}
    <button on:click={fetchLunch}>Refresh</button>
</details>

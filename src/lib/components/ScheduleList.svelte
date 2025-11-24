<script>
    import { onMount, onDestroy } from "svelte";
    export let schedule = [];
    import dayjs from "dayjs";
    import customParseFormat from "dayjs/plugin/customParseFormat";
    import { get } from "svelte/store";
    import { classes } from "../stores/preferences";
    import { prefs } from "../stores/preferences";

    function swapObjectsInArray(arr, val1, val2) {
        const index1 = arr.findIndex((obj) => obj.period === val1);
        const index2 = arr.findIndex((obj) => obj.period === val2);

        [arr[index1], arr[index2]] = [arr[index2], arr[index1]];
        [
            arr[index1].start,
            arr[index2].start,
            arr[index1].end,
            arr[index2].end,
        ] = [
            arr[index2].start,
            arr[index1].start,
            arr[index2].end,
            arr[index1].end,
        ];

        return arr;
    }

    let altLunchSchedule = structuredClone(schedule);
    swapObjectsInArray(altLunchSchedule, "SH", "Lunch");

    $: _schedule = $prefs.seniorCitizen ? altLunchSchedule : schedule;

    dayjs.extend(customParseFormat);

    let now = dayjs();
    const timer = setInterval(() => {
        now = dayjs();
    }, 1000);

    function ordinal_suffix_of(i) {
        let j = i % 10,
            k = i % 100;
        if (j === 1 && k !== 11) {
            return i + "st";
        }
        if (j === 2 && k !== 12) {
            return i + "nd";
        }
        if (j === 3 && k !== 13) {
            return i + "rd";
        }
        return i + "th";
    }

    function isCurrentClass(item) {
        if (!item.start || !item.end) return false;

        const [startH, startM] = item.start.split(":").map(Number);
        const [endH, endM] = item.end.split(":").map(Number);

        const start = now.hour(startH).minute(startM).second(0);
        const end = now.hour(endH).minute(endM).second(0);

        return now.isAfter(start) && now.isBefore(end);
    }

    onDestroy(() => clearInterval(timer));

    $: highlighted = _schedule.map((item) => isCurrentClass(item, now));
</script>

<table id="schedule">
    <thead>
        <tr>
            <th>Period</th>
            <th style="width:70%">Class</th>
            <th>Start</th>
            <th>End</th>
        </tr>
    </thead>
    <tbody>
        {#each _schedule as item, i}
            <tr class={highlighted[i] ? "now" : ""}>
                <td>
                    {#if typeof item.period == "number"}
                        {ordinal_suffix_of(item.period)}
                    {:else}
                        {item.period}
                    {/if}
                </td>
                <td>
                    {#if item.type === "class"}
                        {$classes[item.period] || item.period}
                    {:else}
                        {item.label}
                    {/if}
                </td>
                <td>{item.start}</td>
                <td>{item.end}</td>
            </tr>
        {/each}
    </tbody>
</table>

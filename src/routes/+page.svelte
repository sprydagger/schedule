<script>
    import { PUBLIC_AVWX_TOKEN } from "$env/static/public";
    import Clock from "$lib/components/Clock.svelte";
    import ScheduleList from "$lib/components/ScheduleList.svelte";
    import RemainingTime from "$lib/components/RemainingTime.svelte";
    import sched_normal from "$lib/data/normal.json";
    import sched_sst from "$lib/data/sst.json";
    import dayjs from "dayjs";
    import Settings from "$lib/components/Settings.svelte";
    import Lunch from "$lib/components/Lunch.svelte";
    import Announcements from "$lib/components/Announcements.svelte";
    import Metar from "$lib/components/Metar.svelte";

    const schedule = dayjs().day() === 2 ? sched_sst : sched_normal;
</script>

<link
    href="https://fonts.googleapis.com/css2?family=PT+Mono"
    rel="stylesheet"
/>

<Clock />
<RemainingTime {schedule} />
<ScheduleList {schedule} />
<Lunch />
<Announcements />
<Settings />
<Metar apiKey={PUBLIC_AVWX_TOKEN} />

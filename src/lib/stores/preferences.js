import { persisted } from 'svelte-persisted-store'

export const classes = persisted('classes', {
    1: "AP Human Geography",
    2: "Honors English",
    3: "Symphonic Band",
    4: "AP Computer Science A",
    5: "Physical Education",
})

export const prefs = persisted('prefs', {
    seniorCitizen: false,
    airportCode: "KJVL"
})

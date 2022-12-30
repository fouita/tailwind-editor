<script>
    import PaddingIcon from "../Icons/PaddingIcon.svelte";
    import MarginIcon from "../Icons/MarginIcon.svelte";
    import TriangleDown from "../Icons/TriangleDown.svelte";
    import { PADDINGS } from "./const";
    import {createEventDispatcher} from 'svelte'
    const dispatch = createEventDispatcher()


    export let mp = "p"
    export let g_classes = ""
    export let title= "Padding"

    $: posKlass = lNode?.getBoundingClientRect()?.bottom > window.__edw.innerHeight ? 'bottom-0 mb-8' : '' 

	let lNode

    let open = false
    function toggleList(){
        open = !open
    }

    function updateP(e){
        dispatch('select', e.currentTarget.value)
    }

    $: v = 0 // mp == 'p' ? 2 : 0
    $: pt = g_classes.split(' ').find(s => s.startsWith(`${mp}t`)) || `${mp}t-${v}`
    $: pr = g_classes.split(' ').find(s => s.startsWith(`${mp}r`)) || `${mp}r-${v}`
    $: pb = g_classes.split(' ').find(s => s.startsWith(`${mp}b`)) || `${mp}b-${v}`
    $: pl = g_classes.split(' ').find(s => s.startsWith(`${mp}l`)) || `${mp}l-${v}`

</script>

<div class="relative h-full" {title}>
    <div class="px-2 text-gray-700 hover:bg-gray-200 cursor-pointer select-none hover:bg-gray-200 py-1 h-full flex items-center"  on:mousedown={toggleList}>
        {#if mp == "m"}
            <MarginIcon />
        {:else}
            <PaddingIcon />
        {/if}
        <TriangleDown />
    </div>
    {#if open}
        <div class="absolute shadow-xl bg-white grid grid-cols-2 w-24 p-2 gap-1 text-xs font-semibold {posKlass}" bind:this={lNode}>
                Top 
                <select class="focus:outline-none border" bind:value={pt} on:change={updateP} on:blur={updateP}>
                    {#each PADDINGS as p}
                        <option value="{mp}t-{p}">{p}</option>
                    {/each}
                </select>
                Right 
                <select class="focus:outline-none border" bind:value={pr} on:change={updateP} on:blur={updateP}>
                    {#each PADDINGS as p}
                        <option value="{mp}r-{p}">{p}</option>
                    {/each}
                </select>
                Bottom 
                <select class="focus:outline-none border" bind:value={pb} on:change={updateP} on:blur={updateP}>
                    {#each PADDINGS as p}
                        <option value="{mp}b-{p}">{p}</option>
                    {/each}
                </select>
                Left 
                <select class="focus:outline-none border" bind:value={pl} on:change={updateP} on:blur={updateP}>
                    {#each PADDINGS as p}
                        <option value="{mp}l-{p}">{p}</option>
                    {/each}
                </select>
        </div>
    {/if}
</div>


<script>
    import CenterIcon from "../Icons/CenterIcon.svelte";
    import LeftIcon from "../Icons/LeftIcon.svelte";
    import RightIcon from "../Icons/RightIcon.svelte";
    import TriangleDown from "../Icons/TriangleDown.svelte";
    import {createEventDispatcher} from 'svelte'
    import { STYLE } from "./const";
    const dispatch = createEventDispatcher()

    $: posKlass = lNode?.getBoundingClientRect()?.bottom > window.__edw.innerHeight ? 'bottom-0 mb-8' : '' 

	let lNode

    export let e_classes

    let open = false

    function toggleList(){
        open = !open
    }

    function select(pos){
        dispatch('select',pos)
    }
</script>

<div class="relative h-full">
    <div class="px-2 text-gray-700 hover:bg-gray-200 cursor-pointer select-none hover:bg-gray-200 py-1 h-full flex items-center"  on:mousedown={toggleList}>
        {#if e_classes.center}
            <CenterIcon />
        {:else if e_classes.right}
            <RightIcon />
        {:else}
            <LeftIcon />
        {/if}
        <TriangleDown />
    </div>
    
    {#if open}
        <div class="absolute shadow-xl {posKlass} bg-white" bind:this={lNode}>
            <div class="px-2 { e_classes.left ? 'text-blue-600':'text-gray-700'} cursor-pointer select-none hover:bg-gray-200 py-1 h-full flex items-center"  on:mousedown={() => select(STYLE.LEFT)}>
                <LeftIcon />
            </div>
            
            <div class="px-2 { e_classes.center ? 'text-blue-600':'text-gray-700'} cursor-pointer select-none hover:bg-gray-200 py-1 h-full flex items-center" on:mousedown={() => select(STYLE.CENTER)}>
                <CenterIcon />
            </div>
            
            <div class="px-2 { e_classes.right ? 'text-blue-600':'text-gray-700'} cursor-pointer select-none hover:bg-gray-200 py-1 h-full flex items-center border-r"  on:mousedown={() => select(STYLE.RIGHT)}>
                <RightIcon />
            </div>
        </div>
    {/if}
</div>